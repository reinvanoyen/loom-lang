import Node from '../Node';
import Parser from '../Parser';
import { TokenType } from '../../types/tokenization';
import Type from './Type';

export default class VariantDeclaration extends Node {
    /**
     * @param parser
     */
    static parse(parser: Parser): boolean {

        if (parser.skipWithValue(TokenType.SYMBOL,'@')) {
            parser.expect(TokenType.IDENT);
            parser.insert(new VariantDeclaration());
            parser.in();
            parser.setAttribute('name', parser.getCurrentValue());
            parser.advance();

            parser.expectWithValue(TokenType.SYMBOL, ':');
            parser.advance();

            Type.parse(parser);
            parser.setAttribute('type');

            // Parse default value
            if (parser.skipWithValue(TokenType.SYMBOL, '=')) {
                parser.expect(TokenType.STRING);
                parser.setAttribute('default', parser.getCurrentValue());
                parser.advance();
            }

            parser.out();
            parser.expectWithValue(TokenType.SYMBOL, ';');
            parser.advance();

            return true;
        }

        return false;
    }

    compile() {
        // todo compile VariantDefinition
    }
}