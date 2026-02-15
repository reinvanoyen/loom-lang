import Node from '../Node';
import Parser from '../Parser';
import { TokenType } from '../../types/tokenization';
import IdentifierType from './IdentifierType';
import StringType from './StringType';
import Binder from '../../binder/Binder';

export default class Type extends Node {
    /**
     * @param parser
     */
    static parse(parser: Parser): boolean {

        if (parser.expectOneOf([TokenType.IDENT, TokenType.STRING])) {

            parser.insert(new Type());
            parser.in();

            if (this.parseUnionType(parser)) {
                parser.out();
            }

            return true;
        }

        return false;
    }

    private static parseType(parser: Parser) {
        if (parser.accept(TokenType.IDENT)) {
            parser.insert(new IdentifierType(parser.getCurrentValue()))
            parser.advance();
            return true;
        }

        if (parser.accept(TokenType.STRING)) {
            parser.insert(new StringType(parser.getCurrentValue()))
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

    bind(binder: Binder) {
        this.getChildren().forEach(child => {
            child.bind(binder);
        });
    }

    compile() {
        // todo compile VariantDefinition
    }
}