import * as vscode from 'vscode';

export class GitTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  // Empty children so viewsWelcome shows the big "Open GitTree" button.
  async getChildren(_element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    return [];
  }
}
