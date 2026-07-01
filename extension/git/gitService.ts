import * as vscode from 'vscode';
import { exec } from 'child_process';
import { GitData, GitCommit, GitBranch, GitTag } from '../../shared/types';

export class GitService {
  private workspacePath: string;

  constructor() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      throw new Error('No workspace folder open');
    }
    this.workspacePath = workspaceFolders[0].uri.fsPath;
  }

  async getGitData(): Promise<GitData> {
    const currentBranch = await this.getCurrentBranch();
    const branches = await this.getAllBranches(currentBranch);
    const tags = await this.getTags();
    const allCommits = branches.reduce((acc, b) => [...acc, ...b.commits], [] as GitCommit[]);
    const uniqueAuthors = new Set(allCommits.map(c => c.author));
    const firstCommit = await this.getFirstCommitDate();
    const lastCommit = await this.getLastCommitDate();
    const repoAge = lastCommit.getTime() - firstCommit.getTime();
    const daysSinceFirst = Math.max(1, repoAge / (1000 * 60 * 60 * 24));

    return {
      branches,
      tags,
      currentBranch,
      totalCommits: allCommits.length,
      totalBranches: branches.length,
      totalContributors: uniqueAuthors.size,
      repositoryAge: repoAge,
      avgCommitsPerDay: allCommits.length / daysSinceFirst,
      firstCommitDate: firstCommit,
      lastCommitDate: lastCommit,
    };
  }

  private async getCurrentBranch(): Promise<string> {
    const output = await this.execGit('rev-parse --abbrev-ref HEAD');
    return output.trim() || 'main';
  }

  private async getAllBranches(currentBranch: string): Promise<GitBranch[]> {
    const output = await this.execGit('branch --format="%(refname:short)"');
    const localNames = output.trim().split('\n')
      .map(l => l.trim().replace('refs/heads/', ''))
      .filter(b => b && b !== 'HEAD');
    const now = new Date();
    const branches: GitBranch[] = [];

    for (const name of localNames) {
      try {
        const commits = await this.getBranchCommits(name);
        branches.push({
          name,
          commits,
          parentBranch: await this.getParentBranch(name, localNames),
          isMain: name === 'main' || name === 'master',
          isCurrent: name === currentBranch,
          isStale: this.isStale(commits),
          isDeleted: false,
          isRemote: false,
          baseCommit: commits.length > 0 ? commits[commits.length - 1].hash : null,
          mergeCommit: null,
          createdAt: commits.length > 0 ? commits[commits.length - 1].date : now,
          lastCommitAt: commits.length > 0 ? commits[0].date : now,
        });
      } catch {
        // skip unparseable branches
      }
    }

    const mainBranch = branches.find(b => b.isMain);
    const otherBranches = branches.filter(b => !b.isMain);
    return mainBranch ? [mainBranch, ...otherBranches] : branches;
  }

  private async getBranchCommits(branch: string): Promise<GitCommit[]> {
    const format = '---COMMIT---%n%H|%P|%an|%ae|%ad|%s|%f';
    const output = await this.execGit(
      `log ${branch} --first-parent --max-count=100 --format="${format}" --date=iso --stat`
    );
    return this.parseCommits(output, branch);
  }

  private parseCommits(output: string, branchName: string): GitCommit[] {
    const blocks = output.split('---COMMIT---\n').filter(b => b.trim());
    return blocks.map(block => {
      const lines = block.trim().split('\n');
      const parts = lines[0].split('|');
      const hash = parts[0]?.trim() || '';
      const parents = parts[1]?.trim() ? parts[1].trim().split(' ') : [];
      const author = parts[2]?.trim() || 'Unknown';
      const authorEmail = parts[3]?.trim() || '';
      const date = new Date(parts[4]?.trim() || Date.now());
      const message = parts[5]?.trim() || '';
      const refs = (parts[6]?.trim() || '').split(',').filter(r => r);

      let filesChanged = 0;
      let insertions = 0;
      let deletions = 0;
      for (const line of lines) {
        const fm = line.match(/(\d+) files? changed/);
        if (fm) filesChanged = parseInt(fm[1]);
        const im = line.match(/(\d+) insertions?/);
        if (im) insertions = parseInt(im[1]);
        const dm = line.match(/(\d+) deletions?/);
        if (dm) deletions = parseInt(dm[1]);
      }

      return {
        hash,
        message,
        author,
        authorEmail,
        date,
        filesChanged,
        insertions,
        deletions,
        branch: branchName,
        refs: refs.filter(r => r !== branchName),
        isMerge: parents.length > 1,
        parents,
      };
    });
  }

  private async getParentBranch(branch: string, allBranches: string[]): Promise<string | null> {
    if (branch === 'main' || branch === 'master') return null;
    try {
      const log = await this.execGit(`log ${branch} --oneline --max-count=50 --format="%H"`);
      const mergeBaseMain = await this.execGit(`merge-base ${branch} main`).catch(() => '');
      if (mergeBaseMain.trim() && log.includes(mergeBaseMain.trim())) return 'main';
      for (const cand of allBranches) {
        if (cand === branch || cand === 'main' || cand === 'master') continue;
        try {
          const mb = await this.execGit(`merge-base ${branch} ${cand}`);
          if (mb.trim() && log.includes(mb.trim())) return cand;
        } catch { continue; }
      }
      return 'main';
    } catch {
      return 'main';
    }
  }

  private async getTags(): Promise<GitTag[]> {
    const output = await this.execGit('tag --sort=-creatordate --format="%(refname:short)|%(objectname)|%(creatordate:iso)"');
    return output.trim().split('\n').filter(l => l.trim()).map(line => {
      const parts = line.split('|');
      return {
        name: parts[0]?.trim() || '',
        commitHash: parts[1]?.trim() || '',
        date: new Date(parts[2]?.trim() || Date.now()),
        isRelease: /^v?\d+\.\d+/.test(parts[0] || ''),
      };
    });
  }

  private async getFirstCommitDate(): Promise<Date> {
    const output = await this.execGit('log --reverse --format="%ad" --date=iso --all --max-count=1');
    return new Date(output.trim() || Date.now());
  }

  private async getLastCommitDate(): Promise<Date> {
    const output = await this.execGit('log --format="%ad" --date=iso --max-count=1');
    return new Date(output.trim() || Date.now());
  }

  private isStale(commits: GitCommit[]): boolean {
    if (commits.length === 0) return true;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return commits[0].date < sixMonthsAgo;
  }

  async getCommitDiff(hash: string): Promise<{ filesChanged: number; insertions: number; deletions: number }> {
    try {
      const output = await this.execGit(`show --stat ${hash} --format=""`);
      const fileMatch = output.match(/(\d+) files? changed/);
      const insertMatch = output.match(/(\d+) insertions?/);
      const deleteMatch = output.match(/(\d+) deletions?/);
      return {
        filesChanged: fileMatch ? parseInt(fileMatch[1]) : 0,
        insertions: insertMatch ? parseInt(insertMatch[1]) : 0,
        deletions: deleteMatch ? parseInt(deleteMatch[1]) : 0,
      };
    } catch {
      return { filesChanged: 0, insertions: 0, deletions: 0 };
    }
  }

  async getCommitFiles(hash: string): Promise<string[]> {
    const output = await this.execGit(`diff-tree --no-commit-id -r --name-only -M ${hash}`);
    return output.trim().split('\n').filter(l => l.trim());
  }

  private execGit(args: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(`git ${args}`, { cwd: this.workspacePath, maxBuffer: 10 * 1024 * 1024 }, (err: Error | null, stdout: string, stderr: string) => {
        if (err) {
          reject(new Error(stderr || err.message));
          return;
        }
        resolve(stdout);
      });
    });
  }
}
