/**
 * Command handlers for CLI Projects
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import {
  loadConfig,
  saveConfig,
  initConfig,
  addGroup,
  addProjectToGroup,
  getConfigPath
} from './config.js';
import { runCommandInProjects } from './runner.js';

export async function handleInit() {
  try {
    initConfig();
    console.log(chalk.green('✓ Configuration initialized!'));
    console.log(chalk.gray(`Config file: ${getConfigPath()}`));
    console.log(chalk.cyan('\nNext steps:'));
    console.log(chalk.gray('  1. Add a group: projects add'));
    console.log(chalk.gray('  2. List groups: projects list'));
  } catch (error: any) {
    console.error(chalk.red('✗ Error:'), error.message);
    process.exit(1);
  }
}

export async function handleAdd(
  groupName: string | undefined,
  basePath: string | undefined,
  options: { scan?: boolean }
) {
  try {
    const config = loadConfig();
    const targetPath = basePath || process.cwd();
    const expandedPath = targetPath.replace(/^~/, process.env.HOME || '~');

    if (!existsSync(expandedPath)) {
      console.error(chalk.red('✗ Error:'), `Directory not found: ${targetPath}`);
      process.exit(1);
    }

    let finalGroupName = groupName;
    let projects: string[] = [];

    // Interactive mode if no group name provided
    if (!finalGroupName) {
      console.log(chalk.cyan('\n📁 Setting up a new project group\n'));

      const suggestedName = expandedPath.split('/').pop()?.toUpperCase() || 'MY_PROJECTS';

      const nameAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'groupName',
          message: 'What should we call this group?',
          default: suggestedName,
          validate: (input: string) => {
            if (!input.trim()) return 'Group name is required';
            if (config.groups[input]) return `Group "${input}" already exists`;
            return true;
          }
        }
      ]);

      finalGroupName = nameAnswer.groupName;

      // Scan for directories
      const entries = readdirSync(expandedPath);
      const directories = entries.filter(entry => {
        const fullPath = join(expandedPath, entry);
        return statSync(fullPath).isDirectory() && !entry.startsWith('.');
      });

      if (directories.length > 0) {
        const projectAnswer = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'projects',
            message: 'Select projects to include:',
            choices: directories.map(dir => ({ name: dir, value: dir, checked: true })),
            pageSize: 15
          }
        ]);

        projects = projectAnswer.projects;
      } else {
        console.log(chalk.yellow('No directories found in current folder.'));
      }
    } else if (options.scan) {
      // Non-interactive scan mode
      const entries = readdirSync(expandedPath);
      for (const entry of entries) {
        const fullPath = join(expandedPath, entry);
        if (statSync(fullPath).isDirectory() && !entry.startsWith('.')) {
          projects.push(entry);
        }
      }
      console.log(chalk.cyan(`Found ${projects.length} projects in ${expandedPath}`));
    }

    if (!finalGroupName) {
      console.error(chalk.red('✗ Error:'), 'Group name is required');
      process.exit(1);
    }

    addGroup(config, finalGroupName, expandedPath, projects);
    saveConfig(config);

    console.log(chalk.green(`\n✓ Added group: ${finalGroupName}`));
    console.log(chalk.gray(`  Base path: ${expandedPath}`));
    if (projects.length > 0) {
      console.log(chalk.gray(`  Projects: ${projects.length}`));
    } else {
      console.log(chalk.yellow('  No projects added. Use: projects add-project <group>'));
    }
  } catch (error: any) {
    console.error(chalk.red('✗ Error:'), error.message);
    process.exit(1);
  }
}

export async function handleAddProject(groupName: string, projectName: string | undefined) {
  try {
    const config = loadConfig();

    const finalProjectName = projectName || process.cwd().split('/').pop() || '';

    if (!finalProjectName) {
      console.error(chalk.red('✗ Error:'), 'Could not determine project name');
      process.exit(1);
    }

    addProjectToGroup(config, groupName, finalProjectName);
    saveConfig(config);

    console.log(chalk.green(`✓ Added project: ${finalProjectName}`));
    console.log(chalk.gray(`  Group: ${groupName}`));
  } catch (error: any) {
    console.error(chalk.red('✗ Error:'), error.message);
    process.exit(1);
  }
}

export async function handleDelete(groupName: string) {
  try {
    const config = loadConfig();

    if (!config.groups[groupName]) {
      console.error(chalk.red('✗ Error:'), `Group not found: ${groupName}`);
      process.exit(1);
    }

    delete config.groups[groupName];
    saveConfig(config);

    console.log(chalk.green(`✓ Deleted group: ${groupName}`));
  } catch (error: any) {
    console.error(chalk.red('✗ Error:'), error.message);
    process.exit(1);
  }
}

export async function handleClear(options: { yes?: boolean }) {
  try {
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
  } catch (error: any) {
    console.error(chalk.red('✗ Error:'), error.message);
    process.exit(1);
  }
}

export async function handleList() {
  try {
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
  } catch (error: any) {
    console.error(chalk.red('✗ Error:'), error.message);
    process.exit(1);
  }
}

export async function handleShow(groupName: string) {
  try {
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
  } catch (error: any) {
    console.error(chalk.red('✗ Error:'), error.message);
    process.exit(1);
  }
}

export async function handleRun(
  groupName: string,
  commandParts: string[],
  options: { cd?: boolean; dryRun?: boolean }
) {
  try {
    const config = loadConfig();
    const group = config.groups[groupName];

    if (!group) {
      console.error(chalk.red('✗ Error:'), `Group not found: ${groupName}`);
      process.exit(1);
    }

    if (!commandParts || commandParts.length === 0) {
      console.error(chalk.red('✗ Error:'), 'No command provided');
      process.exit(1);
    }

    let command = commandParts.join(' ');

    // Remove surrounding quotes if present
    if ((command.startsWith("'") && command.endsWith("'")) ||
      (command.startsWith('"') && command.endsWith('"'))) {
      command = command.slice(1, -1);
    }

    await runCommandInProjects(group, command, {
      noCd: !options.cd,
      dryRun: options.dryRun,
    });
  } catch (error: any) {
    console.error(chalk.red('✗ Error:'), error.message);
    process.exit(1);
  }
}
