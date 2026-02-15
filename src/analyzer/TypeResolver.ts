import AstNode from '../parser/AstNode';
import { Namespace } from '../types/namespace';
import TypeTable from './TypeTable';
import SymbolTable from '../context/SymbolTable';
import Type from '../parser/nodes/Type';
import { ResolvedType } from '../types/analyzer';
import Identifier from '../parser/nodes/Identifier';
import String from '../parser/nodes/String';

type TypeChildNode = Identifier | String;

export default class TypeResolver {
    /**
     * @private
     */
    private typeTable: TypeTable;

    /**
     * @private
     */
    private symbolTable: SymbolTable;

    /**
     * @private
     */
    private currentNamespace: Namespace = 'global';

    /**
     * @param typeTable
     */
    constructor(typeTable: TypeTable, symbolTable: SymbolTable) {
        this.typeTable = typeTable;
        this.symbolTable = symbolTable;
    }

    /**
     * @param name
     * @param type
     */
    defineType(name: string, type: ResolvedType) {
        this.typeTable.registerType(name, type);
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

        if (typeChild instanceof Identifier) {

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

            return { kind: 'ref', symbol };
        }

        if (typeChild instanceof String) {
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