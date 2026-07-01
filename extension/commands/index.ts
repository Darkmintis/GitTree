import * as vscode from 'vscode';
import { GitService } from '../git/gitService';
import { TreeParser } from '../parser/treeParser';
import { GitData } from '../../shared/types';

let currentPanel: vscode.WebviewPanel | null = null;

export function registerCommands(context: vscode.ExtensionContext): void {
  const showTreeCmd = vscode.commands.registerCommand('gittree.showTree', async () => {
    await showGitTree(context);
  });

  const refreshCmd = vscode.commands.registerCommand('gittree.refresh', async () => {
    if (currentPanel) {
      await showGitTree(context, true);
    }
  });

  const exportSnapshotCmd = vscode.commands.registerCommand('gittree.exportSnapshot', async () => {
    if (currentPanel) {
      currentPanel.webview.postMessage({ type: 'exportSnapshot' });
    }
  });

  context.subscriptions.push(showTreeCmd, refreshCmd, exportSnapshotCmd);
}

async function showGitTree(context: vscode.ExtensionContext, forceRefresh = false): Promise<void> {
  const column = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.viewColumn
    : vscode.ViewColumn.One;

  if (currentPanel && !forceRefresh) {
    currentPanel.reveal(column);
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
        vscode.Uri.joinPath(context.extensionUri, 'webview', 'src'),
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
        await openInEditor(message.hash);
        break;
      case 'copyHash':
        vscode.env.clipboard.writeText(message.hash);
        vscode.window.showInformationMessage(`Copied commit hash: ${message.hash}`);
        break;
      case 'refresh':
        await sendGitData(currentPanel!);
        break;
      case 'exportSVG':
        await exportSVG(message.svg);
        break;
      case 'exportPNG':
        vscode.window.showInformationMessage('PNG export coming soon!');
        break;
    }
  });

  const webviewPath = vscode.Uri.joinPath(context.extensionUri, 'webview', 'dist');
  const html = await getWebviewContent(currentPanel.webview, webviewPath);
  currentPanel.webview.html = html;
}

async function sendGitData(panel: vscode.WebviewPanel): Promise<void> {
  try {
    const gitService = new GitService();
    const gitData = await gitService.getGitData();
    const parser = new TreeParser();
    const treeLayout = parser.parse(gitData);

    panel.webview.postMessage({
      type: 'gitData',
      data: gitData,
      layout: treeLayout,
    });
  } catch (err: any) {
    panel.webview.postMessage({
      type: 'error',
      message: err.message || 'Failed to load Git data',
    });
  }
}

async function openInEditor(hash: string): Promise<void> {
  try {
    const gitService = new GitService();
    const files = await gitService.getCommitFiles(hash);
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && files.length > 0) {
      const doc = await vscode.workspace.openTextDocument(
        vscode.Uri.joinPath(workspaceFolders[0].uri, files[0])
      );
      await vscode.window.showTextDocument(doc);
      vscode.window.showInformationMessage(`Viewing files from commit ${hash.substring(0, 7)}`);
    }
  } catch {
    vscode.window.showErrorMessage(`Could not open commit ${hash.substring(0, 7)}`);
  }
}

async function exportSVG(svgContent: string): Promise<void> {
  const uri = await vscode.window.showSaveDialog({
    filters: { 'SVG files': ['svg'] },
    defaultUri: vscode.Uri.file('gittree-snapshot.svg'),
  });
  if (uri) {
    const encoder = new TextEncoder();
    await vscode.workspace.fs.writeFile(uri, encoder.encode(svgContent));
    vscode.window.showInformationMessage(`Snapshot saved to ${uri.fsPath}`);
  }
}

async function getWebviewContent(webview: vscode.Webview, webviewPath: vscode.Uri): Promise<string> {
  try {
    const indexPath = vscode.Uri.joinPath(webviewPath, 'index.html');
    const bytes = await vscode.workspace.fs.readFile(indexPath);
    let html = new TextDecoder().decode(bytes);

    html = html.replace(
      /(src|href)="([^"]*)"/g,
      (match: string, attr: string, value: string) => {
        if (value.startsWith('http') || value.startsWith('data:')) return match;
        const fileUri = vscode.Uri.joinPath(webviewPath, value);
        const webviewUri = webview.asWebviewUri(fileUri);
        return `${attr}="${webviewUri}"`;
      }
    );

    const cspSource = webview.cspSource;
    html = html.replace(
      '</head>',
      `<meta http-equiv="Content-Security-Policy" content="default-src 'self' ${cspSource} https:; style-src 'self' ${cspSource} 'unsafe-inline'; script-src 'self' ${cspSource} 'unsafe-inline'; img-src 'self' ${cspSource} data:;">\n</head>`
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
<body style="background:#1a1a2e;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
  <div style="text-align:center;">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L12 12"/><path d="M8 8C4 8 2 12 2 14C2 18 6 20 8 20"/><path d="M16 8C20 8 22 12 22 14C22 18 18 20 16 20"/><path d="M12 12C10 12 8 14 8 16C8 18 10 19 12 19C14 19 16 18 16 16C16 14 14 12 12 12Z"/></svg>
    <p style="color:#aaa;margin-top:8px;">Building your tree...</p>
    <p style="color:#555;font-size:0.9em;">Run <code style="background:#333;padding:2px 6px;border-radius:3px;">npm run build:webview</code> to build the webview</p>
  </div>
</body>
</html>`;
}
