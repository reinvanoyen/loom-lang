import Node from '../Node';
import Parser from '../Parser';
import { TokenType } from '../../types/tokenization';
import Identifier from './Identifier';
import String from './String';

export default class Type extends Node {
    /**
     * @param parser
     */
    static parse(parser: Parser): boolean {

        parser.expectOneOf([TokenType.IDENT, TokenType.STRING]);

        parser.insert(new Type());
        parser.in();

        if (this.parseUnionType(parser)) {
            parser.out();
            return true;
        }

        return false;
    }

    private static parseType(parser: Parser) {
        if (parser.accept(TokenType.IDENT)) {
            parser.insert(new Identifier(parser.getCurrentValue()))
            parser.advance();
            return true;
        }

        if (parser.accept(TokenType.STRING)) {
            parser.insert(new String(parser.getCurrentValue()))
            parser.advance();
            return true;
        }

        return false;
    }

    private static parseUnionType(parser: Parser) {
        if (this.parseType(parser)) {
            if (parser.skipWithValue(TokenType.SYMBOL, '|')) {
                this.parseUnionType(parser);
            }
            return true;
        }

        return false;
    }

    compile() {
        // todo compile VariantDefinition
    }
}