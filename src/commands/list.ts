import chalk from 'chalk';
import { existsSync } from 'fs';
import { join } from 'path';
import { loadConfig } from '../config.js';

export function listCommand(groupName?: string): void {
  const config = loadConfig();
  const groupNames = Object.keys(config.groups);

  if (groupNames.length === 0) {
    console.log(chalk.yellow('No groups configured yet.'));
    console.log(chalk.gray('Use: projects add'));
    return;
  }

  // If group name provided, show details for that group
  if (groupName) {
    const group = config.groups[groupName];

    if (!group) {
      throw new Error(`Group not found: ${groupName}`);
    }

    console.log(chalk.cyan(`\n📁 Group: ${chalk.bold(groupName)}\n`));
    console.log(chalk.gray(`Base: ${group.base}`));
    console.log(chalk.gray(`Projects: ${group.projects.length}\n`));

    if (group.projects.length === 0) {
      console.log(chalk.yellow('No projects in this group.'));
      return;
    }

    for (const project of group.projects) {
      const projectPath = join(group.base, project);
      const exists = existsSync(projectPath);
      const icon = exists ? chalk.green('✓') : chalk.red('✗');
      console.log(`  ${icon} ${project}`);
    }
    console.log();
    return;
  }

  // Otherwise, show all groups (summary)
  console.log(chalk.cyan('\n📁 Project Groups:\n'));
  for (const name of groupNames) {
    const group = config.groups[name];
    console.log(chalk.bold(name));
    console.log(chalk.gray(`  Base: ${group.base}`));
    console.log(chalk.gray(`  Projects: ${group.projects.length}`));
    console.log();
  }
}
