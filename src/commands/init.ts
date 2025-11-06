import chalk from 'chalk';
import { initConfig, getConfigPath } from '../config.js';

export function initCommand(): void {
  initConfig();
  console.log(chalk.green('✓ Configuration initialized!'));
  console.log(chalk.gray(`Config file: ${getConfigPath()}`));
  console.log(chalk.cyan('\nNext steps:'));
  console.log(chalk.gray('  1. Add a group: projects add'));
  console.log(chalk.gray('  2. List groups: projects list'));
}
