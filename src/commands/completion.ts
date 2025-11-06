import chalk from 'chalk';
import { installCompletion, uninstallCompletion } from '../completion';

export async function completionCommand(action?: string) {
  if (!action || action === 'install') {
    await installCompletion();
  } else if (action === 'uninstall') {
    await uninstallCompletion();
  } else {
    throw new Error('Unknown action. Use: install or uninstall');
  }
}
