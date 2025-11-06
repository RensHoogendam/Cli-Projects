import chalk from 'chalk';
import inquirer from 'inquirer';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { loadConfig, saveConfig } from '../config';

export async function manageCommand(groupName?: string): Promise<void> {
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
  let managing = true;

  while (managing) {
    console.log(chalk.cyan(`\n📁 Managing: ${chalk.bold(selectedGroup)}`));
    console.log(chalk.gray(`Base: ${group.base}`));
    console.log(chalk.gray(`Projects: ${group.projects.length}\n`));

    const action = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          // { name: '➕ Add projects', value: 'add' },
          { name: '➖ Remove projects', value: 'remove' },
          { name: '📋 View projects', value: 'view' },
          // { name: '🔄 Rescan directory', value: 'rescan' },
          { name: '✓ Done', value: 'done' },
        ],
      }
    ]);

    switch (action.action) {
      case 'add':
        await addProjects(group, selectedGroup!);
        break;
      case 'remove':
        await removeProjects(group, selectedGroup!);
        break;
      case 'view':
        viewProjects(group);
        break;
      case 'rescan':
        await rescanDirectory(group, selectedGroup!);
        break;
      case 'done':
        managing = false;
        break;
    }

    saveConfig(config);
  }

  console.log(chalk.green('\n✓ Done managing projects!'));
}

async function addProjects(group: any, groupName: string): Promise<void> {
  // Scan directory for available projects
  const entries = readdirSync(group.base);
  const directories = entries.filter(entry => {
    const fullPath = join(group.base, entry);
    return statSync(fullPath).isDirectory() && !entry.startsWith('.');
  });

  // Filter out already added projects
  const available = directories.filter(dir => !group.projects.includes(dir));

  if (available.length === 0) {
    console.log(chalk.yellow('\nNo new projects found in directory.'));
    return;
  }

  const answer = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'projects',
      message: 'Select projects to add:',
      choices: available.map(dir => ({ name: dir, value: dir })),
      pageSize: 15,
    }
  ]);

  if (answer.projects.length > 0) {
    group.projects.push(...answer.projects);
    console.log(chalk.green(`\n✓ Added ${answer.projects.length} project(s)`));
  }
}

async function removeProjects(group: any, groupName: string): Promise<void> {
  if (group.projects.length === 0) {
    console.log(chalk.yellow('\nNo projects to remove.'));
    return;
  }

  const answer = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'projects',
      message: 'Select projects to remove:',
      choices: group.projects.map((proj: string) => ({ name: proj, value: proj })),
      pageSize: 15,
    }
  ]);

  if (answer.projects.length > 0) {
    group.projects = group.projects.filter((proj: string) => !answer.projects.includes(proj));
    console.log(chalk.green(`\n✓ Removed ${answer.projects.length} project(s)`));
  }
}

function viewProjects(group: any): void {
  console.log(chalk.cyan('\n📋 Projects in group:\n'));
  
  if (group.projects.length === 0) {
    console.log(chalk.yellow('  No projects in this group.'));
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

async function rescanDirectory(group: any, groupName: string): Promise<void> {
  const entries = readdirSync(group.base);
  const directories = entries.filter(entry => {
    const fullPath = join(group.base, entry);
    return statSync(fullPath).isDirectory() && !entry.startsWith('.');
  });

  const available = directories.filter(dir => !group.projects.includes(dir));

  if (available.length === 0) {
    console.log(chalk.yellow('\nNo new projects found.'));
    return;
  }

  console.log(chalk.cyan(`\nFound ${available.length} new project(s):`));
  available.forEach(dir => console.log(chalk.gray(`  • ${dir}`)));

  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addAll',
      message: 'Add all new projects?',
      default: true,
    }
  ]);

  if (answer.addAll) {
    group.projects.push(...available);
    console.log(chalk.green(`\n✓ Added ${available.length} project(s)`));
  }
}
