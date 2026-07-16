<div>
    <img src="./logo.png" alt="Loom" width="160">
</div>

<h1>Loom</h1>

<p>
    <strong>Contractual CSS for teams building robust design systems.</strong>
</p>

<p>
    Loom is an experimental programming language for defining typed, composable UI components that compile to CSS.
</p>

> [!WARNING]
> Loom is under active development. Its syntax, compiler APIs, generated CSS, and tooling may change without notice. It is not ready for production use.

## Why Loom?

CSS is flexible, but large design systems need more than flexibility.

Component contracts are often spread across CSS, documentation, TypeScript types, naming conventions, and framework-specific runtime code. These contracts can easily drift apart.

Loom explores a different approach: define the contract and the styles together in a small, statically analysed language.

A Loom component can declare:

* typed variants;
* default values;
* named slots;
* inherited component contracts;
* component and slot styles;
* imports and namespaces.

The compiler resolves the module graph, validates the program, and emits CSS.

## Example

```loom
namespace ui;

type Size = 'small' | 'medium' | 'large';
type Intent = 'neutral' | 'danger' | 'success';

class Button {
    @size: Size = 'medium';
    @intent: Intent = 'neutral';

    slot icon;
    slot label;

    {%
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        border: 0;
        border-radius: 0.375rem;
    %}

    slot icon {%
        display: inline-flex;
    %}
}

class Link extends Button {
    @underline: 'always' | 'hover' | 'never' = 'hover';

    {%
        cursor: pointer;
        text-decoration: none;
    %}
}
```

Loom treats declarations such as `@size`, `@intent`, and `slot icon` as part of the component contract rather than as informal CSS conventions.

## Core concepts

### Classes

Classes define UI components.

```loom
class Card {
    {%
        display: block;
        padding: 1rem;
    %}
}
```

### Variants

Variants are typed component properties prefixed with `@`.

```loom
type Size = 'small' | 'medium' | 'large';

class Button {
    @size: Size = 'medium';
}
```

A variant may be required or have a default value.

```loom
class Alert {
    @intent: 'info' | 'warning' | 'danger';
}
```

### Slots

Slots define named component parts.

```loom
class Card {
    slot header;
    slot body;
    slot footer;
}
```

Slots can contain their own styles.

```loom
class Card {
    slot header {%
        font-weight: 600;
    %}
}
```

### Inheritance

Classes can extend other classes.

```loom
class Link extends Button {
    @underline: 'yes' | 'no' = 'yes';
}
```

Inherited classes build on the parent component's contract and styles.

### Types

Loom supports named types and string-literal unions.

```loom
type Intent = 'neutral' | 'danger' | 'success';
type ExtendedIntent = Intent | 'warning';
```

### Namespaces

A file can declare a namespace.

```loom
namespace app;
```

Imported classes can be referenced through their namespace.

```loom
class FeaturedCard extends ui.Card {
    {%
        border-width: 2px;
    %}
}
```

### Imports

Loom files can import other Loom modules.

```loom
import 'ui/Button.loom';
import 'ui/Card.loom';
```

Imports are resolved relative to the importing file.

### Style blocks

Raw CSS is written inside `{%` and `%}` delimiters.

```loom
class Badge {
    {%
        display: inline-flex;
        padding: 0.25rem 0.5rem;
        border-radius: 999px;
    %}
}
```

Loom does not attempt to replace CSS syntax. It adds a statically analysed component model around it.

## Getting started

Loom is not currently distributed as a stable release. Run it from source.

### Requirements

* Node.js with support for `node:util` `parseArgs`
* npm

### Install

```bash
git clone https://github.com/reinvanoyen/loom-lang.git
cd loom-lang
npm install
npm run build
```

### Compile a Loom file

```bash
node dist/cli/index.js src/playground/index.loom
```

By default, generated output is written to standard output.

Write it to a file with `--output`:

```bash
node dist/cli/index.js \
    --output src/playground/index.css \
    src/playground/index.loom
```

The repository also provides an npm script for the playground:

```bash
npm run example
```

## CLI

```text
loom [options] <input-file>
```

