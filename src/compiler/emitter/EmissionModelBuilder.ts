import AST from '@/compiler/AST';
import Namespace from '@/compiler/nodes/Namespace';
import EmissionModel from '@/compiler/emitter/EmissionModel';
import Class from '@/compiler/nodes/Class';
import StyleBlock from '@/compiler/nodes/StyleBlock';
import SlotDeclaration from '@/compiler/nodes/SlotDeclaration';
import ClassAugmentation from '@/compiler/nodes/ClassAugmentation';
import Node from '@/compiler/Node';

/**
 * Semantic extraction from AST
 */
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
    public build(ast: AST): EmissionModel {
        this.collect(ast);
        this.applyAugmentations(ast);
        this.resolveInheritance();

        return this.model;
    }

    /**
     * @param ast
     * @private
     */
    private collect(ast: AST) {
        const nodes = ast.getChildren();

        nodes.forEach(node => {
            if (node instanceof Namespace) {
                this.collectNamespace(node);
            }

            if (node instanceof Class) {
                this.collectClass(node)
            }
        });
    }

    /**
     * @param node
     * @private
     */
    private collectNamespace(node: Namespace) {
        this.model.setNamespace(node.getValue()!);
    }

    /**
     * @param classNode
     * @private
     */
    private collectClass(classNode: Class) {
        const parent = classNode.getStringAttribute('parent');
        const className = classNode.getValue()!;
        const nodes = classNode.getChildren();

        const ownClassStyles: string[] = this.extractStyleBlocks(nodes);
        const ownSlots: string[] = [];
        const ownSlotStyles = new Map<string, string[]>();

        nodes.forEach(node => {
            if (node instanceof SlotDeclaration) {
                const slotName = node.getValue()!;
                const contents = node.getStringAttribute('contents');

                if (contents) {
                    const existing = ownSlotStyles.get(slotName) ?? [];
                    ownSlotStyles.set(slotName, [...existing, contents]);
                }

                const isStyleOnly =
                    contents !== null &&
                    (parent !== null && parent !== undefined) &&
                    this.classHasSlot(parent, slotName);

                if (!isStyleOnly && !ownSlots.includes(slotName)) {
                    ownSlots.push(slotName);
                }
            }
        });

        const classEmission = this.model.getOrCreateClassEmission(className);
        classEmission.parent = parent || undefined;
        classEmission.ownClassStyles = ownClassStyles;
        classEmission.ownSlots = ownSlots;
        classEmission.ownSlotStyles = ownSlotStyles;
    }

    /**
     * @private
     */
    private resolveInheritance() {
        for (const [className] of this.model.getClasses()) {
            const classEmission = this.model.getClasses().get(className)!;
            classEmission.slots = this.resolveSlotsForClass(className, new Set());
            classEmission.classStyles = this.resolveStylesForClass(className, new Set());
            classEmission.slotStyles = this.resolveSlotStylesForClass(className, new Set());
        }
    }

    /**
     * @param className
     * @param visiting
     * @private
     */
    private resolveSlotsForClass(className: string, visiting: Set<string>): string[] {

        const classEmission = this.model.getClasses().get(className);

        if (!classEmission) {
            return [];
        }

        if (visiting.has(className)) {
            // todo
            // report circular extends error
            return [];
        }

        visiting.add(className);

        const ownSlots = classEmission.ownSlots;

        let inherited: string[] = [];

        if (classEmission.parent) {
            const parentCls = this.model.getClasses().get(classEmission.parent);
            if (!parentCls) {
                // todo
                // report unknown parent (binder should catch this eventually)
            } else {
                inherited = this.resolveSlotsForClass(classEmission.parent, visiting);
            }
        }

        // We're done visiting, so remove
        visiting.delete(className);

        // duplicate check: own slot collides with inherited
        for (const slot of ownSlots) {
            if (inherited.includes(slot)) {
                // todo
                // report E_SLOT_DUPLICATE
            }
        }

        return [...inherited, ...ownSlots];
    }

    /**
     * @param className
     * @param visiting
     * @private
     */
    private resolveStylesForClass(className: string, visiting: Set<string>): string[] {

        const classEmission = this.model.getClasses().get(className);

        if (!classEmission) {
            return [];
        }

        if (visiting.has(className)) {
            // report circular extends
            return [];
        }

        visiting.add(className);

        // Direct styles = own body + augments (if augments append to ownClassStyles)
        const directStyles = classEmission.ownClassStyles;

        let inherited: string[] = [];

        if (classEmission.parent) {
            const parent = this.model.getClasses().get(classEmission.parent);

            if (!parent) {
                // report unknown parent
            } else {
                inherited = this.resolveStylesForClass(classEmission.parent, visiting);
            }
        }

        visiting.delete(className);

        return [...inherited, ...directStyles];
    }

    /**
     * @param className
     * @param visiting
     * @private
     */
    private resolveSlotStylesForClass(className: string, visiting: Set<string>): Map<string, string[]> {

        const classEmission = this.model.getClasses().get(className);

        if (!classEmission) {
            return new Map();
        }

        // Check for circular extends
        if (visiting.has(className)) {
            return new Map();
        }

        visiting.add(className);

        const merged = new Map<string, string[]>();

        // Parent slot styles first
        if (classEmission.parent) {
            const parent = this.model.getClasses().get(classEmission.parent);

            if (parent) {
                const inherited = this.resolveSlotStylesForClass(classEmission.parent, visiting);
                for (const [slot, styles] of inherited) {
                    merged.set(slot, [...styles]);
                }
            }
        }

        // Own slot styles append (child overrides / adds)
        for (const [slot, styles] of classEmission.ownSlotStyles) {
            merged.set(slot, [...(merged.get(slot) ?? []), ...styles]);
        }

        // Done visiting, so delete
        visiting.delete(className);

        return merged;
    }

    /**
     * @param ast
     * @private
     */
    private applyAugmentations(ast: AST) {
        const nodes = ast.getChildren();

        nodes.forEach(node => {
            if (node instanceof ClassAugmentation) {
                this.applyClassAugmentation(node);
            }
        });
    }

    /**
     * @param classAugNode
     * @private
     */
    private applyClassAugmentation(classAugNode: ClassAugmentation) {
        const className = classAugNode.getValue()!;
        const nodes = classAugNode.getChildren();

        const classStyles = this.extractStyleBlocks(nodes);

        const classEmission = this.model.getOrCreateClassEmission(className);
        classEmission.ownClassStyles.push(...classStyles);
    }

    /**
     * @param nodes
     * @private
     */
    private extractStyleBlocks(nodes: Node[]): string[] {
        const styles: string[] = [];

        nodes.forEach(node => {
            if (node instanceof StyleBlock) {
                const styleContents = node.getStringAttribute('contents');

                if (styleContents) {
                    styles.push(styleContents);
                }
            }
        });

        return styles;
    }

    /**
     * Whether className already has slotName (own slots, own slot styles, or inherited).
     * Safe during collect as long as parent classes are collected first (source order).
     */
    private classHasSlot(className: string, slotName: string): boolean {
        const classEmission = this.model.getClasses().get(className);

        if (!classEmission) {
            return false;
        }

        if (classEmission.ownSlots.includes(slotName)) {
            return true;
        }

        if (classEmission.ownSlotStyles.has(slotName)) {
            return true;
        }

        if (classEmission.parent) {
            return this.classHasSlot(classEmission.parent, slotName);
        }

        return false;
    }
}