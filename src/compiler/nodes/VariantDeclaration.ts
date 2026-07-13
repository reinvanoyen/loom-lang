import Node from '../Node';
import TypeChecker from '../TypeChecker';
import TypeTable from '../TypeTable';

export default class VariantDeclaration extends Node {

    getName(): string {
        return 'VAR_DECL';
    }

    check(typeChecker: TypeChecker, typeTable: TypeTable) {
        //typeChecker.isAssignable(typeTable.getType(this.getAttribute('name')))
        //console.log(this.getAttribute('default'), typeTable.getType());
    }
}