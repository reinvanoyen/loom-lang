import Node from '../parsing/Node';
import Parser from '../parsing/Parser';
import { TokenType } from '../types/tokenization';

export default class VariantDefinitionNode extends Node {

    /**
     * @private
     */
    private options: string[] = [];

    /**
     * @param parser
     */
    static parse(parser: Parser): boolean {

        if (parser.skipWithValue(TokenType.SYMBOL,'@')) {
            parser.expect(TokenType.IDENT);
            parser.insert(new VariantDefinitionNode());
            parser.in();
            parser.setAttribute('name', parser.getCurrentValue());
            parser.advance();

            this.parseOptions(parser);

            // Parse default value
            if (parser.skipWithValue(TokenType.SYMBOL, '=')) {
                parser.expect(TokenType.IDENT);

                const scope = parser.getScope();

                if (! (scope instanceof VariantDefinitionNode)) {
                    throw new Error('Wrong instanceof');
                }

                if (! scope.getOptions().includes(parser.getCurrentValue())) {
                    throw new Error('Value not assignable to variant');
                }

                parser.setAttribute('default', parser.getCurrentValue());
                parser.advance();
            }

            parser.out();
            return true;
        }

        return false;
    }

    private static parseOption(parser: Parser) {
        if (parser.accept(TokenType.IDENT)) {

            const scope = parser.getScope();

            if (! (scope instanceof VariantDefinitionNode)) {
                throw new Error('Wrong instanceof');
            }

            scope.addOption(parser.getCurrentValue());
            parser.advance();
            return true;
        }

        return false;
    }

    private static parseOptions(parser: Parser) {
        if (this.parseOption(parser)) {
            if (parser.skipWithValue(TokenType.SYMBOL, '|')) {
                this.parseOptions(parser);
            }
            return true;
        }

        return false;
    }

    getOptions(): string[] {
        return this.options;
    }

    addOption(value: string) {
        this.options.push(value);
    }

    compile() {
        // todo compile VariantDefinition
    }
}