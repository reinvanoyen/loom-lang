import Node from '../Node';
import Parser from '../Parser';
import { TokenType } from '../../types/tokenization';
import Compiler from '../../compiler/Compiler';
import Binder from '../../context/Binder';

export default class Namespace extends Node {

    static parse(parser: Parser): boolean {

        if (parser.skipWithValue(TokenType.IDENT, 'namespace')) {
            parser.expect(TokenType.IDENT);
            parser.insert(new Namespace(parser.getCurrentValue()));
            parser.advance();

            parser.expectWithValue(TokenType.SYMBOL, ';');
            parser.advance();

            return true;
        }

        return false;
    }

    bind(binder: Binder) {
        // Set the current namespace
        binder.symbols().setNamespace(this.getValue());
    }

    compile(compiler: Compiler) {
        //compiler.symbols().setNamespace(this.getValue());
    }
}