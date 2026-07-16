import Node from '../parser/Node';
import TypeChecker from '../type-safety/TypeChecker';
import TypeTable from '../type-safety/TypeTable';

export default class VariantDeclaration extends Node {

    getName(): string {
        return 'VARIANT_DECL';
    }

    check(typeChecker: TypeChecker, typeTable: TypeTable) {
        //typeChecker.isAssignable(typeTable.getType(this.getAttribute('name')))
        //console.log(this.getAttribute('default'), typeTable.getType());
    }
}