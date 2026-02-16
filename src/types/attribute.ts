import Node from '../parser/Node';

export type AttributeValue = Node | string | number;
export type InternalValue = string | number | Record<string, unknown>;