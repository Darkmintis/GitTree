import * as vscode from 'vscode';
import { GitService } from '../git/gitService';

export class GitTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private gitService: GitService;

  constructor() {
    this.gitService = new GitService();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    if (!element) {
      return this.getRootItems();
    }
    return [];
  }

  private async getRootItems(): Promise<vscode.TreeItem[]> {
    try {
      const data = await this.gitService.getGitData();
      const items: vscode.TreeItem[] = [];

      const treeItem = new vscode.TreeItem('GitTree', vscode.TreeItemCollapsibleState.Collapsed);
      treeItem.command = { command: 'gittree.showTree', title: 'Show Tree' };
      treeItem.contextValue = 'gittree';
      treeItem.description = `${data.totalCommits} commits`;
      items.push(treeItem);

      const statsItem = new vscode.TreeItem('Statistics', vscode.TreeItemCollapsibleState.Collapsed);
      statsItem.description = `${data.totalBranches} branches, ${data.totalContributors} contributors`;
      items.push(statsItem);

      const branchesItem = new vscode.TreeItem(`Branches (${data.branches.length})`, vscode.TreeItemCollapsibleState.Collapsed);
      branchesItem.contextValue = 'branches';
      items.push(branchesItem);

      return items;
    } catch {
      const errorItem = new vscode.TreeItem('No Git repository found');
      errorItem.description = 'Open a Git repository to get started';
      return [errorItem];
    }
  }
}
