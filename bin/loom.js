#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { Loom } from '../dist/index.js';

const args = process.argv.slice(2);
if (args.length < 1) {
    console.error('Usage: loom <input-file> [output-file]');
    process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1] || null;
const filename = path.resolve(inputFile);

if (!fs.existsSync(filename)) {
    console.error(`Error: File not found: ${inputFile}`);
    process.exit(1);
}

const code = fs.readFileSync(filename, 'utf-8');
const output = Loom.make(code);

if (outputFile) {
    fs.writeFileSync(outputFile, output, 'utf-8');
    console.log(`Output written to ${outputFile}`);
} else {
    process.stdout.write(output);
}