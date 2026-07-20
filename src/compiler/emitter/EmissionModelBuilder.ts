import AST from '@/compiler/parser/AST';
import Namespace from '@/compiler/nodes/Namespace';
import EmissionModel, { ClassEmission } from '@/compiler/emitter/EmissionModel';
import Class from '@/compiler/nodes/Class';
import StyleBlock from '@/compiler/nodes/StyleBlock';
import SlotDeclaration from '@/compiler/nodes/SlotDeclaration';
import ClassAugmentation from '@/compiler/nodes/ClassAugmentation';
import Node from '@/compiler/parser/Node';
import { namespacedKey } from '@/compiler/helpers';
import ClassReference from '@/compiler/nodes/ClassReference';

/**
 * Semantic extraction from AST
 */
export default class EmissionModelBuilder {
    /**
     * @private
     */
    private model: EmissionModel;

    /**
     * @private
     */
    private currentNamespace: string = 'global';

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
                this.currentNamespace = node.getValue()!;
            }

            if (node instanceof Class) {
                this.collectClass(node, this.currentNamespace)
            }
        });
    }

    /**
     * @param classNode
     * @param namespace
     * @private
     */
    private collectClass(classNode: Class, namespace: string) {
        const className = classNode.getValue()!;
        const nodes = classNode.getChildren();

        const ownClassStyles: string[] = this.extractStyleBlocks(nodes);
        const ownSlots: string[] = [];
        const ownSlotStyles = new Map<string, string[]>();

        const parentSymbol = classNode.getSymbol('parent');

        const parentRefNode = classNode.getAttribute('parentRef');
        const parentName =
            parentRefNode instanceof ClassReference ? parentRefNode.getValue() : null;
        const parentNamespace =
            parentRefNode instanceof ClassReference
                ? (parentRefNode.getNamespace() ?? namespace)
                : null;

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
                    parentName !== null &&
                    this.classHasSlot(namespacedKey(parentName, parentNamespace), slotName);

                if (! isStyleOnly && !ownSlots.includes(slotName)) {
                    ownSlots.push(slotName);
                }
            }
        });

        const classEmission = this.model.getOrCreateClassEmission(namespace, className);

        if (parentSymbol) {
            classEmission.parent = parentName || undefined;
            classEmission.parentNamespace = parentNamespace || undefined;
        }

        classEmission.namespace = namespace;
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
            const nsParentClassName = this.parentKey(classEmission);
            if( nsParentClassName) {
                const parentClassEmission = this.model.getClasses().get(nsParentClassName);
                if (!parentClassEmission) {
                    // todo
                    // report unknown parent (binder should catch this eventually)
                } else {
                    inherited = this.resolveSlotsForClass(nsParentClassName, visiting);
                }
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
            const nsParentClassName = this.parentKey(classEmission);

            if (nsParentClassName) {
                const parentClassEmission = this.model.getClasses().get(nsParentClassName);
                if (!parentClassEmission) {
                    // todo report unknown parent
                } else {
                    inherited = this.resolveStylesForClass(nsParentClassName, visiting);
                }
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
            const nsParentClassName = this.parentKey(classEmission);
            if (nsParentClassName) {
                const parentClassEmission = this.model.getClasses().get(nsParentClassName);
                if (parentClassEmission) {
                    const inherited = this.resolveSlotStylesForClass(nsParentClassName, visiting);
                    for (const [slot, styles] of inherited) {
                        merged.set(slot, [...styles]);
                    }
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
        ast.getChildren().forEach(node => {
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
        const symbol = classAugNode.getSymbol();
        const classRef = classAugNode.getAttribute('classRef');

        // No symbol or className
        if (!symbol || !classRef || ! (classRef instanceof ClassReference)) {
            return;
        }

        const classRefName = classRef.getValue();

        if (! classRefName) {
            return;
        }

        // Get the namespace
        const namespace = symbol.getNamespace() ?? 'global';

        const classEmission = this.findClassEmission(namespace, classRefName);
        if (!classEmission) {
            // todo report with diagnostics
            return;
        }

        // Add the class styles to the classEmission
        const classStyles = this.extractStyleBlocks(classAugNode.getChildren());
        classEmission.ownClassStyles.push(...classStyles);
    }

    /**
     * @param namespace
     * @param className
     * @private
     */
    private findClassEmission(namespace: string, className: string) {
        for (const emission of this.model.getClasses().values()) {
            if (emission.namespace === namespace && emission.name === className) {
                return emission;
            }
        }
        return undefined;
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
            const parentKey = this.parentKey(classEmission);
            if (parentKey) {
                return this.classHasSlot(parentKey, slotName);
            }
        }

        return false;
    }

    /**
     * @param emission
     * @private
     */
    private parentKey(emission: ClassEmission): string | undefined {

        if (!emission.parent) {
            return undefined;
        }

        return namespacedKey(
            emission.parent,
            emission.parentNamespace ?? emission.namespace
        );
    }
}