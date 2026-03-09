import chalk from 'chalk';
import EventBus from '../core/bus/EventBus';
import { TEventMap } from './types/bus';
import DiagReporter from './DiagReporter';
import Lexer from './Lexer';
import ASTBuilder from './ASTBuilder';
import AST from './AST';
import IdAllocator from '../core/allocators/IdAllocator';
import Parser from './Parser';
import SymbolTable from './SymbolTable';
import Binder from './Binder';
import TypeTable from './TypeTable';
import TypeResolver from './TypeResolver';
import TypeChecker from './TypeChecker';
import Source from '@/compiler/Source';

export default class Compiler {
    public compile(code: string) {

        const source = new Source(code);
        const eventBus = new EventBus<TEventMap>();

        eventBus.on('startTokenization', (e) => {
            console.log(e.code);
        });

        // Make a diagnostics reporter we can report messages to during this whole process
        const diagnostics = new DiagReporter(source);

        // Tokenize the code
        const tokenStream = (new Lexer(eventBus, diagnostics)).tokenize(source);
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