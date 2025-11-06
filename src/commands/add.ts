import chalk from 'chalk';
import inquirer from 'inquirer';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { loadConfig, saveConfig, addGroup } from '../config.js';

interface AddOptions {
  scan?: boolean;
}

export async function addCommand(
  groupName: string | undefined,
  basePath: string | undefined,
  options: AddOptions
): Promise<void> {
  const config = loadConfig();
  
  // Use current directory if no path provided
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
    const result = await interactiveAdd(expandedPath, config);
    finalGroupName = result.groupName;
    projects = result.projects;
  } else if (options.scan) {
    projects = scanDirectory(expandedPath);
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
}

async function interactiveAdd(expandedPath: string, config: any): Promise<{ groupName: string; projects: string[] }> {
  console.log(chalk.cyan('\n📁 Setting up a new project group\n'));
  
  // Get suggested name from current directory
  const suggestedName = expandedPath.split('/').pop()?.toUpperCase() || 'MY_PROJECTS';
  
  // Prompt for group name
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
  
  const groupName = nameAnswer.groupName;
  
  // Scan for directories
  const directories = scanDirectory(expandedPath);
  let projects: string[] = [];
  
  if (directories.length > 0) {
    // Prompt for project selection
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
  
  return { groupName, projects };
}

function scanDirectory(path: string): string[] {
  const entries = readdirSync(path);
  return entries.filter(entry => {
    const fullPath = join(path, entry);
    return statSync(fullPath).isDirectory() && !entry.startsWith('.');
  });
}