When the package is linked or installed as a binary:

```bash
loom src/app.loom
```

### Options

| Option                | Description                      |
| --------------------- | -------------------------------- |
| `-o, --output <file>` | Write generated output to a file |
| `--diagnostics`       | Print compiler diagnostics       |
| `--no-diagnostics`    | Disable compiler diagnostics     |
| `--symbols`           | Print the symbol table           |
| `--types`             | Print the type table             |
| `--bound-ast`         | Print the bound AST              |
| `--emission-model`    | Print the emission model         |
| `-v, --verbose`       | Enable verbose compiler output   |
| `-h, --help`          | Show CLI help                    |

Compiler debugging output is written separately from generated CSS, allowing CSS to continue being emitted to standard output.

## Language server

The repository includes an early Loom language server based on the Language Server Protocol.

After building the project, its binary is available at:

```bash
node dist/lang-server/index.js --stdio
```

The package exposes it as:

```text
loom-lsp
```

The language server is experimental and currently provides only the foundations for editor integration.

## Project structure

```text
src/
├── cli/          Command-line interface
├── compiler/     Compiler pipeline and module loading
├── core/         Core language structures
├── lang-server/  Language Server Protocol implementation
├── playground/   Example Loom modules and generated CSS
├── shared/       Shared utilities
└── vscode-ext/   VS Code extension work

spec/             Language specification work
test/             Compiler tests
```

## Development

Install dependencies:

```bash
npm install
```

Build the compiler and tooling:

```bash
npm run build
```

Run the compiler in watch mode:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Run the linter:

```bash
npm run lint
```

Automatically fix supported lint problems:

```bash
npm run lint:fix
```

Compile the included playground:

```bash
npm run example
```

## Compiler pipeline

The compiler is being developed around conventional compiler phases:

1. lexical analysis;
2. parsing and AST construction;
3. module graph loading;
4. symbol binding;
5. type analysis;
6. emission-model construction;
7. CSS emission;
8. diagnostic reporting.

Several internal structures can be inspected through the CLI:

```bash
loom --symbols src/playground/index.loom
loom --types src/playground/index.loom
loom --bound-ast src/playground/index.loom
loom --emission-model src/playground/index.loom
```

These options are primarily intended for compiler development and debugging.

## Current status

Implemented or actively being developed:

* Loom lexer and parser;
* modules, imports, and namespaces;
* classes and inheritance;
* typed variants;
* slots;
* symbol binding;
* type tables;
* compiler diagnostics;
* CSS emission;
* module graph compilation;
* command-line interface;
* early language-server support.

Still unstable or incomplete:

* the formal language specification;
* editor integrations;
* complete semantic validation;
* source maps;
* generated TypeScript declarations;
* stable CSS output conventions;
* package publishing and versioning;
* compatibility guarantees.

## Design principles

Loom is guided by a few core principles.

### Contracts over conventions

A component's supported variants and slots should be declared explicitly and checked by tooling.

### CSS remains CSS

Loom wraps CSS in a component language instead of inventing a replacement syntax for every CSS feature.

### Static analysis before emission

Invalid imports, unknown symbols, duplicate declarations, incompatible values, and invalid slot usage should be reported by the compiler.

### Deterministic output

The same program should produce the same CSS, independent of module discovery order or filesystem traversal behaviour.

### Tooling is part of the language

Diagnostics, source locations, compiler inspection, and editor integration are treated as language features rather than optional extras.

## Contributing

Loom is currently an experimental language and compiler project. Contributions are welcome, particularly around:

* compiler architecture;
* diagnostics;
* type checking;
* module resolution;
* CSS emission;
* language-server functionality;
* tests;
* specification writing.

Before opening a large pull request, create an issue describing the problem and the proposed design. Language changes should explain their syntax, semantics, failure cases, and effect on generated CSS.

## Related writing

The original idea behind Loom is described in:

[Experimenting with the idea of a TypeScript for CSS](https://dev.to/reinvanoyen/experimenting-with-the-idea-of-a-typescript-for-css-3i8l)

## License

Loom is available under the [MIT License](./LICENSE.md).
