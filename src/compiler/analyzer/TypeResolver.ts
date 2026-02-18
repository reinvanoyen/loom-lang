import AST from '../parser/AST';
import TypeTable from './TypeTable';
import Type from '../parser/nodes/Type';
import { ResolvedType } from '../types/analyzer';
import IdentifierType from '../parser/nodes/IdentifierType';
import StringType from '../parser/nodes/StringType';
import Symbol from '../binder/Symbol';
import Reporter from '../diagnostics/Reporter';
import { Nullable } from '../types/nullable';
import EventBus from '../../core/bus/EventBus';
import { TEventMap } from '../types/bus';

type TypeChildNode = IdentifierType | StringType;

export default class TypeResolver {
    /**
     * @private
     */
    private events: EventBus<TEventMap>;

    /**
     * @private
     */
    private typeTable: TypeTable;

    /**
     * @private
     */
    private reporter: Reporter;
    
    /**
     * @param typeTable
     */
    constructor(events: EventBus<TEventMap>, reporter: Reporter, typeTable: TypeTable) {
        this.events = events;
        this.reporter = reporter;
        this.typeTable = typeTable;
    }

    /**
     *
     * @param symbol
     * @param type
     */
    defineType(symbol: Symbol, type: ResolvedType) {
        const symbolId = symbol.getId();

        if (! symbolId) {
            this.reporter.report({
                severity: 'error',
                message: 'Symbol has no id'
            });
            return;
        }

        this.typeTable.registerType(symbolId, type);
        this.events.emit('typeDefine', { symbol, type });
    }

    /**
     * @param type
     */
    resolveType(type: Type): Nullable<ResolvedType> {

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

        return null;
    }

    /**
     * @param typeChild
     */
    private resolveTypeNodeChild(typeChild: TypeChildNode): Nullable<ResolvedType> {

        if (typeChild instanceof IdentifierType) {

            if (typeChild.getValue() === 'string') {
                return {
                    kind: 'primitive',
                    name: 'string'
                };
            }

            const symbol = typeChild.getSymbol();

            if (! symbol) {
                this.reporter.report({
                    severity: 'error',
                    message: `Unbound type identifier '${typeChild.getValue()}'`,
                });
                return null;
            }

            const symbolId = symbol.getId();

            if (!symbolId) {
                console.log(symbol);
                this.reporter.report({
                    severity: 'error',
                    message: 'Symbol has no id',
                });
                return null;
            }

            return { kind: 'ref', symbolId: symbolId };
        }

        if (typeChild instanceof StringType) {
            const value = typeChild.getValue();

            if (value) {
                return { kind: 'literal', value };
            }

            // todo - we might want to report this
            return null;
        }

        this.reporter.report({
            severity: 'error',
            message: 'Unknown type node',
        });

        return null;
    }

    /**
     * @param nodes
     * @private
     */
    private normalizeUnion(nodes: TypeChildNode[]): ResolvedType[] {
        const resolvedTypes: ResolvedType[] = [];

        nodes.forEach(node => {
            const resolvedType = this.resolveTypeNodeChild(node);

            if (resolvedType) {
                resolvedTypes.push(resolvedType);
            }
        });

        return resolvedTypes;
    }

    /**
     * @param ast
     */
    resolve(ast: AST) {
        this.events.emit('startTypeResolving', { ast });
        ast.resolve(this);
    }
}