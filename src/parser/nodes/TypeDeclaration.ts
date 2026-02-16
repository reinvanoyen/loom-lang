import Node from '../Node';
import Parser from '../Parser';
import { TokenType } from '../../types/tokenization';
import Type from './Type';
import Compiler from '../../compiler/Compiler';
import Binder from '../../binder/Binder';
import Symbol from '../../binder/Symbol';
import TypeResolver from '../../analyzer/TypeResolver';

export default class TypeDeclaration extends Node {

    getName(): string {
        return 'TYPE_DECL';
    }

    static parse(parser: Parser): boolean {

        if (parser.skipWithValue(TokenType.IDENT, 'type')) {
            if (parser.expect(TokenType.IDENT)) {
                parser.insert(new TypeDeclaration(parser.getCurrentValue()));
                parser.in();
                parser.advance();

                if (parser.expectWithValue(TokenType.SYMBOL, '=')) {
                    parser.advance();
                }

                Type.parse(parser);

                parser.out();

                if(parser.expectWithValue(TokenType.SYMBOL, ';')) {
                    parser.advance();
                }
            }

            return true;
        }

        return false;
    }

    bind(binder: Binder) {

        const id = this.getId();
        const value = this.getValue();

        if (id && value) {
            const symbol = new Symbol('type', id);
            this.setSymbol(symbol);
            binder.addType(value, symbol);
        }

        this.getChildren().forEach(child => child.bind(binder));
    }

    resolve(typeResolver: TypeResolver) {

        const rhs = this.getChildren().find(child => child instanceof Type) as Type | undefined;

        if (!rhs) {
            // todo - potentially report this issue through diagnostics?
            return;
        }

        const symbol = this.getSymbol();

        if (! symbol) {
            // todo - potentially report this issue through diagnostics?
            return;
        }

        const resolvedType = typeResolver.resolveType(rhs);

        if (! resolvedType) {
            // todo - potentially report this issue through diagnostics?
            return;
        }

        typeResolver.defineType(symbol, resolvedType);
    }

    compile(compiler: Compiler) {
        //
    }
}