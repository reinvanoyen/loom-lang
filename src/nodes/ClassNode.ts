import Node from '../parsing/Node';
import Parser from '../parsing/Parser';
import { TokenType } from '../types/tokenization';
import VariantDefinition from './VariantDefinition';

export default class ClassNode extends Node {

    static parse(parser: Parser): boolean {

        if (parser.skipWithValue(TokenType.IDENT, 'class')) {
            parser.insert(new ClassNode());
            parser.traverseUp();

            if (parser.expect(TokenType.IDENT)) {
                parser.setAttribute('name', parser.getCurrentValue());
                parser.advance();
            }
            
            parser.expectWithValue(TokenType.SYMBOL, '{');
            parser.advance();

            // Parse class body
            while(
                VariantDefinition.parse(parser)
            );

            if (parser.expectWithValue(TokenType.SYMBOL, '}')) {
                parser.out();
                parser.advance();
            }

            return true;
        }

        return false;
    }

    compile() {
        // todo compile ClassNode
    }
}