import Node from '../Node';
import Parser from '../Parser';
import { TokenType } from '../../types/tokenization';
import Type from './Type';

export default class TypeDeclaration extends Node {

    static parse(parser: Parser): boolean {

        if (parser.skipWithValue(TokenType.IDENT, 'type')) {
            parser.insert(new TypeDeclaration());
            parser.in();

            if (parser.expect(TokenType.IDENT)) {
                parser.setAttribute('name', parser.getCurrentValue());
                parser.advance();
            }

            parser.expectWithValue(TokenType.SYMBOL, ':');
            parser.advance();

            Type.parse(parser);

            parser.out();
            parser.expectWithValue(TokenType.SYMBOL, ';');
            parser.advance();

            return true;
        }

        return false;
    }

    compile() {
        // todo compile ClassNode
    }
}