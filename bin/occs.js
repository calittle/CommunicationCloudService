#!/usr/bin/env node
import { Command } from 'commander';
import loginCommand from '../lib/auth.js';
import { listDocumentsCommand } from '../lib/documents.js';
import { listPackagesCommand } from '../lib/packages.js';
import { listLayoutsCommand } from '../lib/layouts.js';
import { listContentsCommand } from '../lib/contents.js';
import { listStylesCommand } from '../lib/styles.js';
import { listFontsCommand } from '../lib/fonts.js';
import { catalogCommand } from '../lib/catalog.js';
import { crossrefCommand } from '../lib/crossRef.js';
import { graphCommand } from '../lib/graph.js';
import { listCompaniesCommand } from '../lib/companies.js';
import { listConfigsCommand } from '../lib/configs.js';

const program = new Command();
function showBanner() {
  console.log('');
  console.log('OCCS CLI 0.1.0');
  console.log('');
}
program
  .name('occs')
  .description('Oracle CCS CLI utility')
  .version('0.1.0');

program
  .command('list-companies')
  .description('Generate list of companies')
  .option('-o, --output <dir>', 'Path to output folder')  
  .action(listCompaniesCommand);

program
  .command('list-configs')
  .description('Generate list of open configuration IDs')
  .option('-o, --output <dir>', 'Path to output folder')  
  .action(listConfigsCommand);


  program
  .command('report-catalog')
  .description('Generate flat catalog of all CCS components')
  .option('-o, --output <dir>', 'Path to output folder', './output')  
  .action(catalogCommand);

program
  .command('report-xref')
  .description('Generate cross reference of all CCS components')
  .option('-o, --output <dir>', 'Path to output folder', './output')
  .action(crossrefCommand);

program
  .command('graph')
  .description('Generate a .DOT file for GraphViz')
  .option('-o, --output <dir>', 'Path to output folder', './output')
  .option('-d, --document <documentName>', 'Document to graph' )
  .option('-s,--styles', 'Include Styles in graph - WARNING: may produce a busy graph.')
  .option('-f,--fields', 'Include Fields in graph - WARNING: may produce a busy graph.')
  .action(graphCommand);


program
  .command('login')
  .description('Log in to Oracle CCS and store session')
  .requiredOption('-u, --username <username>', 'Username')
  .requiredOption('-p, --password <password>', 'Password')
  .requiredOption('-c, --customer <customer>', 'Customer short name')
  .requiredOption('-r, --region <region>', 'Oracle region')
  .requiredOption('-t, --tenancy <tenancy>', 'Tenancy path')
  .action(loginCommand);


program
  .command('get-everything')
  .description('Get everything from Oracle CCS')
  .option('-o, --output <dir>', 'Output directory to dump package data')
  .option('-v, --verbose', 'Verbose logging')
  .action(async (cmd) => {
    await listPackagesCommand(cmd);
    await listDocumentsCommand(cmd);    
    await listLayoutsCommand(cmd);
    await listContentsCommand(cmd);
    await listFontsCommand(cmd);
    await listStylesCommand(cmd);
    console.log("(>'-')> ✨ Done!\n");
  });

program
  .command('list-packages')
  .description('List communication packages from Oracle CCS')
  .option('-o, --output <dir>', 'Output directory to dump package data')
  .option('-v, --verbose', 'Verbose logging')
  .action(listPackagesCommand);

program
  .command('list-fonts')
  .description('List fonts from Oracle CCS')
  .option('-o, --output <dir>', 'Output directory to dump package data')
  .option('-v, --verbose', 'Verbose logging')
  .action(listFontsCommand);


program
  .command('list-styles')
  .description('List communication styles from Oracle CCS')
  .option('-o, --output <dir>', 'Output directory to dump style data')
  .option('-v, --verbose', 'Verbose logging')
  .action(listStylesCommand);

program
  .command('list-documents')
  .description('List documents from Oracle CCS')
  .option('-o, --output <dir>', 'Output directory to dump document data')
  .option('-v, --verbose', 'Verbose logging')
  .action(listDocumentsCommand);

program
  .command('list-layouts')
  .description('List layouts from Oracle CCS')
  .option('-o, --output <dir>', 'Output directory to dump layout data')
  .option('-v, --verbose', 'Verbose logging')
  .action(listLayoutsCommand);

  program
  .command('list-contents')
  .description('List contents from Oracle CCS')
  .option('-o, --output <dir>', 'Output directory to dump content data')
  .option('-v, --verbose', 'Verbose logging')
  .action(listContentsCommand);

showBanner();
program.parse();
