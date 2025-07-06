import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useOnSelectionChange,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from '../nodes';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'startNode',
    position: { x: 100, y: 100 },
    data: {
      label: 'Trigger',
      category: 'control',
      controlType: 'start'
    },
  },
  {
    id: '2',
    type: 'coreActionNode',
    position: { x: 300, y: 100 },
    data: {
      label: 'Discord',
      category: 'alert',
      action: 'discord',
      description: 'Send message to Discord',
    },
  },
  {
    id: '3',
    type: 'endNode',
    position: { x: 500, y: 100 },
    data: {
      label: 'End',
      category: 'control',
      controlType: 'end'
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

interface WorkflowCanvasProps {
  onWorkflowStateChange?: (nodes: Node[], edges: Edge[]) => void;
  onNodeSelection?: (node: Node | null) => void;
}

const WorkflowCanvasInner: React.FC<WorkflowCanvasProps> = ({ 
  onWorkflowStateChange, 
  onNodeSelection 
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    onWorkflowStateChange?.(nodes, edges);
  }, [nodes, edges, onWorkflowStateChange]);

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[]; edges: Edge[] }) => {
      const node = selectedNodes.length > 0 ? selectedNodes[0] : null;
      setSelectedNode(node);
      onNodeSelection?.(node);
    },
    [onNodeSelection]
  );

  useOnSelectionChange({
    onChange: onSelectionChange,
  });

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeTemplate = JSON.parse(
        event.dataTransfer.getData('application/reactflow')
      );

      if (!nodeTemplate || !reactFlowWrapper.current) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      const newNode: Node = {
        id: `${nodeTemplate.id}-${Date.now()}`,
        type: nodeTemplate.type,
        position,
        data: {
          ...nodeTemplate.data,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    setSelectedNode(null);
    onNodeSelection?.(null);
  }, [setNodes, setEdges, onNodeSelection]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (selectedNode) {
        handleDeleteNode(selectedNode.id);
      }
    }
  }, [selectedNode, handleDeleteNode]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            onDelete: () => handleDeleteNode(node.id)
          }
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        className="bg-background"
        deleteKeyCode={null}
        selectNodesOnDrag={false} 
        multiSelectionKeyCode={null}
        style={{ background: 'var(--canvas-bg)' }}
      >
        <Background 
          className="opacity-25"
          style={{ backgroundColor: 'var(--canvas-bg)' }}
        />
        <Controls 
          className="bg-card shadow-lg border" 
          style={{ 
            background: 'var(--panel-bg)',
            borderColor: 'var(--panel-border)'
          }}
        />
        <MiniMap 
          className="bg-card shadow-lg border" 
          nodeColor={(node) => {
            switch (node.type) {
              case 'coreActionNode': return 'var(--category-core)';
              case 'strategyNode': return 'var(--category-strategy)';
              case 'lpToolkitNode': return 'var(--category-lp)';
              case 'startNode': return 'var(--category-control)';
              case 'endNode': return 'var(--category-control)';
              default: return 'var(--category-control)';
            }
          }}
          style={{ 
            background: 'var(--panel-bg)',
            borderColor: 'var(--panel-border)'
          }}
        />
      </ReactFlow>
    </div>
  );
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
};