import Node from '../Node';
import Parser from '../Parser';
import { TokenType } from '../../types/tokenization';
import Compiler from '../../compiler/Compiler';

export default class ImportStatement extends Node {

    getName(): string {
        return 'IMPORT';
    }

    static parse(parser: Parser): boolean {

        if (parser.skipWithValue(TokenType.IDENT, 'import')) {

            if (parser.expect(TokenType.STRING)) {
                parser.expect(TokenType.STRING);
                parser.insert(new ImportStatement(parser.getCurrentValue()));
                parser.advance();
            }

            if (parser.expectWithValue(TokenType.SYMBOL, ';')) {
                parser.advance();
            }

            return true;
        }

        return false;
    }

    compile(compiler: Compiler) {
        // Import
    }
}