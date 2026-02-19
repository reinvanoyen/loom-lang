import Node from '../Node';
import TypeChecker from '../../analyzer/TypeChecker';
import TypeTable from '../../analyzer/TypeTable';

export default class VariantDeclaration extends Node {

    getName(): string {
        return 'VARIANT_DECL';
    }

    check(typeChecker: TypeChecker, typeTable: TypeTable) {
        //typeChecker.isAssignable(typeTable.getType(this.getAttribute('name')))
        //console.log(this.getAttribute('default'), typeTable.getType());
    }

    compile() {
        // todo compile VariantDefinition
    }
}