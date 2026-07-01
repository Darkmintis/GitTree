# GitTree 🌳

**Visualize your Git repository as a living, interactive tree.**

Every commit grows your tree. Branches spread, leaves bloom, and your repository's history becomes a living organism you can explore, zoom, and rotate around.

## Features

- **Living tree visualization** — commits become leaves, branches become branches, merges thicken the trunk
- **Interactive view** — drag to rotate, scroll to zoom, click leaves for commit details
- **11 themes** — Oak, Sakura, Pine, Maple, Fantasy, Cyber, Pixel, Minimal, Dark Forest, Crystal, Bonsai
- **Time-lapse replay** — watch your repo grow from first commit to today
- **Works offline** — no telemetry, no login, no GitHub token required
- **Snapshot export** — save your tree as SVG

## Quick Start

1. Install from VS Code marketplace (search "GitTree")
2. Open a Git repository
3. Run command: `GitTree: Show Tree`

Or build from source:

```bash
git clone https://github.com/gittree/gittree
cd gittree
npm install
cd webview && npm install && cd ..
npm run build
```

Then press `F5` in VS Code to launch the extension host.

## Commands

| Command | Description |
|---|---|
| `GitTree: Show Tree` | Open the interactive tree view |
| `GitTree: Refresh` | Reload Git data |
| `GitTree: Export Snapshot` | Save tree as SVG |

## Settings

| Setting | Default | Description |
|---|---|---|
| `gittree.theme` | `oak` | Visual theme |
| `gittree.animationSpeed` | `1.0` | Animation speed multiplier |
| `gittree.showLeaves` | `true` | Toggle commit leaves |
| `gittree.showFruits` | `true` | Toggle PR fruits |
| `gittree.windEnabled` | `true` | Toggle wind sway |

## License

MIT
