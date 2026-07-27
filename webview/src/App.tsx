import React, { useEffect } from 'react';
import { useTreeStore } from './store/treeStore';
import { TreeScene } from './scene/TreeScene';
import { Overlay } from './components/Overlay';
import { GitData } from '@shared/types';
import './App.css';

const mockData: GitData = {
  branches: [
    {
      name: 'main',
      isMain: true,
      isCurrent: true,
      isStale: false,
      isDeleted: false,
      isRemote: false,
      parentBranch: null,
      baseCommit: null,
      mergeCommit: null,
      createdAt: new Date(Date.now() - 30 * 86400000),
      lastCommitAt: new Date(Date.now() - 86400000),
      commits: [
        { hash: 'a1b2c3d4e5f6', message: 'Initial commit', author: 'Alice', authorEmail: 'alice@dev.com', date: new Date(Date.now() - 30 * 86400000), filesChanged: 10, insertions: 500, deletions: 0, branch: 'main', refs: ['v1.0.0'], isMerge: false, parents: [] },
        { hash: 'b2c3d4e5f6a7', message: 'Add authentication', author: 'Alice', authorEmail: 'alice@dev.com', date: new Date(Date.now() - 25 * 86400000), filesChanged: 8, insertions: 200, deletions: 50, branch: 'main', refs: [], isMerge: false, parents: [] },
        { hash: 'c3d4e5f6a7b8', message: 'Implement API routes', author: 'Bob', authorEmail: 'bob@dev.com', date: new Date(Date.now() - 20 * 86400000), filesChanged: 15, insertions: 350, deletions: 100, branch: 'main', refs: [], isMerge: false, parents: [] },
        { hash: 'd4e5f6a7b8c9', message: 'Merge feature/login', author: 'Alice', authorEmail: 'alice@dev.com', date: new Date(Date.now() - 15 * 86400000), filesChanged: 5, insertions: 80, deletions: 20, branch: 'main', refs: [], isMerge: true, parents: ['c3d4e5f6a7b8', 'e5f6a7b8c9d0'] },
        { hash: 'e5f6a7b8c9d0', message: 'Add database layer', author: 'Charlie', authorEmail: 'charlie@dev.com', date: new Date(Date.now() - 10 * 86400000), filesChanged: 12, insertions: 400, deletions: 50, branch: 'main', refs: [], isMerge: false, parents: [] },
        { hash: 'f6a7b8c9d0e1', message: 'Fix security vulnerability', author: 'Alice', authorEmail: 'alice@dev.com', date: new Date(Date.now() - 5 * 86400000), filesChanged: 3, insertions: 30, deletions: 10, branch: 'main', refs: ['v1.1.0'], isMerge: false, parents: [] },
        { hash: 'a7b8c9d0e1f2', message: 'Performance optimization', author: 'Bob', authorEmail: 'bob@dev.com', date: new Date(Date.now() - 2 * 86400000), filesChanged: 7, insertions: 150, deletions: 80, branch: 'main', refs: [], isMerge: false, parents: [] },
        { hash: 'b8c9d0e1f2a3', message: 'Update README and docs', author: 'Charlie', authorEmail: 'charlie@dev.com', date: new Date(Date.now() - 86400000), filesChanged: 4, insertions: 60, deletions: 30, branch: 'main', refs: [], isMerge: false, parents: [] },
      ],
    },
    {
      name: 'feature/login',
      isMain: false,
      isCurrent: false,
      isStale: false,
      isDeleted: false,
      isRemote: false,
      parentBranch: 'main',
      baseCommit: 'b2c3d4e5f6a7',
      mergeCommit: 'd4e5f6a7b8c9',
      createdAt: new Date(Date.now() - 22 * 86400000),
      lastCommitAt: new Date(Date.now() - 16 * 86400000),
      commits: [
        { hash: 'e5f6a7b8c9d1', message: 'Create login form', author: 'Bob', authorEmail: 'bob@dev.com', date: new Date(Date.now() - 22 * 86400000), filesChanged: 6, insertions: 180, deletions: 0, branch: 'feature/login', refs: [], isMerge: false, parents: [] },
        { hash: 'f6a7b8c9d0e2', message: 'Add OAuth provider', author: 'Bob', authorEmail: 'bob@dev.com', date: new Date(Date.now() - 21 * 86400000), filesChanged: 4, insertions: 120, deletions: 20, branch: 'feature/login', refs: [], isMerge: false, parents: [] },
        { hash: 'a7b8c9d0e1f3', message: 'Style login page', author: 'Alice', authorEmail: 'alice@dev.com', date: new Date(Date.now() - 18 * 86400000), filesChanged: 5, insertions: 90, deletions: 30, branch: 'feature/login', refs: [], isMerge: false, parents: [] },
        { hash: 'b8c9d0e1f2a4', message: 'Add password reset', author: 'Bob', authorEmail: 'bob@dev.com', date: new Date(Date.now() - 16 * 86400000), filesChanged: 3, insertions: 60, deletions: 10, branch: 'feature/login', refs: [], isMerge: false, parents: [] },
      ],
    },
    {
      name: 'feature/dashboard',
      isMain: false,
      isCurrent: false,
      isStale: false,
      isDeleted: false,
      isRemote: false,
      parentBranch: 'main',
      baseCommit: 'c3d4e5f6a7b8',
      mergeCommit: null,
      createdAt: new Date(Date.now() - 12 * 86400000),
      lastCommitAt: new Date(Date.now() - 8 * 86400000),
      commits: [
        { hash: 'c9d0e1f2a3b4', message: 'Dashboard layout', author: 'Charlie', authorEmail: 'charlie@dev.com', date: new Date(Date.now() - 12 * 86400000), filesChanged: 8, insertions: 250, deletions: 0, branch: 'feature/dashboard', refs: [], isMerge: false, parents: [] },
        { hash: 'd0e1f2a3b4c5', message: 'Add charts widget', author: 'Charlie', authorEmail: 'charlie@dev.com', date: new Date(Date.now() - 11 * 86400000), filesChanged: 5, insertions: 130, deletions: 20, branch: 'feature/dashboard', refs: [], isMerge: false, parents: [] },
        { hash: 'e1f2a3b4c5d6', message: 'User profile card', author: 'Alice', authorEmail: 'alice@dev.com', date: new Date(Date.now() - 8 * 86400000), filesChanged: 4, insertions: 80, deletions: 10, branch: 'feature/dashboard', refs: [], isMerge: false, parents: [] },
      ],
    },
  ],
  tags: [
    { name: 'v1.0.0', commitHash: 'a1b2c3d4e5f6', date: new Date(Date.now() - 30 * 86400000), isRelease: true },
    { name: 'v1.1.0', commitHash: 'f6a7b8c9d0e1', date: new Date(Date.now() - 5 * 86400000), isRelease: true },
  ],
  currentBranch: 'main',
  totalCommits: 15,
  totalBranches: 3,
  totalContributors: 3,
  repositoryAge: 30 * 86400000,
  avgCommitsPerDay: 0.5,
  firstCommitDate: new Date(Date.now() - 30 * 86400000),
  lastCommitDate: new Date(Date.now() - 86400000),
};

declare function acquireVsCodeApi(): { postMessage: (msg: unknown) => void };

export default function App() {
  const { setTreeData, setError, setLoading } = useTreeStore();

  useEffect(() => {
    setLoading(true);

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'gitData') {
        setTreeData(message.data as GitData);
      } else if (message.type === 'error') {
        setError(message.message);
      } else if (message.type === 'exportSnapshot') {
        // 3D export deferred; acknowledge gracefully
      }
    };

    window.addEventListener('message', handleMessage);

    try {
      const vscode = acquireVsCodeApi();
      vscode.postMessage({ type: 'ready' });
    } catch {
      setTreeData(mockData);
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [setTreeData, setError, setLoading]);

  return (
    <div className="app">
      <TreeScene />
      <Overlay />
    </div>
  );
}
