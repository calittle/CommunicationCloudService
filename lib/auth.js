import axios from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';
import chalk from 'chalk';
import { handleAxiosError } from './errorHandler.js';

const SESSION_PATH = path.join(os.homedir(), '.occs-session.json');
function extractOracleCapError(html) {
  const match = html.match(/<div id="errorMsg">\s*(.*?)\s*<\/div>/i);
  if (match && match[1]) {
    return match[1].replace(/<[^>]+>/g, '').trim();
  }
  return null;
}
export default async function loginCommand(opts) {
  const { username, password, customer, region, tenancy } = opts;

  const baseUrl = `https://${customer}.${region}.oraclecloud.com/${tenancy}`;
  const loginUrl = `${baseUrl}/api/oauth2/v1/access`;
  console.log(`(>'-')> Logging in ${chalk.cyan(loginUrl)}...`);

  try {
    const res = await axios.post(loginUrl, {
      User: username,
      Password: password
    }, {
      headers: 
        { 
            'Accept': 'application/json', 
            'Content-Type': 'application/json' 
        }
    });

    const token = res.data.AccessToken;
    if (!token) {
      throw new Error('No token returned from Oracle.');
    }

    const session = {
      token,
      baseUrl,
      customer,
      region,
      tenancy,
      savedAt: new Date().toISOString()
    };

    fs.writeFileSync(SESSION_PATH, JSON.stringify(session, null, 2));
    console.log(`${chalk.green('✅ Login successful.')}`);
    console.log(`Session saved to ${chalk.gray(SESSION_PATH)}`);
  } catch (err) {
    handleAxiosError(err, 'Login failed');
    process.exit(1);
  }
}