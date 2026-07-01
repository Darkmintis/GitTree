const esbuild = require('esbuild');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ['extension/extension.ts'],
    bundle: true,
    outfile: 'extension/extension.js',
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    sourcemap: !production,
    minify: production,
    treeShaking: true,
  });

  if (watch) {
    await ctx.watch();
    console.log('[watch] Watching for changes...');
  } else {
    await ctx.rebuild();
    await ctx.dispose();
    console.log('[build] Extension built successfully');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
