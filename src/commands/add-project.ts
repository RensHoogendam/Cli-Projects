import chalk from 'chalk';
import { loadConfig, saveConfig } from '../config';
import { Config } from '../types';

/**
 * Add a project to an existing group
 */
function addProjectToGroup(config: Config, groupName: string, projectName: string): void {
  if (!config.groups[groupName]) {
    throw new Error(`Group '${groupName}' does not exist`);
  }
  
  const group = config.groups[groupName];
  
  if (group.projects.includes(projectName)) {
    throw new Error(`Project '${projectName}' already exists in group '${groupName}'`);
  }
  
  group.projects.push(projectName);
}

export function addProjectCommand(groupName: string, projectName: string | undefined): void {
  const config = loadConfig();
  
  // Auto-detect project name from current directory if not provided
  const finalProjectName = projectName || process.cwd().split('/').pop() || '';
  
  if (!finalProjectName) {
    console.error(chalk.red('✗ Error:'), 'Could not determine project name');
    process.exit(1);
  }
  
  addProjectToGroup(config, groupName, finalProjectName);
  saveConfig(config);

  console.log(chalk.green(`✓ Added project: ${finalProjectName}`));
  console.log(chalk.gray(`  Group: ${groupName}`));
}
