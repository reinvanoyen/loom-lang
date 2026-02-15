import Node from '../Node';
import Parser from '../Parser';
import { TokenType } from '../../types/tokenization';
import Compiler from '../../compiler/Compiler';

export default class ImportStatement extends Node {

    static parse(parser: Parser): boolean {

        if (parser.skipWithValue(TokenType.IDENT, 'import')) {
            parser.expect(TokenType.STRING);
            parser.insert(new ImportStatement(parser.getCurrentValue()));
            parser.advance();

            parser.expectWithValue(TokenType.SYMBOL, ';');
            parser.advance();

            return true;
        }

        return false;
    }

    compile(compiler: Compiler) {
        // Import
    }
}