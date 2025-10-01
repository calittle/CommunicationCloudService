import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export function parseContentBlobs(baseDir) {
  const contentRoot = path.join(baseDir, 'contents');
  const usageMap = {}; // { fieldOrCondId: [ { type, contentId, versionId, raw } ] }

  for (const contentFolder of fs.readdirSync(contentRoot)) {
    const versionsDir = path.join(contentRoot, contentFolder, 'versions');
    if (!fs.existsSync(versionsDir)) continue;

    for (const versionFolder of fs.readdirSync(versionsDir)) {
      const versionPath = path.join(versionsDir, versionFolder);
      const files = fs.readdirSync(versionPath).filter(f => f.endsWith('.blob'));
      if (files.length !== 1) continue;
      const blobPath = path.join(versionPath, files[0]);
      const content = fs.readFileSync(blobPath, 'utf8');

      extractCommsTags(content, contentFolder, versionFolder, usageMap);
    }
  }

  return usageMap;
}

function extractCommsTags(html, contentId, versionId, usageMap) {
  const decoded = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"');

  const dataTagRegex = /<comms-data>(.*?)<\/comms-data>/g;
  const condTagRegex = /<comms-cond>\$Cond(.*?)<\/comms-cond>/g;

  let match;

  while ((match = dataTagRegex.exec(decoded))) {
    const inner = match[1];
    const innerDataMatches = inner.match(/\$Data\s*({.*?})/g);
    if (!innerDataMatches) continue;

    for (const sub of innerDataMatches) {
      let jsonStr = sub.replace(/^\$Data\s*/, '');
      // replace smart quotes and double-escaped characters
      jsonStr = jsonStr.replace(/[“”]/g, '"').replace(/\\"/g, '"');
      jsonStr = jsonStr.replace(/^"|"$/g, ''); // remove surrounding quotes
      jsonStr = jsonStr.replace(/""/g, '"'); // normalize double quotes
      try {
        const json = JSON.parse(jsonStr);
        const id = json.Id;
        if (!id) continue;
        if (!usageMap[id]) usageMap[id] = [];
        usageMap[id].push({ type: 'data', contentId, versionId, raw: json });
      } catch (err) {
        console.error(err);
        console.warn(chalk.yellow(`⚠️ Failed to parse <comms-data> in content ${contentId}/${versionId}: ${jsonStr}`));
      }
    }
  }

  while ((match = condTagRegex.exec(decoded))) {
    try {
      const json = JSON.parse(match[1]);
      const cond = json.Condition;
      if (!cond) continue;
      if (!usageMap[cond]) usageMap[cond] = [];
      usageMap[cond].push({ type: 'cond', contentId, versionId, raw: json });
    } catch (err) {
      console.warn(chalk.yellow(`⚠️ Failed to parse <comms-cond>: ${match[1]}`));
    }
  }
}