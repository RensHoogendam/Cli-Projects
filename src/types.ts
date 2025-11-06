/**
 * Represents a project group with a base directory and list of projects
 */
export interface Group {
  base: string;
  projects: string[];
}

/**
 * Configuration structure for the CLI
 */
export interface Config {
  groups: Record<string, Group>;
}

/**
 * Options for the run command
 */
export interface RunOptions {
  noCd?: boolean;  // Run from base directory instead of each project
  dryRun?: boolean; // Show what would be executed without running
}
