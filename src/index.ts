#!/usr/bin/env node

import { Command } from 'commander';
import { setupCompletions } from './completion';
import { initCommand } from './commands/init';
import { addCommand } from './commands/add';
import { addProjectCommand } from './commands/add-project';
import { deleteCommand } from './commands/delete';
import { clearCommand } from './commands/clear';
import { listCommand } from './commands/list';
import { runCommand } from './commands/run';
import { completionCommand } from './commands/completion';
import { manageCommand } from './commands/manage';
import { withErrorHandling } from './utils/error-handler';

const program = new Command();

program
  .name('projects')
  .description('Execute commands across multiple projects')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize configuration file')
  .action(withErrorHandling(initCommand));

program
  .command('completion [action]')
  .description('Manage shell completions (install/uninstall)')
  .action(withErrorHandling(completionCommand));

program
  .command('add [group-name] [base-path]')
  .description('Add a new project group (interactive if no arguments)')
  .option('-s, --scan', 'Auto-scan and add all directories as projects')
  .action(withErrorHandling(addCommand));

program
  .command('add-project <group> [project]')
  .description('Add a project to a group (uses current directory if not provided)')
  .action(withErrorHandling(addProjectCommand));

program
  .command('delete <group>')
  .description('Delete a project group')
  .action(withErrorHandling(deleteCommand));

program
  .command('clear')
  .description('Clear all groups from config')
  .option('-y, --yes', 'Skip confirmation prompt')
  .action(withErrorHandling(clearCommand));

program
  .command('list [group]')
  .description('List all project groups, or show details of a specific group')
  .action(withErrorHandling(listCommand));

program
  .command('manage [group] [project]')
  .description('Interactively manage a group or project')
  .action(withErrorHandling(manageCommand));

program
  .command('run <group> [command...]')
  .description('Run a command across all projects in a group')
  .option('-n, --no-cd', 'Run from base directory (not in each project)')
  .option('-d, --dry-run', 'Show what would be executed without running')
  .action(withErrorHandling(runCommand));
  

setupCompletions(program);
program.parse();

