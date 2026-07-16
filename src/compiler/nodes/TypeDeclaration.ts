import Node from '../parser/Node';
import Type from './Type';
import TypeResolver from '../type-safety/TypeResolver';

export default class TypeDeclaration extends Node {

    getName(): string {
        return 'TYPE_DECL';
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
}