import AstNode from '../parser/AstNode';
import DiagnosticReporter from './DiagnosticReporter';
import TypeTable from './TypeTable';
import { ResolvedType } from '../types/analyzer';

export default class TypeChecker {

    /**
     * @private
     */
    private reporter: DiagnosticReporter;

    /**
     * @param reporter
     */
    constructor(reporter: DiagnosticReporter) {
        this.reporter = reporter;
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