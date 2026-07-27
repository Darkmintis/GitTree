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

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.text = '$(symbol-namespace) GitTree';
  statusBar.tooltip = 'Open GitTree living 3D view';
  statusBar.command = 'gittree.showTree';
  statusBar.show();
  context.subscriptions.push(statusBar);

  vscode.commands.executeCommand('setContext', 'gittree:activated', true);

  console.log('[GitTree] Activated successfully!');
}

export function deactivate(): void {
  console.log('[GitTree] Deactivated.');
}
