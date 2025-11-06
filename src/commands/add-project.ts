import chalk from 'chalk';
import { loadConfig, saveConfig, addProjectToGroup } from '../config.js';

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
