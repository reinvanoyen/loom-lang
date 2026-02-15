import Node from '../Node';
import Parser from '../Parser';
import { TokenType } from '../../types/tokenization';
import Type from './Type';
import Compiler from '../../compiler/Compiler';
import Binder from '../../context/Binder';
import Symbol from '../../context/Symbol';
import TypeResolver from '../../analyzer/TypeResolver';

export default class TypeDeclaration extends Node {

    static parse(parser: Parser): boolean {

        if (parser.skipWithValue(TokenType.IDENT, 'type')) {
            parser.expect(TokenType.IDENT);
            parser.insert(new TypeDeclaration(parser.getCurrentValue()));
            parser.in();
            parser.advance();
            
            parser.expectWithValue(TokenType.SYMBOL, '=');
            parser.advance();

            Type.parse(parser);

            parser.out();
            parser.expectWithValue(TokenType.SYMBOL, ';');
            parser.advance();

            return true;
        }

        return false;
    }

    bind(binder: Binder) {
        this.setSymbol(new Symbol('type', this.getId()));
        binder.addType(this.getValue(), this.getSymbol());

        this.getChildren().forEach(child => child.bind(binder));
    }

    resolve(typeResolver: TypeResolver) {

        const rhs = this.getChildren().find(child => child instanceof Type) as Type | undefined;

        if (!rhs) {
            throw new Error(`TypeResolver error: missing RHS type for '${this.getValue()}'`);
        }

        typeResolver.defineType(this.getSymbol(), typeResolver.resolveType(rhs));
    }

    compile(compiler: Compiler) {
        //
    }
}