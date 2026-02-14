import Node from '../Node';
import Parser from '../Parser';
import { TokenType } from '../../types/tokenization';
import Compiler from '../../compiler/Compiler';

export default class SlotDeclaration extends Node {
    /**
     * @param parser
     */
    static parse(parser: Parser): boolean {

        if (parser.skipWithValue(TokenType.IDENT,'slot')) {
            parser.expect(TokenType.IDENT);
            parser.insert(new SlotDeclaration(parser.getCurrentValue()));
            parser.advance();

            parser.expectWithValue(TokenType.SYMBOL, ';');
            parser.advance();

            return true;
        }

        return false;
    }

    compile(compiler: Compiler) {
        compiler.writeLine(`.${this.getValue()} {}`);
    }
}