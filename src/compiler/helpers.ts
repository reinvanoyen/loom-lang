import path from 'node:path';
import Symbol from './binder/Symbol';

export function resolveImport(specifier: string, fromPath: string): string {

    if (path.isAbsolute(specifier)) {
        return path.normalize(specifier);
    }

    return path.resolve(path.dirname(fromPath), specifier);
}

export function namespacedKey(name: string, namespace?: string | null): string {
    return ! namespace ? name : `${namespace}::${name}`;
}

export function symbolMapToString(map: Map<string, Symbol>) {
    return [...map]
        .map(([key, value]) => `${key}=${String(value.getId())}`)
        .join(',');
}