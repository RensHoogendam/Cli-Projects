import chalk from 'chalk';
import inquirer from 'inquirer';
import { loadConfig, saveConfig } from '../config.js';

interface ClearOptions {
  yes?: boolean;
}

export async function clearCommand(options: ClearOptions): Promise<void> {
  const config = loadConfig();
  const groupCount = Object.keys(config.groups).length;

  if (groupCount === 0) {
    console.log(chalk.yellow('Config is already empty.'));
    return;
  }

  let confirmed = options.yes;

  if (!confirmed) {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `This will delete all ${groupCount} group(s). Are you sure?`,
        default: false,
      },
    ]);
    confirmed = answer.confirm;
  }

  if (!confirmed) {
    console.log(chalk.gray('Cancelled.'));
    return;
  }

  config.groups = {};
  saveConfig(config);

  console.log(chalk.green('✓ Config cleared successfully'));
}
