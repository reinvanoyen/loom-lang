import chalk from 'chalk';
import EventBus from '../core/bus/EventBus';
import { TEventMap } from './types/bus';
import Reporter from './diagnostics/Reporter';
import Lexer from './tokenization/Lexer';
import ASTBuilder from './parser/ASTBuilder';
import AST from './parser/AST';
import IdAllocator from '../core/allocators/IdAllocator';
import Parser from './parser/Parser';
import SymbolTable from './binder/SymbolTable';
import Binder from './binder/Binder';
import TypeTable from './analyzer/TypeTable';
import TypeResolver from './analyzer/TypeResolver';
import TypeChecker from './analyzer/TypeChecker';

export default class Compiler {
    public compile(code: string) {

        const eventBus = new EventBus<TEventMap>();

        eventBus.on('startTokenization', (e) => {
            console.log(e.code);
        });

        // Make a diagnostics reporter we can report messages to during this whole process
        const diagnostics = new Reporter();

        // Tokenize the code
        const tokenStream = (new Lexer(eventBus, diagnostics)).tokenize(code);
        console.log(chalk.bgGreenBright(' === TOKENS === '));
        console.log(chalk.bgCyan('TOKEN COUNT', tokenStream.getLength()));
        tokenStream.print();

        // Parse the tokens into an AST
        const builder = new ASTBuilder(new AST(), new IdAllocator());
        const ast = (new Parser(tokenStream, builder, eventBus, diagnostics).parse());
        console.log(chalk.bgGreenBright(' === AST === '));
        ast.print();

        // Bind Symbols to AST
        const symbolTable = new SymbolTable(new IdAllocator());
        (new Binder(eventBus, diagnostics, symbolTable)).bind(ast);

        console.log(chalk.bgGreenBright(' === SYMBOL TABLE === '));
        symbolTable.print();

        console.log(chalk.bgGreenBright(' === BOUND AST === '));
        ast.print();

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