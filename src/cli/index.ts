#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { parseArgs } from 'node:util';
import { Compiler } from '../compiler';

function main(): void {
    const { values, positionals } = parseArgs({
        options: {
            output: {
                type: 'string',
                short: 'o',
            },
            diagnostics: {
                type: 'boolean',
                default: true,
            },
            symbols: {
                type: 'boolean',
                default: false,
            },
            types: {
                type: 'boolean',
                default: false,
            },
            'bound-ast': {
                type: 'boolean',
                default: false,
            },
            'emission-model': {
                type: 'boolean',
                default: false,
            },
            verbose: {
                type: 'boolean',
                short: 'v',
                default: false,
            },
            help: {
                type: 'boolean',
                short: 'h',
                default: false,
            },
        },
        allowPositionals: true,
        allowNegative: true,
        strict: true,
    });

    if (values.help) {
        printHelp();
        return;
    }

    const input = positionals[0];

    if (!input) {
        fail('Missing input file. Run "loom --help" for usage.');
    }

    if (positionals.length > 1) {
        fail(`Unexpected argument: ${positionals[1]}`);
    }

    const filename = path.resolve(input);

    if (!fs.existsSync(filename)) {
        fail(`File not found: ${input}`);
    }

    const output = new Compiler().compileFile(filename, {
        printDiagnostics: values.diagnostics,
        printEmissionModel: values['emission-model'],
        printSymbolTable: values.symbols,
        printTypeTable: values.types,
        printBoundAst: values['bound-ast'],
        verbose: values.verbose,
    });

    if (values.output) {
        const outputFilename = path.resolve(values.output);

        fs.mkdirSync(path.dirname(outputFilename), {
            recursive: true,
        });

        fs.writeFileSync(outputFilename, output, 'utf8');
        console.error(`Output written to ${values.output}`);
        return;
    }

    process.stdout.write(output);
}

function printHelp(): void {
    console.log(`
Usage:
  loom [options] <input-file>

Options:
  -o, --output <file>    Write generated output to a file
      --diagnostics      Print diagnostics
      --no-diagnostics   Disable diagnostics
      --symbols          Print the symbol table
      --types            Print the type table
      --bound-ast        Print the bound AST
      --emission-model   Print the emission model
  -v, --verbose          Enable verbose output
  -h, --help             Show this help
`.trim());
}

function fail(message: string): never {
    console.error(`loom: ${message}`);
    process.exit(1);
}

try {
    main();
} catch (error: unknown) {
    const message = error instanceof Error
        ? error.message
        : String(error);

    console.error(`loom: ${message}`);
    process.exitCode = 1;
}