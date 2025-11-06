import chalk from 'chalk';
import { loadConfig, saveConfig } from '../config';

export function deleteCommand(groupName: string): void {
  const config = loadConfig();
  
  if (!config.groups[groupName]) {
    console.error(chalk.red('✗ Error:'), `Group not found: ${groupName}`);
    process.exit(1);
  }

  delete config.groups[groupName];
  saveConfig(config);

  console.log(chalk.green(`✓ Deleted group: ${groupName}`));
}
