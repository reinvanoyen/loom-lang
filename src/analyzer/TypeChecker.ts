import AstNode from '../parser/AstNode';
import DiagnosticsResult from './DiagnosticsResult';
import TypeTable from './TypeTable';
import { ResolvedType } from '../types/analyzer';

export default class TypeChecker {

    /**
     * @private
     */
    private diagnostics: DiagnosticsResult;

    /**
     * @param diagnostics
     */
    constructor(diagnostics: DiagnosticsResult) {
        this.diagnostics = diagnostics;
    }

    /**
     * @param ast
     */
    check(ast: AstNode, typeTable: TypeTable) {
        ast.check(this, typeTable);
    }

    /**
     * @param type
     * @param value
     */
    isAssignable(type: ResolvedType, value: string) {
        return true;
    }
}