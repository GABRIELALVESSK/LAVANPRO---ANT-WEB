const { execSync } = require('child_process');
try {
  const out = execSync('npx next build', {
    cwd: __dirname,
    encoding: 'utf-8',
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    maxBuffer: 10 * 1024 * 1024,
  });
  require('fs').writeFileSync(__dirname + '/build_clean.txt', out, 'utf-8');
} catch (e) {
  const combined = (e.stdout || '') + '\n===STDERR===\n' + (e.stderr || '');
  require('fs').writeFileSync(__dirname + '/build_clean.txt', combined, 'utf-8');
}
