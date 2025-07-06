import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useOnSelectionChange,
  ConnectionLineType,
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
    position: { x: -138, y: 225 },
    data: {
      label: 'Portfolio Start',
      category: 'control',
      controlType: 'start'
    },
  },
  {
    id: '2',
    type: 'coreActionNode',
    position: { x: 74, y: 109 },
    data: {
      label: 'Supply 80 WETH',
      category: 'core' as const,
      action: 'supply' as const,
      description: 'Primary collateral',
      amount: '80',
      vaultAddress: 'WETH'
    },
  },
  {
    id: '3',
    type: 'coreActionNode',
    position: { x: 73, y: 469 },
    data: {
      label: 'Supply 10000 USDC',
      category: 'core' as const,
      action: 'supply' as const,
      description: 'Stablecoin base',
      amount: '10000',
      vaultAddress: 'USDC'
    },
  },
  {
    id: '4',
    type: 'coreActionNode',
    position: { x: 334, y: 328 },
    data: {
      label: 'Enable USDC Controller',
      category: 'core' as const,
      action: 'permissions' as const,
      description: 'Setup borrowing capabilities',
      controller: 'USDC'
    },
  },
  {
    id: '5',
    type: 'coreActionNode',
    position: { x: 469, y: 90 },
    data: {
      label: 'Withdraw 15 WETH',
      category: 'core' as const,
      action: 'withdraw' as const,
      description: 'Rebalance WETH position',
      amount: '15',
      vaultAddress: 'WETH'
    },
  },
  {
    id: '6',
    type: 'coreActionNode',
    position: { x: 684, y: 93 },
    data: {
      label: 'Swap WETH → USDC',
      category: 'core' as const,
      action: 'swap' as const,
      description: 'Convert to stablecoin',
      tokenIn: 'WETH',
      tokenOut: 'USDC',
      amount: '15',
      slippage: 0.5
    },
  },
  {
    id: '7',
    type: 'coreActionNode',
    position: { x: 915, y: 94 },
    data: {
      label: 'Supply Swapped USDC',
      category: 'core' as const,
      action: 'supply' as const,
      description: 'Reinvest proceeds',
      amount: '40000',
      vaultAddress: 'USDC'
    },
  },
  {
    id: '8',
    type: 'coreActionNode',
    position: { x: 618, y: 294 },
    data: {
      label: 'Withdraw 8000 USDC',
      category: 'core' as const,
      action: 'withdraw' as const,
      description: 'Take USDC profits',
      amount: '8000',
      vaultAddress: 'USDC'
    },
  },
  {
    id: '9',
    type: 'coreActionNode',
    position: { x: 633, y: 474 },
    data: {
      label: 'Swap USDC → WETH',
      category: 'core' as const,
      action: 'swap' as const,
      description: 'Buy back WETH with profits',
      tokenIn: 'USDC',
      tokenOut: 'WETH',
      amount: '8000',
      slippage: 0.5
    },
  },
  {
    id: '10',
    type: 'coreActionNode',
    position: { x: 924, y: 474 },
    data: {
      label: 'Supply Bought WETH',
      category: 'core' as const,
      action: 'supply' as const,
      description: 'Compound WETH position',
      amount: '3',
      vaultAddress: 'WETH'
    },
  },
  {
    id: '11',
    type: 'endNode',
    position: { x: 950, y: 200 },
    data: {
      label: 'Portfolio Optimized',
      category: 'control' as const,
      controlType: 'end' as const
    },
  },
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    style: { stroke: 'var(--edge-default)', strokeWidth: 2 }
  },
  { 
    id: 'e1-3', 
    source: '1', 
    target: '3', 
    style: { stroke: 'var(--edge-default)', strokeWidth: 2 }
  },
  { 
    id: 'e2-4', 
    source: '2', 
    target: '4', 
    style: { stroke: 'var(--edge-default)', strokeWidth: 2 }
  },
  { 
    id: 'e3-4', 
    source: '3', 
    target: '4', 
    style: { stroke: 'var(--edge-default)', strokeWidth: 2 }
  },
  { 
    id: 'e4-5', 
    source: '4', 
    target: '5', 
    style: { stroke: 'var(--edge-default)', strokeWidth: 2 }
  },
  { 
    id: 'e5-6', 
    source: '5', 
    target: '6', 
    style: { stroke: 'var(--edge-default)', strokeWidth: 2 }
  },
  { 
    id: 'e6-7', 
    source: '6', 
    target: '7', 
    style: { stroke: 'var(--edge-default)', strokeWidth: 2 }
  },
  { 
    id: 'e4-8', 
    source: '4', 
    target: '8', 
    style: { stroke: 'var(--edge-default)', strokeWidth: 2 }
  },
  { 
    id: 'e8-9', 
    source: '8', 
    target: '9', 
    style: { stroke: 'var(--edge-default)', strokeWidth: 2 }
  },
  { 
    id: 'e9-10', 
    source: '9', 
    target: '10', 
    style: { stroke: 'var(--edge-default)', strokeWidth: 2 }
  },
  { 
    id: 'e7-11', 
    source: '7', 
    target: '11', 
    style: { stroke: 'var(--edge-default)', strokeWidth: 2 }
  },
  { 
    id: 'e10-11', 
    source: '10', 
    target: '11', 
    style: { stroke: 'var(--edge-default)', strokeWidth: 2 }
  },
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

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.stopPropagation();
      setSelectedNode(node);
      onNodeSelection?.(node);
    },
    [onNodeSelection]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    onNodeSelection?.(null);
  }, [onNodeSelection]);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'straight',
        style: { stroke: 'var(--edge-default)', strokeWidth: 2 }
      };
      setEdges((eds) => addEdge(newEdge, eds));
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
        y: event.clientY - reactFlowBounds.top - 35,
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
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
      onNodeSelection?.(null);
    }
  }, [setNodes, setEdges, selectedNode, onNodeSelection]);

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
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        className="bg-background"
        deleteKeyCode={null}
        selectNodesOnDrag={false} 
        multiSelectionKeyCode={null}
        connectionLineType={ConnectionLineType.Straight}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: 'var(--edge-default)', strokeWidth: 2 }
        }}
        style={{ background: 'var(--canvas-bg)' }}
      >
        <Background 
          className="opacity-25"
          style={{ backgroundColor: 'var(--canvas-bg)' }}
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