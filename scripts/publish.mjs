import { execFileSync, spawnSync } from 'node:child_process';
import { cp, mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const run = (command, args, cwd = root) => execFileSync(command, args, { cwd, stdio: 'inherit' });
const gitText = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
if (gitText(['status', '--porcelain'])) {
  throw new Error('Commit your source changes before publishing.');
}
const revision = gitText(['rev-parse', 'HEAD']);
const sourceTrailers = gitText(['show', '-s', '--format=%B', 'HEAD'])
  .split('\n').filter(line => /^(Co-authored-by|Copilot-Session):/.test(line));
run(process.execPath, ['scripts/build.mjs']);
run(process.execPath, ['scripts/check.mjs']);
run('git', ['fetch', 'origin', 'gh-pages']);

const directory = await mkdtemp(join(tmpdir(), 'personal-dp-publish-'));
let worktreeAdded = false;
try {
  run('git', ['worktree', 'add', '--detach', directory, 'origin/gh-pages']);
  worktreeAdded = true;
  for (const entry of await readdir(directory)) {
    // Keep an existing custom domain while replacing generated output.
    if (entry !== '.git' && entry !== 'CNAME') {
      await rm(join(directory, entry), { recursive: true, force: true });
    }
  }
  await cp(join(root, 'dist'), directory, { recursive: true });
  run('git', ['add', '--all'], directory);
  const difference = spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: directory });
  if (difference.error) throw difference.error;
  if (difference.status === 0) {
    console.log('The published branch already matches this build.');
  } else if (difference.status === 1) {
    const trailers = [`Source-Commit: ${revision}`, ...sourceTrailers].join('\n');
    run('git', ['commit', '-m', `Publish portfolio ${revision.slice(0, 7)}`, '-m', trailers], directory);
    run('git', ['push', 'origin', 'HEAD:gh-pages'], directory);
    console.log('Pushed the site to gh-pages. GitHub Pages will deploy the update.');
  } else {
    throw new Error(`Unable to compare the published files (git exit ${difference.status}).`);
  }
} finally {
  if (worktreeAdded) run('git', ['worktree', 'remove', '--force', directory]);
  else await rm(directory, { recursive: true, force: true });
}
