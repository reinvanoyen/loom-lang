import Node from '../Node';
import Type from './Type';
import Compiler from '../../Compiler';
import Binder from '../../binder/Binder';
import Symbol from '../../binder/Symbol';
import TypeResolver from '../../analyzer/TypeResolver';

export default class TypeDeclaration extends Node {

    getName(): string {
        return 'TYPE_DECL';
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