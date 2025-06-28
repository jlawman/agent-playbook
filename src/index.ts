#!/usr/bin/env node
import { program } from 'commander';
import { newCommand } from './commands/new.js';
import { resumeCommand } from './commands/resume.js';
import { listCommand } from './commands/list.js';
import { exportCommand } from './commands/export.js';
import { cleanCommand } from './commands/clean.js';
import { configCommand } from './commands/config.js';
import { ui } from './lib/ui.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get package.json for version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

// Main program configuration
program
  .name('agent-playbook')
  .description('AI-powered agent playbook generator')
  .version(packageJson.version)
  .addHelpText(
    'after',
    `
Examples:
  $ agent-playbook new                    Start a new agent playbook
  $ agent-playbook new -i "My idea"       Start with a predefined idea
  $ agent-playbook resume                 Resume a previous session
  $ agent-playbook list                   List all sessions
  $ agent-playbook export abc123          Export a specific session
  $ agent-playbook config                 View configuration

For more information, visit: https://github.com/jlawman/agent-playbook`
  );

// New command
program
  .command('new')
  .description('Start a new agent playbook')
  .option('-i, --idea <idea>', 'Agent idea to start with')
  .option('-s, --skip-questions', 'Skip configuration questions and use defaults')
  .action(newCommand);

// Resume command
program.command('resume').description('Resume a previous session').action(resumeCommand);

// List command
program.command('list').alias('ls').description('List all sessions').action(listCommand);

// Export command
program
  .command('export [sessionId]')
  .description('Export a session to markdown or JSON')
  .option('-f, --format <format>', 'Export format: markdown, json, or both')
  .action(exportCommand);

// Clean command
program
  .command('clean')
  .description('Clean old sessions')
  .option('-d, --days <days>', 'Keep sessions newer than this many days', '30')
  .option('-f, --force', 'Skip confirmation prompt')
  .action(cleanCommand);

// Config command
program
  .command('config [action]')
  .description('Manage configuration (reset, keys)')
  .action(configCommand);

// Default action (show interactive menu)
program.action(async () => {
  ui.welcome();

  const inquirer = (await import('inquirer')).default;
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '🚀 Start a new agent playbook', value: 'new' },
        { name: '📂 Resume a previous session', value: 'resume' },
        { name: '📋 List all sessions', value: 'list' },
        { name: '⚙️  Configuration', value: 'config' },
        new inquirer.Separator(),
        { name: '❌ Exit', value: 'exit' },
      ],
    },
  ]);

  switch (action) {
    case 'new':
      await newCommand({});
      break;
    case 'resume':
      await resumeCommand();
      break;
    case 'list':
      await listCommand();
      break;
    case 'config':
      await configCommand();
      break;
    case 'exit':
      ui.goodbye();
      break;
  }
});

// Error handling
process.on('unhandledRejection', (error) => {
  ui.errorMsg(`Unexpected error: ${error}`);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log();
  ui.warningMsg('Interrupted. Session saved.');
  process.exit(0);
});

// Parse arguments
program.parse(process.argv);
