import chalk from 'chalk';
import { loadConfig } from '../config.js';

export function listCommand(): void {
  const config = loadConfig();
  const groupNames = Object.keys(config.groups);

  if (groupNames.length === 0) {
    console.log(chalk.yellow('No groups configured yet.'));
    console.log(chalk.gray('Use: projects add'));
    return;
  }

  console.log(chalk.cyan('\n📁 Project Groups:\n'));
  for (const name of groupNames) {
    const group = config.groups[name];
    console.log(chalk.bold(name));
    console.log(chalk.gray(`  Base: ${group.base}`));
    console.log(chalk.gray(`  Projects: ${group.projects.length}`));
    console.log();
  }
}
