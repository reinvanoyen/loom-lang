import AstNode from '../parser/AstNode';
import TypeTable from './TypeTable';
import Type from '../parser/nodes/Type';
import { ResolvedType } from '../types/analyzer';
import IdentifierType from '../parser/nodes/IdentifierType';
import StringType from '../parser/nodes/StringType';
import Symbol from '../binder/Symbol';
import DiagnosticReporter from './DiagnosticReporter';

type TypeChildNode = IdentifierType | StringType;

export default class TypeResolver {
    /**
     * @private
     */
    private typeTable: TypeTable;

    /**
     * @private
     */
    private reporter: DiagnosticReporter;
    
    /**
     * @param typeTable
     */
    constructor(reporter: DiagnosticReporter, typeTable: TypeTable) {
        this.reporter = reporter;
        this.typeTable = typeTable;
    }

    /**
     *
     * @param symbol
     * @param type
     */
    defineType(symbol: Symbol, type: ResolvedType) {
        this.typeTable.registerType(symbol.getId(), type);
    }

    /**
     * @param type
     */
    resolveType(type: Type): ResolvedType {

        const children = type.getChildren();

        if (children.length > 1) {
            return {
                kind: 'union',
                members: this.normalizeUnion(children as TypeChildNode[])
            }
        }

        if (children.length === 1) {
            return this.resolveTypeNodeChild(children[0] as TypeChildNode);
        }

        this.reporter.report({
            severity: 'error',
            message: 'TypeResolver error, no types in type?',
        });
    }

    /**
     * @param typeChild
     */
    private resolveTypeNodeChild(typeChild: TypeChildNode): ResolvedType {

        if (typeChild instanceof IdentifierType) {

            if (typeChild.getValue() === 'string') {
                return {
                    kind: 'primitive',
                    name: 'string'
                };
            }

            const symbol = typeChild.getSymbol();

            if (symbol) {
                return { kind: 'ref', symbolId: symbol.getId() };
            }

            this.reporter.report({
                severity: 'error',
                message: `Unbound type identifier '${typeChild.getValue()}'`,
            });
        }

        if (typeChild instanceof StringType) {
            return {
                kind: 'literal',
                value: typeChild.getValue()
            };
        }

        this.reporter.report({
            severity: 'error',
            message: 'Unknown type node',
        });
    }

    /**
     * @param nodes
     * @private
     */
    private normalizeUnion(nodes: TypeChildNode[]): ResolvedType[] {
        const resolvedTypes = [];

        nodes.forEach(node => {
            resolvedTypes.push(this.resolveTypeNodeChild(node));
        });

        return resolvedTypes;
    }

    /**
     * @param ast
     */
    resolve(ast: AstNode) {
        ast.resolve(this);
    }
}