import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { loadConfig } from './config';
import tabtab from 'tabtab';

/**
 * Install shell completion using tabtab
 */
export async function installCompletion(): Promise<void> {
  try {
    await tabtab.install({
      name: 'projects',
      completer: 'projects',
    });
    
    console.log(chalk.green('✓ Shell completion installed!'));
    console.log(chalk.gray('Restart your shell or run: source ~/.zshrc (or ~/.bashrc)'));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to install completion:'), error.message);
  }
}

/**
 * Uninstall shell completion
 */
export async function uninstallCompletion(): Promise<void> {
  try {
    await tabtab.uninstall({
      name: 'projects',
    });
    
    console.log(chalk.green('✓ Shell completion uninstalled!'));
  } catch (error: any) {
    console.error(chalk.red('✗ Failed to uninstall completion:'), error.message);
  }
}

/**
 * Setup completion handler
 */
export function setupCompletions(): void {
  const env = tabtab.parseEnv(process.env);
  
  if (!env.complete) {
    return;
  }

  // Load config to get groups
  let groups: string[] = [];
  try {
    const config = loadConfig();
    groups = Object.keys(config.groups);
  } catch {
    // Config might not exist yet
  }

  // Handle completion based on the previous word
  if (env.prev === 'run' || env.prev === 'show' || env.prev === 'delete' || env.prev === 'remove' || env.prev === 'rm') {
    // Suggest groups
    tabtab.log(groups);
    return;
  }

  if (env.prev === 'add-project') {
    // Suggest groups
    tabtab.log(groups);
    return;
  }

  if (env.prev === 'completions') {
    // Suggest shells
    tabtab.log(['install', 'uninstall']);
    return;
  }

  // Default: suggest commands
  if (env.words === 1) {
    tabtab.log([
      'init',
      'add-group',
      'add-project',
      'delete',
      'remove',
      'rm',
      'clear',
      'reset',
      'list',
      'show',
      'run',
      'completions',
    ]);
  }
}

/**
 * Check if completion is already set up
 */
export function checkAndOfferCompletion(): void {
  // Skip if we're in completion mode
  if (process.env.COMP_LINE || process.env.COMP_POINT) {
    return;
  }

  const shell = process.env.SHELL || '';
  let rcFile = '';

  if (shell.includes('zsh')) {
    rcFile = join(homedir(), '.zshrc');
  } else if (shell.includes('bash')) {
    rcFile = join(homedir(), '.bashrc');
  } else {
    return; // Unsupported shell
  }

  if (!existsSync(rcFile)) {
    return;
  }

  try {
    const rcContent = readFileSync(rcFile, 'utf-8');
    
    // Check if completion is already installed
    if (rcContent.includes('tabtab source for projects')) {
      return; // Already installed
    }

    // Don't auto-prompt, user can run `projects completions install` manually
  } catch {
    // Ignore errors
  }
}
