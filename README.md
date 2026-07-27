# GitTree

**Visualize your Git repository as a living 3D tree.**

Every commit grows your tree. Branches spread, leaves bloom, and you can orbit around your history under a real sky.

## Features

- **True 3D living tree** — trunk, limbs, leaves, fruits, and flowers mapped from Git history
- **Orbit camera** — drag to rotate around the planted tree, scroll to zoom
- **Realistic scene** — blue sky, sun, soft shadows, wind in the canopy
- **3 themes** — Oak, Sakura, Pine
- **Replay** — watch your repository grow from seed to today
- **Works offline** — no telemetry, no login, no GitHub token required

## Quick Start

Build from source:

```bash
git clone https://github.com/Darkmintis/GitTree
cd GitTree
npm install
cd webview && npm install && cd ..
npm run build
```

Then press **F5** in VS Code to launch the extension host, open a Git repo, and run **GitTree: Show Tree**.

## Commands

| Command | Description |
|---|---|
| `GitTree: Show Tree` | Open the 3D living tree |
| `GitTree: Refresh` | Reload Git data |
| `GitTree: Export Snapshot` | Reserved for a future update |

## Settings

| Setting | Default | Description |
|---|---|---|
| `gittree.theme` | `oak` | Oak, Sakura, or Pine |
| `gittree.animationSpeed` | `1.0` | Replay / wind speed multiplier |
| `gittree.windEnabled` | `true` | Canopy wind sway |
| `gittree.performanceMode` | `false` | Fewer leaves for large repos |

## License

MIT
