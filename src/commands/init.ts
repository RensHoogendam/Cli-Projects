import chalk from 'chalk';
import inquirer from 'inquirer';
import { initConfig, getConfigPath } from '../config.js';
import { installCompletion } from '../completion.js';

export async function initCommand(): Promise<void> {
  initConfig();
  console.log(chalk.green('✓ Configuration initialized!'));
  console.log(chalk.gray(`Config file: ${getConfigPath()}`));
  
  // Ask if user wants to install completions
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installCompletion',
      message: 'Would you like to install shell completions for tab completion?',
      default: true,
    }
  ]);

  if (answer.installCompletion) {
    await installCompletion();
  }

  console.log(chalk.cyan('\nNext steps:'));
  console.log(chalk.gray('  1. Add a group: projects add'));
  console.log(chalk.gray('  2. List groups: projects list'));
}
