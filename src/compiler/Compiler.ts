import chalk from 'chalk';
import AST from './parser/AST';
import SymbolTable from './binder/SymbolTable';
import Binder from './binder/Binder';
import TypeTable from './type-safety/TypeTable';
import TypeResolver from './type-safety/TypeResolver';
import TypeChecker from './type-safety/TypeChecker';
import EmissionModelBuilder from '@/compiler/emitter/EmissionModelBuilder';
import CSSEmitter from '@/compiler/emitter/CSSEmitter';
import CompilationContext, { CompilationFlags } from '@/compiler/CompilationContext';
import ModuleLoader from '@/compiler/module/ModuleLoader';
import ModuleGraphLoader from '@/compiler/module/ModuleGraphLoader';
import ProgramBuilder from '@/compiler/module/ProgramBuilder';
import Diagnostics from '@/compiler/Diagnostics';

type AnalyzeResult = {
    css: string;
    diagnostics: Diagnostics;
    // later: symbolTable, boundAst, etc.
};

export default class Compiler {
    /**
     * @param entryPath
     * @param flags
     */
    public compileFile(entryPath: string, flags: CompilationFlags): string {

        const context = this.createContext(flags);
        const loader = new ModuleLoader(context);
        const graphLoader = new ModuleGraphLoader(loader, context);
        const compilation = graphLoader.loadGraph(entryPath);
        const program = new ProgramBuilder().build(compilation);
        return this.compileAst(program, context);
    }

    /**
     * @param sourceText
     * @param filename
     * @param flags
     */
    public analyzeFromSource(sourceText: string, filename: string, flags: CompilationFlags): AnalyzeResult {

        const context = this.createContext(flags);
        const loader = new ModuleLoader(context);
        const graphLoader = new ModuleGraphLoader(loader, context);
        const compilation = graphLoader.loadGraphFromSource(filename, sourceText);
        const program = new ProgramBuilder().build(compilation);

        const css = this.compileAst(program, context);

        return {
            css,
            diagnostics: context.diagnostics
        };
    }

    /**
     * @param flags
     * @private
     */
    private createContext(flags: CompilationFlags): CompilationContext {
        const context = new CompilationContext(flags);

        if (flags.verbose) {
            context.eventBus.on('startTokenization', (e) => {
                console.log(e.code);
            });
        }

        return context;
    }

    /**
     * @param ast
     * @param context
     * @private
     */
    private compileAst(ast: AST, context: CompilationContext): string {

        const { eventBus, idAllocator, flags, diagnostics } = context;
        
        // Bind
        const symbolTable = new SymbolTable(idAllocator);
        new Binder(symbolTable, context).bind(ast);

        if (flags.printSymbolTable) {
            console.log(chalk.bgGreenBright(' === SYMBOL TABLE === '));
            symbolTable.print();
        }

        if (flags.printBoundAst) {
            console.log(chalk.bgGreenBright(' === BOUND AST === '));
            ast.print();
        }

        // Resolve types
        const typeTable = new TypeTable();
        new TypeResolver(eventBus, diagnostics, typeTable).resolve(ast);

        if (flags.printTypeTable) {
            console.log(chalk.bgGreenBright(' === TYPE TABLE === '));
            typeTable.print();
        }

        // Check types
        new TypeChecker(eventBus, diagnostics).check(ast, typeTable);

        if (flags.printDiagnostics) {
            console.log(chalk.bgGreenBright(' === DIAGNOSTICS === '));
            diagnostics.print();
        }

        if (diagnostics.hasErrors()) {
            if (flags.verbose) {
                console.error('Not compiling, errors found...');
            }
            return '';
        }

        // Build the emission model
        const model = new EmissionModelBuilder().build(ast);

        if (flags.printEmissionModel) {
            console.log(chalk.bgGreenBright(' === EMISSION MODEL === '));
            model.print();
        }

        // Emit CSS
        return new CSSEmitter().emit(model);
    }
}