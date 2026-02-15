import Symbol from '../context/Symbol';

export type ResolvedType =
    | { kind: 'primitive'; name: 'string' | 'number' | 'boolean' }
    | { kind: 'literal'; value: string | number | boolean }
    | { kind: 'union'; members: ResolvedType[] }
    | { kind: 'ref'; symbol: Symbol };