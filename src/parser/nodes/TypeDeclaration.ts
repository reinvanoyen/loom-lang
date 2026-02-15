import Node from '../Node';
import Parser from '../Parser';
import { TokenType } from '../../types/tokenization';
import Type from './Type';
import Compiler from '../../compiler/Compiler';
import String from './String';
import Identifier from './Identifier';
import { TypeSymbol } from '../../context/SymbolTable';
import Binder from '../../context/Binder';

export default class TypeDeclaration extends Node {

    static parse(parser: Parser): boolean {

        if (parser.skipWithValue(TokenType.IDENT, 'type')) {
            parser.expect(TokenType.IDENT);
            parser.insert(new TypeDeclaration(parser.getCurrentValue()));
            parser.in();
            parser.advance();
            
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

    private getTypeSymbols(children: Node[]): TypeSymbol[] {

        const options: TypeSymbol[] = [];

        children.forEach(child => {
            child.getChildren().forEach(typeChild => {
                if (typeChild instanceof Identifier) {
                    options.push({
                        type: 'identifier',
                        value: typeChild.getValue()
                    });
                }
                if (typeChild instanceof String) {
                    options.push({
                        type: 'string',
                        value: typeChild.getValue()
                    });
                }
            })
        });

        return options;
    }

    bind(binder: Binder) {
        binder.symbols().declareType(
            this.getValue(),
            this.getTypeSymbols(this.getChildren())
        );
    }

    compile(compiler: Compiler) {
        //
    }
}