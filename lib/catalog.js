import fs from 'fs';
import path from 'path';
import { parseJSONFilesInDir, writeCSV, setDir } from './utils.js';

export async function catalogCommand(cmd) {
  const baseDir = cmd.output || './output';
  const reportDir = path.join(baseDir, 'catalog');
  setDir(reportDir);

  const extract = (obj, keys) => keys.map(k => obj?.[k] ?? '');

// ---------- Documents ----------
    const documentRows = [];
    const docRoot = path.join(baseDir, 'documents');

    for (const docFolder of fs.readdirSync(docRoot)) {
        // process master
        const masterPath = path.join(docRoot, docFolder, `${docFolder}_master.json`);
        if (!fs.existsSync(masterPath)) continue;

        try {
            const data = JSON.parse(fs.readFileSync(masterPath));
            const info = data.CommunicationDocumentConfigRec?.CommunicationDocumentConfigInfo || {};
            const uuid = data.CommunicationDocumentConfigRec?.CommunicationDocumentConfigUuid || '';
            const row = extract(info, ['Name', 'ShortName', 'Desc']);
            if (row[1]) documentRows.push([...row, '', 'master', uuid]); // leave RenderingType blank
        } catch (err) {
            console.warn(`⚠️ Failed to parse master: ${masterPath}`);
        }

        // process versions
        const versionsDir = path.join(docRoot, docFolder, 'versions');
        if (!fs.existsSync(versionsDir) || !fs.statSync(versionsDir).isDirectory()) continue;

        for (const versionFile of fs.readdirSync(versionsDir)) {
            if (!versionFile.endsWith('.json')) continue;
            const filePath = path.join(versionsDir, versionFile);

            try {
            const data = JSON.parse(fs.readFileSync(filePath));
            const info = data.CommunicationDocumentVersionConfigRec?.CommunicationDocumentVersionConfigInfo || {};
            const uuid = data.CommunicationDocumentVersionConfigRec?.CommunicationDocumentVersionConfigUuid || '';
            const row = extract(info, ['ShortName', 'Desc', 'RenderingType']);
            if (row[0]) documentRows.push(['', ...row, 'version', uuid]); // no Name for versions
            } catch (err) {
            console.warn(`⚠️ Failed to parse version: ${filePath}`);
            }
        }
    }

    writeCSV(
    path.join(reportDir, 'documents.csv'),
    ['Name', 'ShortName', 'Desc', 'RenderingType', 'Type','UUID'],
    documentRows
    );
// ---------- Layouts ----------
    const layoutRows = [];
    const layoutRoot = path.join(baseDir, 'layouts');
    for (const folder of fs.readdirSync(layoutRoot)) {
        const filePath = path.join(layoutRoot, folder, `${folder}.json`);
        if (!fs.existsSync(filePath)) continue;
        const data = JSON.parse(fs.readFileSync(filePath));
        const info = data.CommunicationLayoutConfigRec?.CommunicationLayoutConfigInfo || {};
        const uuid = data.CommunicationLayoutConfigRec?.CommunicationLayoutConfigUuid || '';
        const row = extract(info, ['Name', 'ShortName', 'Desc', 'LayoutType', 'StyleClassName']);
        if (row[1]) layoutRows.push([...row, uuid]); // ShortName exists
    }
    writeCSV(path.join(reportDir, 'layouts.csv'), ['Name', 'ShortName', 'Desc', 'LayoutType', 'StyleClassName', 'UUID'], layoutRows);

// ---------- Styles ----------
    const styleRows = [];
    const styleRoot = path.join(baseDir, 'styles');
    for (const folder of fs.readdirSync(styleRoot)) {
        const filePath = path.join(styleRoot, folder, `${folder}.json`);
        if (!fs.existsSync(filePath)) continue;
        const data = JSON.parse(fs.readFileSync(filePath));
        const info = data.CommunicationStyleConfigRec?.CommunicationStyleConfigInfo || {};
        const uuid = data.CommunicationStyleConfigRec?.CommunicationStyleConfigUuid || '';
        const row = extract(info, ['Name', 'ShortName', 'Desc']);
        if (row[1]) styleRows.push([...row, uuid]); // ShortName exists
    }
    writeCSV(path.join(reportDir, 'styles.csv'), ['Name', 'ShortName', 'Desc', 'UUID'], styleRows);

// ---------- Contents ----------
    const contentRows = [];
    const contentRoot = path.join(baseDir, 'contents');

    for (const contentFolder of fs.readdirSync(contentRoot)) {
    // process master
    const masterPath = path.join(contentRoot, contentFolder, `${contentFolder}_master.json`);
    if (!fs.existsSync(masterPath)) continue;

    try {
        const data = JSON.parse(fs.readFileSync(masterPath));
        const info = data.CommunicationContentConfigRec?.CommunicationContentConfigInfo || {};
        const uuid = data.CommunicationContentConfigRec?.CommunicationContentConfigUuid || '';
        const row = extract(info, ['Name', 'ShortName', 'Desc', 'ContentType']);
        if (row[1]) contentRows.push([...row, 'master', uuid]);
    } catch (err) {
        console.warn(`⚠️ Failed to parse content master: ${masterPath}`);
    }

    // process versions
    const versionsDir = path.join(contentRoot, contentFolder, 'versions');
    if (!fs.existsSync(versionsDir) || !fs.statSync(versionsDir).isDirectory()) continue;

    for (const versionFolder of fs.readdirSync(versionsDir)) {
        const versionPath = path.join(versionsDir, versionFolder, `${versionFolder}.json`);
        if (!fs.existsSync(versionPath)) continue;

        try {
            const data = JSON.parse(fs.readFileSync(versionPath));
            const info = data.CommunicationContentVersionConfigInfo || {};
            const uuid = info.CommunicationContentConfigUuid || '';
            const row = extract(info, ['ShortName', 'Desc', 'Language']);
            if (row[0]) contentRows.push(['', ...row, 'version',uuid]); // no Name for versions
        } catch (err) {
            console.warn(`⚠️ Failed to parse version: ${versionPath}`);
        }
    }
    }

    writeCSV(
    path.join(reportDir, 'contents.csv'),
    ['Name', 'ShortName', 'Desc', 'Language', 'Type','UUID'],
    contentRows
    );
// ---------- Packages and Fields (from AssemblyTemplate) ----------
    const fieldRows = [];
    const packageRows = [];
    const pkgDocRows = [];
    const layoutHeadings = 0;
    const pkgRoot = path.join(baseDir, 'packages');
    for (const pkgFolder of fs.readdirSync(pkgRoot)){
        // process the master
        const masterPath = path.join(pkgRoot, pkgFolder, `${pkgFolder}_master.json`);
        if (!fs.existsSync(masterPath)) continue;
        try {
            const data = JSON.parse(fs.readFileSync(masterPath));
            const info = data.CommunicationPackageConfigRec?.CommunicationPackageConfigInfo || {};
            const uuid =  data.CommunicationPackageConfigRec?.CommunicationPackageConfigUuid || '';
            const row = extract(info, ['Name','ShortName','Desc']);
            if (row[1]) packageRows.push([...row,'', 'master',uuid]); // no CommunicationPackageOutputTitle for master
        }catch (err){
            console.warn(`⚠️ Failed to parse master: ${masterPath}`);
        }

        // process versions
        const versionsDir = path.join(pkgRoot, pkgFolder, 'versions');
        if (!fs.existsSync(versionsDir) || !fs.statSync(versionsDir).isDirectory()) continue;
        for (const versionFolder of fs.readdirSync(versionsDir)) {
            const atPath = path.join(versionsDir, versionFolder, 'AssemblyTemplate.json');
            if (fs.existsSync(atPath)){                
                const data = JSON.parse(fs.readFileSync(atPath));
                const pkg = data.$$Id || 'unknown';
                const fieldDefs = data.Fields || [];
                for (const field of fieldDefs) {
                    const name = field.Name || '';
                    const path = field.Path || '';
                    const reqd = field.Mandatory || '';
                    if (name && path) fieldRows.push([pkg, name, reqd, path]);
                }
                if (data.Documents) {
                  for (const doc of data.Documents) {
                    const docId = doc["$$Id"] || '';
                    const docCond = doc.Condition || '';
                    const layouts = doc.Layouts || [];
                    for (const layout of layouts) {
                      const layoutId = layout["$$Id"] || '';
                      const contents = layout.Contents || [];
                      for (const content of contents) {
                        const contentId = content["$$Id"] || '';
                        const contentCond = content.Condition || '';
                        const iteration = content.Iteration || {};
                        if (iteration.Type) {
                          const iterId = iteration["$$Id"] || '';
                          const iterType = iteration.Type || '';
                          const iterPath = iteration.Path || '';
                          const fields = iteration.Fields || [];
                          for (const field of fields) {
                            pkgDocRows.push([
                              pkg,
                              versionFolder,
                              docId,
                              layoutId,
                              contentId,
                              iterId,
                              iterType,
                              iterPath,
                              field.Name || '',
                              field.Path || '',
                              contentCond || docCond
                            ]);
                          }
                        } else {
                          pkgDocRows.push([
                            pkg,
                            versionFolder,
                            docId,
                            layoutId,
                            contentId,
                            '',
                            '',
                            '',
                            '',
                            '',
                            contentCond || docCond
                          ]);
                        }
                      }
                    }
                  }
                }
            }
            const versionPath = path.join(versionsDir, versionFolder, `${versionFolder}.json`);
            if (fs.existsSync(versionPath)){                
                const data = JSON.parse(fs.readFileSync(versionPath));
                try {                
                    const info = data.CommunicationPackageVersionConfigInfo || {};
                    const row = extract(info, ['ShortName', 'Desc', 'CommunicationPackageOutputTitle']);
                    const uuid = data.CommunicationPackageVersionConfigUuid || '';
                    if (row[0]) packageRows.push(['', ...row, 'version',uuid]); // no Name for versions
                } catch (err) {
                    console.warn(`⚠️ Failed to parse version: ${filePath}`);
                }    
            }
        }
    }
    writeCSV(
      path.join(reportDir, 'package_docs.csv'),
      ['Package', 'Version', 'DocumentId', 'LayoutId', 'ContentId', 'IterationId', 'IterationType', 'IterationPath', 'FieldName', 'FieldPath', 'Condition'],
      pkgDocRows
    );
    writeCSV(path.join(reportDir, 'packages.csv'), ['Name', 'ShortName', 'Desc','title','type','UUID'], packageRows);
    writeCSV(path.join(reportDir, 'fields.csv'), ['Package','Name', 'Mandatory', 'Path'], fieldRows);


  console.log(`✅ Wrote catalog reports to ${reportDir}`);
}