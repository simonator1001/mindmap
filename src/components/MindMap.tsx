import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import Toolbar from './Toolbar/Toolbar';
import NodeSettings from './Toolbar/NodeSettings';
import { NodeData, EdgeStyle, LineStyle, NodeSize } from '../types';
import { generateNodeContent } from '../services/aiService';
import { toast } from './Toast';

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node<NodeData>[] = [
  {
    id: '1',
    type: 'custom',
    data: { 
      label: 'Main Topic',
      shape: 'rectangle',
      backgroundColor: 'white',
      textColor: 'black',
      size: 'large'
    },
    position: { x: 250, y: 250 },
  },
];

const getNodeSize = (level: number): NodeSize => {
  if (level === 0) return 'large';
  if (level === 1) return 'medium';
  return 'small';
};

const createNewNode = (
  parentNode: Node<NodeData>,
  parentLevel: number
): Node<NodeData> => ({
  id: `${Date.now()}`,
  type: 'custom',
  data: { 
    label: 'New Topic',
    shape: 'rectangle' as const,
    backgroundColor: 'white',
    textColor: 'black',
    size: getNodeSize(parentLevel + 1)
  },
  position: {
    x: parentNode.position.x + 250,
    y: parentNode.position.y,
  },
});

function MindMap() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodes, setSelectedNodes] = useState<Node<NodeData>[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [edgeStyle, setEdgeStyle] = useState<EdgeStyle>('smoothstep');
  const [lineStyle, setLineStyle] = useState<LineStyle>('solid');
  const [showEdgeStylePanel, setShowEdgeStylePanel] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
      ...params, 
      type: edgeStyle,
      animated: lineStyle === 'animated'
    }, eds)),
    [setEdges, edgeStyle, lineStyle]
  );

  const updateEdgeStyle = useCallback((newStyle: EdgeStyle) => {
    setEdgeStyle(newStyle);
    setEdges((eds) => 
      eds.map((edge) => ({
        ...edge,
        type: newStyle,
      }))
    );
  }, [setEdges]);

  const updateLineStyle = useCallback((newStyle: LineStyle) => {
    setLineStyle(newStyle);
    setEdges((eds) => 
      eds.map((edge) => ({
        ...edge,
        animated: newStyle === 'animated',
      }))
    );
  }, [setEdges]);

  const addChildNode = useCallback(() => {
    const parentNode = selectedNodes[0] || nodes[0];
    if (!parentNode) return;

    const parentLevel = edges.filter(e => e.target === parentNode.id).length;
    const newNode = createNewNode(parentNode, parentLevel);

    const newEdge = {
      id: `e${parentNode.id}-${newNode.id}`,
      source: parentNode.id,
      target: newNode.id,
      type: edgeStyle,
      animated: lineStyle === 'animated',
    };

    setNodes(nds => [...nds, newNode]);
    setEdges(eds => [...eds, newEdge]);
    setSelectedNodes([newNode]);
    
    // Select the new node and trigger edit mode
    const nodeElement = document.querySelector(`[data-id="${newNode.id}"]`);
    if (nodeElement) {
      (nodeElement as HTMLElement).dispatchEvent(
        new MouseEvent('dblclick', { bubbles: true })
      );
    }
  }, [nodes, selectedNodes, setNodes, setEdges, edges, edgeStyle, lineStyle]);

  const addAINode = useCallback(async () => {
    const parentNode = selectedNodes[0] || nodes[0];
    if (!parentNode) return;

    setIsLoading(true);
    try {
      const content = await generateNodeContent(nodes, parentNode.id);
      
      const parentLevel = edges.filter(e => e.target === parentNode.id).length;

      const newNode: Node<NodeData> = {
        id: `${Date.now()}`,
        type: 'custom',
        data: { 
          label: content || 'New Topic',
          shape: 'rectangle' as const,
          backgroundColor: 'white',
          textColor: 'black',
          size: getNodeSize(parentLevel + 1)
        },
        position: {
          x: parentNode.position.x + 250,
          y: parentNode.position.y,
        },
      };

      const newEdge = {
        id: `e${parentNode.id}-${newNode.id}`,
        source: parentNode.id,
        target: newNode.id,
        type: edgeStyle,
        animated: lineStyle === 'animated',
      };

      setNodes(nds => [...nds, newNode]);
      setEdges(eds => [...eds, newEdge]);
    } catch (error) {
      console.error('AI node generation failed:', error);
      toast.error('Failed to generate AI suggestion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [nodes, selectedNodes, setNodes, setEdges, edges, edgeStyle, lineStyle]);

  const onSelectionChange = useCallback(
    (params: { nodes: Node<NodeData>[] }) => {
      setSelectedNodes(params.nodes);
      if (params.nodes.length === 0) {
        setShowSettings(false);
      }
    },
    []
  );

  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodes.length === 0) return;

    setNodes((nds) => nds.filter((node) => !selectedNodes.find((n) => n.id === node.id)));
    setEdges((eds) => 
      eds.filter((edge) => 
        !selectedNodes.find((node) => 
          node.id === edge.source || node.id === edge.target
        )
      )
    );
    setSelectedNodes([]);
    setShowSettings(false);
  }, [selectedNodes, setNodes, setEdges]);

  const updateSelectedNodes = useCallback((updates: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) =>
        selectedNodes.find((n) => n.id === node.id)
          ? {
              ...node,
              data: {
                ...node.data,
                ...updates,
              },
            }
          : node
      )
    );
  }, [selectedNodes, setNodes]);

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      if (selectedNodes.length === 0) return;
      
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onloadend = () => {
            updateSelectedNodes({ image: reader.result as string });
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [selectedNodes, updateSelectedNodes]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts if a node is selected and we're not editing text
      if (selectedNodes.length === 0 || event.target instanceof HTMLInputElement) {
        return;
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        addChildNode();
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteSelectedNodes();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, addChildNode, deleteSelectedNodes]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        fitView
        defaultEdgeOptions={{
          type: edgeStyle,
          animated: lineStyle === 'animated',
        }}
      >
        <Background />
        <Controls />
        <Panel position="top-left">
          <Toolbar 
            onAddNode={addChildNode}
            onAddAINode={addAINode}
            onDeleteSelected={deleteSelectedNodes}
            selectedNodes={selectedNodes}
            showSettings={showSettings}
            onToggleSettings={() => setShowSettings(!showSettings)}
            isLoading={isLoading}
            edgeStyle={edgeStyle}
            lineStyle={lineStyle}
            onEdgeStyleChange={updateEdgeStyle}
            onLineStyleChange={updateLineStyle}
            showEdgeStylePanel={showEdgeStylePanel}
            onToggleEdgeStylePanel={() => setShowEdgeStylePanel(!showEdgeStylePanel)}
          />
        </Panel>
        {showSettings && (
          <Panel position="top-left" className="top-20">
            <NodeSettings
              selectedNodes={selectedNodes}
              onUpdateNodes={updateSelectedNodes}
            />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

export default MindMap;