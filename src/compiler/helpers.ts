import path from 'node:path';

export function resolveImport(specifier: string, fromPath: string): string {

    if (path.isAbsolute(specifier)) {
        return path.normalize(specifier);
    }

    return path.resolve(path.dirname(fromPath), specifier);
}

export function namespacedKey(name: string, namespace?: string | null): string {
    return ! namespace ? name : `${namespace}::${name}`;
}