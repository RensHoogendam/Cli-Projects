import chalk from 'chalk';
import { loadConfig } from '../config.js';
import { runCommandInProjects } from '../runner.js';

interface RunOptions {
  cd?: boolean;
  dryRun?: boolean;
}

export async function runCommand(
  groupName: string,
  commandParts: string[],
  options: RunOptions
): Promise<void> {
  const config = loadConfig();
  const group = config.groups[groupName];

  if (!group) {
    console.error(chalk.red('✗ Error:'), `Group not found: ${groupName}`);
    process.exit(1);
  }

  if (!commandParts || commandParts.length === 0) {
    console.error(chalk.red('✗ Error:'), 'No command provided');
    process.exit(1);
  }

  // Join command parts, handle quotes
  let command = commandParts.join(' ');
  
  // Remove surrounding quotes if present
  if ((command.startsWith("'") && command.endsWith("'")) || 
      (command.startsWith('"') && command.endsWith('"'))) {
    command = command.slice(1, -1);
  }

  await runCommandInProjects(group, command, {
    noCd: !options.cd,
    dryRun: options.dryRun,
  });
}
