import chalk from 'chalk';

/**
 * Wraps a command handler with error handling
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<void> | void
) {
  return async (...args: T) => {
    try {
      await handler(...args);
    } catch (error: any) {
      console.error(chalk.red('✗ Error:'), error.message);
      process.exit(1);
    }
  };
}
