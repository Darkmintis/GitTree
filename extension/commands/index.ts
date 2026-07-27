import * as vscode from 'vscode';
import * as path from 'path';
import { GitService } from '../git/gitService';

let currentPanel: vscode.WebviewPanel | null = null;

export function registerCommands(context: vscode.ExtensionContext): void {
  const showTreeCmd = vscode.commands.registerCommand('gittree.showTree', async () => {
    await showGitTree(context);
  });

  const refreshCmd = vscode.commands.registerCommand('gittree.refresh', async () => {
    if (currentPanel) {
      await sendGitData(currentPanel);
    } else {
      await showGitTree(context);
    }
  });

  const exportSnapshotCmd = vscode.commands.registerCommand('gittree.exportSnapshot', async () => {
    vscode.window.showInformationMessage('Snapshot export coming in a future update. Orbit and enjoy the tree for now!');
  });

  context.subscriptions.push(showTreeCmd, refreshCmd, exportSnapshotCmd);
}

async function showGitTree(context: vscode.ExtensionContext): Promise<void> {
  const column = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.viewColumn
    : vscode.ViewColumn.One;

  if (currentPanel) {
    currentPanel.reveal(column);
    await sendGitData(currentPanel);
    return;
  }

  currentPanel = vscode.window.createWebviewPanel(
    'gitTree',
    'GitTree',
    column || vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.joinPath(context.extensionUri, 'webview', 'dist'),
      ],
    }
  );

  currentPanel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'assets', 'icons', 'tree.svg');

  currentPanel.onDidDispose(() => {
    currentPanel = null;
  });

  currentPanel.webview.onDidReceiveMessage(async (message) => {
    switch (message.type) {
      case 'ready':
        await sendGitData(currentPanel!);
        break;
      case 'openCommit':
        await openInEditor(message.hash, message.repoPath);
        break;
      case 'copyHash':
        vscode.env.clipboard.writeText(message.hash);
        vscode.window.showInformationMessage(`Copied commit hash: ${message.hash}`);
        break;
      case 'refresh':
        await sendGitData(currentPanel!);
        break;
    }
  });

  const webviewPath = vscode.Uri.joinPath(context.extensionUri, 'webview', 'dist');
  const html = await getWebviewContent(currentPanel.webview, webviewPath);
  currentPanel.webview.html = html;
}

async function sendGitData(panel: vscode.WebviewPanel): Promise<void> {
  try {
    const repos = await GitService.loadAllRepos(12);
    if (repos.length === 0) {
      panel.webview.postMessage({
        type: 'error',
        message: 'No Git repositories found in this workspace',
      });
      return;
    }

    panel.webview.postMessage({
      type: 'gitData',
      repos,
      data: repos[0].data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load Git data';
    panel.webview.postMessage({
      type: 'error',
      message,
    });
  }
}

async function openInEditor(hash: string, repoPath?: string): Promise<void> {
  try {
    const gitService = new GitService(repoPath);
    const files = await gitService.getCommitFiles(hash);
    if (files.length > 0) {
      const base = repoPath || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!base) return;
      const doc = await vscode.workspace.openTextDocument(
        vscode.Uri.file(path.join(base, files[0]))
      );
      await vscode.window.showTextDocument(doc);
      vscode.window.showInformationMessage(`Viewing files from commit ${hash.substring(0, 7)}`);
    }
  } catch {
    vscode.window.showErrorMessage(`Could not open commit ${hash.substring(0, 7)}`);
  }
}

async function getWebviewContent(webview: vscode.Webview, webviewPath: vscode.Uri): Promise<string> {
  try {
    const indexPath = vscode.Uri.joinPath(webviewPath, 'index.html');
    const bytes = await vscode.workspace.fs.readFile(indexPath);
    let html = new TextDecoder().decode(bytes);

    html = html.replace(
      /(src|href)="([^"]*)"/g,
      (_match: string, attr: string, value: string) => {
        if (value.startsWith('http') || value.startsWith('data:') || value.startsWith('#')) {
          return `${attr}="${value}"`;
        }
        const cleaned = value.replace(/^\.\//, '');
        const fileUri = vscode.Uri.joinPath(webviewPath, cleaned);
        const webviewUri = webview.asWebviewUri(fileUri);
        return `${attr}="${webviewUri}"`;
      }
    );

    const cspSource = webview.cspSource;
    html = html.replace(
      '</head>',
      `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src ${cspSource} 'unsafe-eval' 'unsafe-inline'; img-src ${cspSource} data: blob:; font-src ${cspSource} data:; connect-src ${cspSource} blob:; worker-src ${cspSource} blob:; child-src ${cspSource} blob:;">\n</head>`
    );

    return html;
  } catch {
    return getFallbackHtml();
  }
}

function getFallbackHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>GitTree</title></head>
<body style="background:linear-gradient(180deg,#87CEEB,#6b9e4a);color:#1a3a2a;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
  <div style="text-align:center;">
    <p style="font-size:18px;margin-bottom:8px;">Growing your tree...</p>
    <p style="opacity:0.7;font-size:0.9em;">Run <code style="background:rgba(0,0,0,0.1);padding:2px 6px;border-radius:3px;">npm run build:webview</code> first</p>
  </div>
</body>
</html>`;
}
