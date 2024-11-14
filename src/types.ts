import { Node } from 'reactflow';

export type NodeShape = 'rectangle' | 'circle' | 'diamond' | 'hexagon';
export type NodeSize = 'small' | 'medium' | 'large';
export type EdgeStyle = 'default' | 'straight' | 'step' | 'smoothstep' | 'bezier';
export type LineStyle = 'solid' | 'dashed' | 'dotted' | 'animated';

export interface NodeData {
  label: string;
  shape: NodeShape;
  backgroundColor: string;
  textColor: string;
  size: NodeSize;
  image?: string;
}

export type MindMapNode = Node<NodeData>;