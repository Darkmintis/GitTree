import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { GitTreeProvider } from './providers/gitTreeProvider';

let gitTreeProvider: GitTreeProvider | undefined;

export function activate(context: vscode.ExtensionContext): void {
  console.log('[GitTree] Activating...');

  gitTreeProvider = new GitTreeProvider();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('gittree.sidebar', gitTreeProvider)
  );

  registerCommands(context);

  vscode.commands.executeCommand('setContext', 'gittree:activated', true);

  console.log('[GitTree] Activated successfully!');
}

export function deactivate(): void {
  console.log('[GitTree] Deactivated.');
}
