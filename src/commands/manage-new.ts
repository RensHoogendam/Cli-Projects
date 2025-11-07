import chalk from 'chalk';
import inquirer from 'inquirer';
import { existsSync } from 'fs';
import { join } from 'path';
import { loadConfig, saveConfig } from '../config';

export async function manageCommand(groupName?: string, projectName?: string): Promise<void> {
  const config = loadConfig();
  const groupNames = Object.keys(config.groups);

  if (groupNames.length === 0) {
    console.log(chalk.yellow('No groups configured yet.'));
    console.log(chalk.gray('Use: projects add'));
    return;
  }

  // If no group provided, ask user to select one
  let selectedGroup = groupName;
  if (!selectedGroup) {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'group',
        message: 'Which group would you like to manage?',
        choices: groupNames,
      }
    ]);
    selectedGroup = answer.group;
  }

  // TypeScript now knows selectedGroup is a string
  if (!config.groups[selectedGroup!]) {
    throw new Error(`Group not found: ${selectedGroup}`);
  }

  const group = config.groups[selectedGroup!];

  // If project name provided, go directly to project actions
  if (projectName) {
    if (!group.projects.includes(projectName)) {
      throw new Error(`Project "${projectName}" not found in group "${selectedGroup}"`);
    }
    await projectActions(config, selectedGroup!, projectName);
    saveConfig(config);
    return;
  }

  // Otherwise, show group actions
  await groupActions(config, selectedGroup!);
  saveConfig(config);
}

async function groupActions(config: any, groupName: string): Promise<void> {
  const group = config.groups[groupName];
  let managing = true;

  while (managing) {
    console.log(chalk.cyan(`\n📁 Managing Group: ${chalk.bold(groupName)}`));
    console.log(chalk.gray(`Base: ${group.base}`));
    console.log(chalk.gray(`Projects: ${group.projects.length}\n`));

    const action = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '📋 Manage projects', value: 'projects' },
          { name: '✏️  Rename group', value: 'rename' },
          { name: '🗑️  Delete group', value: 'delete' },
          { name: '✓ Done', value: 'done' },
        ],
      }
    ]);

    switch (action.action) {
      case 'projects':
        await manageProjects(config, groupName);
        break;
      case 'rename':
        const renamed = await renameGroup(config, groupName);
        if (renamed) {
          groupName = renamed; // Update to new name
        }
        break;
      case 'delete':
        const deleted = await deleteGroup(config, groupName);
        if (deleted) {
          managing = false; // Exit after deletion
        }
        break;
      case 'done':
        managing = false;
        break;
    }
  }

  console.log(chalk.green('\n✓ Done!'));
}

async function manageProjects(config: any, groupName: string): Promise<void> {
  const group = config.groups[groupName];

  if (group.projects.length === 0) {
    console.log(chalk.yellow('\nNo projects in this group.'));
    return;
  }

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'project',
      message: 'Select a project to manage:',
      choices: [
        ...group.projects.map((proj: string) => {
          const projectPath = join(group.base, proj);
          const exists = existsSync(projectPath);
          const icon = exists ? chalk.green('✓') : chalk.red('✗');
          return { name: `${icon} ${proj}`, value: proj };
        }),
        new inquirer.Separator(),
        { name: '← Back', value: '__back__' }
      ],
      pageSize: 15,
    }
  ]);

  if (answer.project !== '__back__') {
    await projectActions(config, groupName, answer.project);
  }
}

async function projectActions(config: any, groupName: string, projectName: string): Promise<void> {
  const group = config.groups[groupName];
  let managing = true;

  while (managing) {
    const projectPath = join(group.base, projectName);
    const exists = existsSync(projectPath);

    console.log(chalk.cyan(`\n📦 Managing Project: ${chalk.bold(projectName)}`));
    console.log(chalk.gray(`Group: ${groupName}`));
    console.log(chalk.gray(`Path: ${projectPath}`));
    console.log(exists ? chalk.green('Status: ✓ Exists') : chalk.red('Status: ✗ Not found\n'));

    const action = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '✏️  Rename project', value: 'rename' },
          { name: '🗑️  Remove from group', value: 'remove' },
          { name: '✓ Back', value: 'back' },
        ],
      }
    ]);

    switch (action.action) {
      case 'rename':
        const renamed = await renameProject(config, groupName, projectName);
        if (renamed) {
          projectName = renamed; // Update to new name
        }
        break;
      case 'remove':
        const removed = await removeProject(config, groupName, projectName);
        if (removed) {
          managing = false; // Exit after removal
        }
        break;
      case 'back':
        managing = false;
        break;
    }
  }
}

async function renameGroup(config: any, oldName: string): Promise<string | null> {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'newName',
      message: 'Enter new group name:',
      default: oldName,
      validate: (input: string) => {
        if (!input.trim()) return 'Group name is required';
        if (input === oldName) return 'Name unchanged';
        if (config.groups[input]) return `Group "${input}" already exists`;
        return true;
      }
    }
  ]);

  config.groups[answer.newName] = config.groups[oldName];
  delete config.groups[oldName];

  console.log(chalk.green(`\n✓ Renamed group: ${oldName} → ${answer.newName}`));
  return answer.newName;
}

async function deleteGroup(config: any, groupName: string): Promise<boolean> {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Delete group "${groupName}"? This will not delete the actual project directories.`,
      default: false,
    }
  ]);

  if (answer.confirm) {
    delete config.groups[groupName];
    console.log(chalk.green(`\n✓ Deleted group: ${groupName}`));
    return true;
  }

  return false;
}

async function renameProject(config: any, groupName: string, oldName: string): Promise<string | null> {
  const group = config.groups[groupName];

  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'newName',
      message: 'Enter new project name:',
      default: oldName,
      validate: (input: string) => {
        if (!input.trim()) return 'Project name is required';
        if (input === oldName) return 'Name unchanged';
        if (group.projects.includes(input)) return `Project "${input}" already exists in this group`;
        return true;
      }
    }
  ]);

  const index = group.projects.indexOf(oldName);
  group.projects[index] = answer.newName;

  console.log(chalk.green(`\n✓ Renamed project: ${oldName} → ${answer.newName}`));
  return answer.newName;
}

async function removeProject(config: any, groupName: string, projectName: string): Promise<boolean> {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Remove "${projectName}" from group "${groupName}"? This will not delete the actual project directory.`,
      default: false,
    }
  ]);

  if (answer.confirm) {
    const group = config.groups[groupName];
    group.projects = group.projects.filter((proj: string) => proj !== projectName);
    console.log(chalk.green(`\n✓ Removed project: ${projectName}`));
    return true;
  }

  return false;
}
