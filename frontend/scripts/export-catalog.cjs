const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../src/data/catalog.ts'), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const sandbox = { exports: {} }; vm.runInNewContext(code, sandbox);
fs.writeFileSync(path.join(__dirname, '../../backend/database/seeders/catalog.json'), JSON.stringify({ products: sandbox.exports.PRODUCTS, categories: sandbox.exports.CATEGORIES }, null, 2));
console.log('Catalog exported for Laravel import.');
