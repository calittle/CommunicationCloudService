import axios from 'axios';
import fs from 'fs';
import chalk from 'chalk';

export async function downloadFont(session, location, destPath, verbose = false) {
  const relativePath = location.startsWith('CommunicationDocument/v1/')
  ? location
  : `CommunicationDocument/v1/${location}`;

  const fullUrl = `${session.baseUrl.replace(/\/$/, '')}/api/${relativePath}`;
    
  if (verbose) console.log(chalk.blue('📦 Font URL:'), fullUrl);
  try {
    const res = await axios.get(fullUrl, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      responseType: 'arraybuffer',
      timeout: 10000,
    });

    fs.writeFileSync(destPath, res.data);
    
    if (verbose) console.log(chalk.gray(`✔ Downloaded font to ${destPath}`));
  } catch (err) {
    console.error(chalk.red(`❌ Failed to download font from ${location}`));
    if (verbose) {
      if (err.response) {
        console.error(`Status: ${err.response.status}`);
        console.error(err.response.data);
      } else {
        console.error(err.message);
      }
    }
    process.exit(1);
  }
}


export async function downloadBlob(session, location, destPath, verbose = false) {
  const relativePath = location.startsWith('CommunicationContent/v1/')
  ? location
  : `CommunicationContent/v1/${location}`;

  const fullUrl = `${session.baseUrl.replace(/\/$/, '')}/api/${relativePath}`;
    
  if (verbose) console.log(chalk.blue('📦 Blob URL:'), fullUrl);
  try {
    const res = await axios.get(fullUrl, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      responseType: 'arraybuffer',
      timeout: 10000,
    });

    fs.writeFileSync(destPath, res.data);
    
    if (verbose) console.log(chalk.gray(`✔ Downloaded blob to ${destPath}`));
  } catch (err) {
    console.error(chalk.red(`❌ Failed to download blob from ${location}`));
    if (verbose) {
      if (err.response) {
        console.error(`Status: ${err.response.status}`);
        console.error(err.response.data);
      } else {
        console.error(err.message);
      }
    }
    process.exit(1);
  }
}
