import Node from '../Node';
import Parser from '../Parser';
import { TokenType } from '../../types/tokenization';
import Compiler from '../../compiler/Compiler';

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

    compile(compiler: Compiler) {
        // Set the current namespace
        compiler.getRuntime().setNamespace(this.getValue());
    }
}