import AST from '@/compiler/AST';
import Namespace from '@/compiler/nodes/Namespace';
import EmissionModel from '@/compiler/emitter/EmissionModel';
import Class from '@/compiler/nodes/Class';
import StyleBlock from '@/compiler/nodes/StyleBlock';

export default class EmissionModelBuilder {
    /**
     * @private
     */
    private model: EmissionModel;

    /**
     *
     */
    constructor() {
        this.model = new EmissionModel();
    }

    /**
     * @param ast
     */
    build(ast: AST): EmissionModel {

        const nodes = ast.getChildren();

        nodes.forEach(node => {
            if (node instanceof Namespace) {
                this.buildNamespace(node);
            }

            if (node instanceof Class) {
                this.buildClass(node)
            }
        });

        return this.model;
    }

    /**
     * @param node
     * @private
     */
    private buildNamespace(node: Namespace) {
        this.model.setNamespace(node.getValue()!);
    }

    /**
     * @param classNode
     * @private
     */
    private buildClass(classNode: Class) {
        const className = classNode.getValue();
        const nodes = classNode.getChildren();

        let classStyles = '';

        nodes.forEach(node => {
            if (node instanceof StyleBlock) {
                classStyles += node.getAttribute('contents');
            }
        });

        this.model.registerClassEmission(className, {
            classStyles
        });
        /*
        this.model.registerClassEmission(className, {
            name: className;
            parent?: string;
            slots: string[];           // merged from inheritance
            classStyles: string[];     // raw CSS bodies
            slotStyles: Map<string, string[]>; // future: slot icon {% ... %}
        });*/
    }
}