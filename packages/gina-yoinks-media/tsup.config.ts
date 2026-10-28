import {defineConfig} from 'tsup'

export default defineConfig([
  {
    entry: ['src/cli.tsx', 'src/mcp_server.ts'],
    format: 'esm',
    target: 'node18',
    clean: true,
    banner: {js: '#!/usr/bin/env node'},
  },
  {
    entry: ['src/index.ts', 'src/security/gina_yoinks_guard.ts'],
    format: 'esm',
    target: 'node18',
    clean: false,
  },
])
