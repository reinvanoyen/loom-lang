import Node from '../Node';
import Parser from '../Parser';
import { TokenType } from '../../types/tokenization';
import Type from './Type';
import TypeChecker from '../../analyzer/TypeChecker';
import TypeTable from '../../analyzer/TypeTable';

export default class VariantDeclaration extends Node {

    getName(): string {
        return 'VARIANT_DECL';
    }

    /**
     * @param parser
     */
    static parse(parser: Parser): boolean {

        if (parser.skipWithValue(TokenType.SYMBOL,'@')) {

            if (parser.expect(TokenType.IDENT)) {
                parser.insert(new VariantDeclaration(parser.getCurrentValue()));
                parser.in();
                parser.advance();

                if (parser.expectWithValue(TokenType.SYMBOL, ':')) {
                    parser.advance();
                }

                Type.parse(parser);
                parser.setAttribute('type');

                // Parse default value
                if (parser.skipWithValue(TokenType.SYMBOL, '=')) {
                    if (parser.expect(TokenType.STRING)) {
                        parser.setAttribute('default', parser.getCurrentValue());
                        parser.advance();
                    }
                }

                parser.out();

                if (parser.expectWithValue(TokenType.SYMBOL, ';')) {
                    parser.advance();
                }
            }

            return true;
        }

        return false;
    }

    check(typeChecker: TypeChecker, typeTable: TypeTable) {
        //typeChecker.isAssignable(typeTable.getType(this.getAttribute('name')))
        //console.log(this.getAttribute('default'), typeTable.getType());
    }

    compile() {
        // todo compile VariantDefinition
    }
}