import { dirname } from 'path';
import * as fs from 'fs';
import { Loom } from '../dist/index.js';

const filename = './example/index.loom';
const path = dirname(filename);
const code = fs.readFileSync(filename, 'utf8');

fs.writeFileSync(`${path}/index.css`, Loom.make(code, path));