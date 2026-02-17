import Node from '../Node';
import Parser from '../Parser';
import { TokenType } from '../../types/tokenization';
import Compiler from '../../Compiler';
import Binder from '../../binder/Binder';
import TypeResolver from '../../analyzer/TypeResolver';

export default class Namespace extends Node {

    getName(): string {
        return 'NS';
    }

    static parse(parser: Parser): boolean {
        if (parser.skipWithValue(TokenType.IDENT, 'namespace')) {

            if (parser.expect(TokenType.IDENT)) {
                parser.insert(new Namespace(parser.getCurrentValue()));
                parser.advance();
            }

            if (parser.expectWithValue(TokenType.SYMBOL, ';')) {
                parser.advance();
            }

            return true;
        }

        return false;
    }

    bind(binder: Binder) {

        const value = this.getValue();

        if (! value) {
            return;
        }

        binder.namespace(value);
    }

    resolve(typeResolver: TypeResolver) {
        //typeResolver.namespace(this.getValue());
    }

    compile(compiler: Compiler) {
        //compiler.symbols().setNamespace(this.getValue());
    }
}