import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';
import { Group } from '../types';
import { join } from 'path';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

interface RunOptions {
  noCd?: boolean;
  dryRun?: boolean;
}

export async function runCommandInProjects(
  group: Group,
  command: string,
  options: RunOptions = {}
): Promise<void> {
  const { noCd = false, dryRun = false } = options;
  const projects = group.projects;

  console.log(chalk.cyan(`\n🚀 Running in group: ${chalk.bold(group.base)}`));
  console.log(chalk.gray(`Command: ${command}`));
  console.log(chalk.gray(`Projects: ${projects.length}\n`));

  for (const project of projects) {
    const projectPath = join(group.base, project);
    
    // Check if project exists
    if (!existsSync(projectPath)) {
      console.log(chalk.yellow(`⚠️  ${project}: ${chalk.gray('Directory not found, skipping...')}`));
      continue;
    }

    // Replace environment variables
    const processedCommand = command
      .replace(/\$\{PROJECT\}/g, project)
      .replace(/\$\{PROJECT_PATH\}/g, projectPath)
      .replace(/\$\{PROJECT_BASE\}/g, group.base);

    const fullCommand = noCd 
      ? processedCommand 
      : `cd "${projectPath}" && ${processedCommand}`;

    if (dryRun) {
      console.log(chalk.blue(`[DRY RUN] ${project}:`));
      console.log(chalk.gray(`  ${fullCommand}\n`));
      continue;
    }

    const spinner = ora(`${project}`).start();

    try {
      const { stdout, stderr } = await execAsync(fullCommand, {
        shell: '/bin/zsh',
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      });

      if (stdout.trim()) {
        spinner.succeed(chalk.green(`${project}`));
        console.log(chalk.gray(stdout.trim()));
      } else {
        spinner.succeed(chalk.green(`${project}`));
      }

      if (stderr.trim()) {
        console.log(chalk.yellow(stderr.trim()));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`${project}`));
      console.log(chalk.red(`  Error: ${error.message}`));
      if (error.stdout) console.log(chalk.gray(error.stdout));
      if (error.stderr) console.log(chalk.yellow(error.stderr));
    }

    console.log(); // Empty line between projects
  }

  console.log(chalk.cyan(`✨ Completed!\n`));
}
