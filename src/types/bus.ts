import Symbol from '../binder/Symbol';
import { TokenStream } from './tokenization';
import { ResolvedType } from './analyzer';
import AstNode from '../parser/AstNode';
import TypeTable from '../analyzer/TypeTable';

export interface TEventMap {
    startTokenization: { code: string }
    startParsing: { tokenStream: TokenStream }
    startTypeResolving: { ast: AstNode }
    startTypeChecking: { ast: AstNode, typeTable: TypeTable }
    symbolBind: { name: string, symbol: Symbol }
    typeDefine: { symbol: Symbol, type: ResolvedType }
}

export type TEventKey<E> = keyof E;

export type TEventListener<E, K extends TEventKey<E>> =
    E[K] extends void
        ? () => void
        : (event: E[K]) => void;