import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';
import { load, dump } from 'js-yaml';
import { Config, Group } from './types.js';

/**
 * Get the config file path following XDG standards
 */
export function getConfigPath(): string {
  const xdgConfig = process.env.XDG_CONFIG_HOME;
  const configDir = xdgConfig
    ? join(xdgConfig, 'cli-projects')
    : join(homedir(), '.config', 'cli-projects');
  
  return join(configDir, 'config.yml');
}

/**
 * Ensure the config directory exists
 */
function ensureConfigDir(): void {
  const configPath = getConfigPath();
  const configDir = dirname(configPath);
  
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
}

/**
 * Load the configuration file
 */
export function loadConfig(): Config {
  const configPath = getConfigPath();
  
  if (!existsSync(configPath)) {
    return { groups: {} };
  }
  
  try {
    const fileContents = readFileSync(configPath, 'utf8');
    const config = load(fileContents) as Config;
    return config || { groups: {} };
  } catch (error) {
    throw new Error(`Failed to load config: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Save the configuration file
 */
export function saveConfig(config: Config): void {
  ensureConfigDir();
  const configPath = getConfigPath();
  
  try {
    const yamlContent = dump(config, {
      indent: 2,
      lineWidth: -1, // Don't wrap lines
    });
    writeFileSync(configPath, yamlContent, 'utf8');
  } catch (error) {
    throw new Error(`Failed to save config: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Check if config file exists
 */
export function configExists(): boolean {
  return existsSync(getConfigPath());
}

/**
 * Initialize config with default empty structure
 */
export function initConfig(): void {
  if (configExists()) {
    throw new Error('Config file already exists');
  }
  
  const defaultConfig: Config = {
    groups: {},
  };
  
  saveConfig(defaultConfig);
}

/**
 * Add a new group to the config
 */
export function addGroup(config: Config, groupName: string, basePath: string, projects: string[] = []): void {
  if (config.groups[groupName]) {
    throw new Error(`Group '${groupName}' already exists`);
  }
  
  config.groups[groupName] = {
    base: basePath,
    projects: projects,
  };
}

/**
 * Add a project to an existing group
 */
export function addProjectToGroup(config: Config, groupName: string, projectName: string): void {
  if (!config.groups[groupName]) {
    throw new Error(`Group '${groupName}' does not exist`);
  }
  
  const group = config.groups[groupName];
  
  if (group.projects.includes(projectName)) {
    throw new Error(`Project '${projectName}' already exists in group '${groupName}'`);
  }
  
  group.projects.push(projectName);
}

/**
 * Get a specific group
 */
export function getGroup(groupName: string): Group | undefined {
  const config = loadConfig();
  return config.groups[groupName];
}

/**
 * Get all groups
 */
export function getAllGroups(): Record<string, Group> {
  const config = loadConfig();
  return config.groups;
}
