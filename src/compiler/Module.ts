import AST from './AST';
import Source from '@/compiler/Source';

type ModuleId = string;

export default class Module {
    /**
     * @private
     */
    private readonly id: string;

    /**
     * @private
     */
    private readonly path: string;

    /**
     * @private
     */
    private readonly source: Source;

    /**
     * @private
     */
    private readonly ast: AST;

    /**
     * @param id
     * @param path
     * @param source
     * @param ast
     */
    constructor(id: ModuleId, path: string, source: Source, ast: AST) {
        this.id = id;
        this.path = path;
        this.source = source;
        this.ast = ast;
    }
}