import Node from '../parsing/Node';
import Parser from '../parsing/Parser';
import { TokenType } from '../types/tokenization';

export default class VariantDefinition extends Node {

    static parse(parser: Parser): boolean {

        if (parser.acceptWithValue(TokenType.SYMBOL,'@')) {
            parser.advance(9);
            return true;
        }
        return false;
    }

    compile() {
        // todo compile VariantDefinition
    }
}