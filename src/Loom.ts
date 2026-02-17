import Lexer from './compiler/tokenization/Lexer';
import Parser from './compiler/parser/Parser';
import Binder from './compiler/binder/Binder';
import SymbolTable from './compiler/binder/SymbolTable';
import TypeResolver from './compiler/analyzer/TypeResolver';
import TypeTable from './compiler/analyzer/TypeTable';
import Reporter from './compiler/diagnostics/Reporter';
import TypeChecker from './compiler/analyzer/TypeChecker';
import chalk from 'chalk';
import EventBus from './compiler/bus/EventBus';
import { TEventMap } from './compiler/types/bus';

// todo this should become the compiler pipeline...
export default class Loom {
    /**
     * @param code
     */
    public static make(code: string): string {

        const eventBus = new EventBus<TEventMap>();

        eventBus.on('startTokenization', (e) => {
            console.log(e.code);
        });

        // Make a diagnostics reporter we can report messages to during this whole process
        const diagnostics = new Reporter();

        // Tokenize the code
        const tokens = (new Lexer(eventBus, diagnostics)).tokenize(code);
        console.log(chalk.bgGreenBright(' === TOKENS === '));
        console.log(chalk.bgCyan('TOKEN COUNT', tokens.getLength()));
        console.log(tokens.print());


        // Parse the tokens into an AST
        const ast = (new Parser(eventBus, diagnostics).parse(tokens));
        console.log(chalk.bgGreenBright(' === AST === '));
        console.log(ast.print());

        // Bind Symbols to AST
        const symbolTable = new SymbolTable();
        (new Binder(eventBus, diagnostics, symbolTable)).bind(ast);

        console.log(chalk.bgGreenBright(' === SYMBOL TABLE === '));
        symbolTable.print();

        // Resolve types
        const typeTable = new TypeTable();
        const resolver = new TypeResolver(eventBus, diagnostics, typeTable);
        resolver.resolve(ast);

        console.log(chalk.bgGreenBright(' === TYPE TABLE === '));
        typeTable.print();

        // Check the types
        // todo - this needs tons of work
        (new TypeChecker(eventBus, diagnostics)).check(ast, typeTable);

        console.log(chalk.bgGreenBright(' === DIAGNOSTICS === '));
        diagnostics.print();

        if (diagnostics.hasErrors()) {
            console.error('Not compiling, errors found...')
            return '';
        }

        // Finally we emit
        // todo
        return 'CSS OUTPUT...';
    }
}