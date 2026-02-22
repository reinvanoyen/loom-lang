import Symbol from '../Symbol';
import { ResolvedType } from './analyzer';
import AST from '../AST';
import TypeTable from '../TypeTable';
import TokenStream from '../TokenStream';

export interface TEventMap {
    startTokenization: { code: string }
    startParsing: { tokenStream: TokenStream }
    endParsing: { tokenStream: TokenStream }
    startTypeResolving: { ast: AST }
    startTypeChecking: { ast: AST, typeTable: TypeTable }
    symbolBind: { name: string, symbol: Symbol }
    typeDefine: { symbol: Symbol, type: ResolvedType }
}

export type TEventKey<E> = keyof E;

export type TEventListener<E, K extends TEventKey<E>> =
    E[K] extends void
        ? () => void
        : (event: E[K]) => void;