import { defineConfig } from 'tsup';

export default defineConfig({
    entry: [
        './src/compiler/index.ts',
        './src/cli/index.ts',
        './src/lang-server/index.ts'
    ],
    format: ['cjs', 'esm'], // Build for commonJS and ESmodules
    dts: true, // Generate declaration file (.d.ts)
    splitting: false,
    sourcemap: true,
    clean: true,
});