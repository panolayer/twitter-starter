// Resolve the "@/..." path alias from tsconfig.json for the compiled tests,
// so library and component modules load the same way they do under Next.js.
const Module = require('node:module');
const path = require('node:path');

const compiledRoot = path.join(__dirname, '..', 'node_modules', '.cache', 'chirp-test');
const resolveFilename = Module._resolveFilename;

Module._resolveFilename = function (request, ...rest) {
  const target = request.startsWith('@/') ? path.join(compiledRoot, request.slice(2)) : request;
  return resolveFilename.call(this, target, ...rest);
};
