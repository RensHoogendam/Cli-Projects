import chalk from 'chalk';
import { existsSync } from 'fs';
import { join } from 'path';
import { loadConfig } from '../config.js';

export function showCommand(groupName: string): void {
  const config = loadConfig();
  const group = config.groups[groupName];

  if (!group) {
    console.error(chalk.red('✗ Error:'), `Group not found: ${groupName}`);
    process.exit(1);
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
}
