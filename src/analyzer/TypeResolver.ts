import AstNode from '../parser/AstNode';
import TypeTable from './TypeTable';
import Type from '../parser/nodes/Type';
import { ResolvedType } from '../types/analyzer';
import IdentifierType from '../parser/nodes/IdentifierType';
import StringType from '../parser/nodes/StringType';
import Symbol from '../context/Symbol';

type TypeChildNode = IdentifierType | StringType;

export default class TypeResolver {
    /**
     * @private
     */
    private typeTable: TypeTable;

    /**
     * @param typeTable
     */
    constructor(typeTable: TypeTable) {
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

        throw new Error('TypeResolver error, no types in type?');
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

            if (!symbol) {
                throw new Error(`Unbound type identifier '${typeChild.getValue()}'`);
            }

            return { kind: 'ref', symbolId: symbol.getId() };
        }

        if (typeChild instanceof StringType) {
            return {
                kind: 'literal',
                value: typeChild.getValue()
            };
        }

        throw new Error('Unknown type node');
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