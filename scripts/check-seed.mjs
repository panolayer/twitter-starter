import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const dir = await mkdtemp(join(tmpdir(), 'chirp-seed-'));
try {
  const source = await readFile(new URL('../lib/db.ts', import.meta.url), 'utf8');
  const compiled = ts
    .transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    })
    .outputText.replace(
      'require("better-sqlite3")',
      `require(${JSON.stringify(require.resolve('better-sqlite3'))})`,
    );
  const worker = join(dir, 'worker.cjs');
  await writeFile(
    worker,
    compiled +
      '\nconst db = exports.getDb(); console.log(JSON.stringify({ users: db.prepare("SELECT COUNT(*) n FROM users").get().n, posts: db.prepare("SELECT COUNT(*) n FROM posts").get().n })); db.close();',
  );
  const results = await Promise.allSettled(
    Array.from({ length: 4 }, () =>
      promisify(execFile)(process.execPath, [worker], {
        env: { ...process.env, CHIRP_DATA_DIR: join(dir, 'data') },
      }),
    ),
  );
  for (const result of results) {
    assert.equal(
      result.status,
      'fulfilled',
      result.status === 'rejected' ? String(result.reason) : '',
    );
    assert.deepEqual(JSON.parse(result.value.stdout), { users: 4, posts: 38 });
  }
  console.log('PASS: four concurrent connections seed exactly one sample world');
} finally {
  await rm(dir, { recursive: true, force: true });
}
