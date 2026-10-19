import { build } from 'vite'; import fs from 'node:fs'; import { state } from './db.js'
process.env.VITE_STATIC = '1'
await build({ logLevel: 'warn' })
fs.writeFileSync('dist/data.js', 'window.DATA=' + JSON.stringify(state()).replaceAll('</', '<\\/'))
fs.cpSync('data/images', 'dist/images', { recursive: true })
// classic (non-module) script so the page also works when opened straight from disk (file://)
fs.writeFileSync('dist/index.html', fs.readFileSync('dist/index.html', 'utf8')
  .replace(/<script type="module" crossorigin src=/, '<script src="./data.js"></script><script defer src=').replace('<link rel="stylesheet" crossorigin', '<link rel="stylesheet"'))
console.log('Static site ready in ./dist')
