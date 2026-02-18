# CLI
Implementation of CLI will come here

## Commands

`loom build <entry>`

Compile a Loom entry file to CSS.

*Options:*
* -o, --out <file|dir>
  * Output file or directory. If a directory is provided, the relative structure is preserved.
* --stdout
  * Write CSS output to stdout instead of a file.
* --watch
  * Recompile automatically on file changes.
* --format <pretty|min>
  * Output formatting mode.
  * Default: pretty
* --sourcemap <inline|file|none>
  * Generate source maps.
  * Default: none
* --strict
  * Treat warnings as errors.
* --max-warnings <number>
  * Stop compilation after the specified number of warnings.
* --no-color
  * Disable colored output (useful for CI).
* --config <path>
  * Path to a Loom configuration file.
* --cwd <dir>
  * Override the working directory.
* --no-cache
  * Disable build caching.
* --cache-dir <dir>
  * Specify a custom cache directory.

`loom check <entry>`

Run binding and type checking without emitting.

*Options:*
* --strict
* --max-warnings <number>
* --no-color
* --config <path>
* --cwd <dir>
* --json

### Output diagnostics as structured JSON.
These options are intended for development and tooling:
* --debug
  * Enable additional compiler debug output.
* --dump <tokens|ast|symbols|types>
  * Print internal compiler structures.
* --trace <lexer|parser|binder|resolver|checker|emit>
  * Show timing and execution trace for specific compiler phases.
* --json
  * Output diagnostics in JSON format.

### Exit Codes
* 0 — Successful compilation (no errors)
* 1 — Compilation failed due to errors
* 2 — Invalid CLI usage or configuration error