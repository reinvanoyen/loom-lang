import chalk from 'chalk';
import AST from './AST';
import SymbolTable from './SymbolTable';
import Binder from './Binder';
import TypeTable from './TypeTable';
import TypeResolver from './TypeResolver';
import TypeChecker from './TypeChecker';
import EmissionModelBuilder from '@/compiler/emitter/EmissionModelBuilder';
import CSSEmitter from '@/compiler/emitter/CSSEmitter';
import CompilationContext from '@/compiler/CompilationContext';
import ModuleLoader from '@/compiler/ModuleLoader';
import ModuleGraphLoader from '@/compiler/ModuleGraphLoader';
import ProgramBuilder from '@/compiler/ProgramBuilder';

export default class Compiler {

    /**
     * @param entryPath
     * @param opts
     */
    public compileFile(entryPath: string, opts?: { debug?: boolean }): string {

        const context = this.createContext(opts?.debug ?? false);
        const loader = new ModuleLoader(context);
        const graphLoader = new ModuleGraphLoader(loader, context);
        const compilation = graphLoader.loadGraph(entryPath);
        const program = new ProgramBuilder().build(compilation);
        return this.compileAst(program, context);
    }

    /**
     * @param debug
     * @private
     */
    private createContext(debug = false): CompilationContext {
        const context = new CompilationContext({ debug });

        if (debug) {
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

        const { eventBus, idAllocator, debug, diagnostics } = context;
        
        // Bind
        const symbolTable = new SymbolTable(idAllocator);
        new Binder(eventBus, diagnostics, symbolTable).bind(ast);

        if (debug) {
            console.log(chalk.bgGreenBright(' === SYMBOL TABLE === '));
            symbolTable.print();
            console.log(chalk.bgGreenBright(' === BOUND AST === '));
            ast.print();
        }

        // Resolve types
        const typeTable = new TypeTable();
        new TypeResolver(eventBus, diagnostics, typeTable).resolve(ast);

        if (debug) {
            console.log(chalk.bgGreenBright(' === TYPE TABLE === '));
            typeTable.print();
        }

        // Check types
        new TypeChecker(eventBus, diagnostics).check(ast, typeTable);

        if (debug) {
            console.log(chalk.bgGreenBright(' === DIAGNOSTICS === '));
            diagnostics.print();
        }

        if (diagnostics.hasErrors()) {
            if (debug) {
                console.error('Not compiling, errors found...');
            }
            return '';
        }

        // Emit
        const model = new EmissionModelBuilder().build(ast);

        if (debug) {
            console.log(chalk.bgGreenBright(' === EMISSION MODEL === '));
            console.log(model);
        }

        return new CSSEmitter().emit(model);
    }
}