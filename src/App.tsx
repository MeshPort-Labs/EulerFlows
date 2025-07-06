import { useState, useMemo, useRef, useEffect } from 'react';
import { WorkflowCanvas } from './components/Canvas/WorkflowCanvas';
import { NodePalette } from './components/NodePalette/NodePalette';
import { PropertyPanel } from './components/PropertyPanel/PropertyPanel';
import { StatusBar } from './components/StatusBar/StatusBar';
import { ExecutionDialog } from './components/ExecutionDialog/ExecutionDialog';
import { WalletModal } from './components/wallet/WalletModal';
import { ChainSwitcher } from './components/wallet/ChainSwitcher';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { 
  Save, 
  Play, 
  Upload, 
  Eye, 
  Wallet, 
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { useWallet } from './hooks/useWallet';
import { useEulerData } from './hooks/useEulerData';
import { useWorkflowExecution } from './hooks/useWorkflowExecution';
import type { Node, Edge } from '@xyflow/react';

function App() {
  const [isExecutionDialogOpen, setIsExecutionDialogOpen] = useState(false);
  const [currentNodes, setCurrentNodes] = useState<Node[]>([]);
  const [currentEdges, setCurrentEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [clearCanvasFlag, setClearCanvasFlag] = useState(false);
  const { 
    wallet, 
    connectWallet, 
    disconnectWallet, 
    switchToDevland,
    isWalletModalOpen, 
    setIsWalletModalOpen 
  } = useWallet();

  const { 
    balances, 
    userPool, 
    loading: dataLoading, 
    refetch: refetchData 
  } = useEulerData();

  const { validateWorkflow } = useWorkflowExecution();

  const isPanelOpen = !!selectedNode;

  const isWorkflowValid = useMemo(() => {
    if (currentNodes.length === 0) return false;
    const hasStartNode = currentNodes.some(node => node.type === 'startNode');
    const hasEndNode = currentNodes.some(node => node.type === 'endNode');
    return hasStartNode && hasEndNode && currentNodes.length > 1;
  }, [currentNodes]);

  const handleSaveWorkflow = () => {
    const workflowData = {
      nodes: currentNodes,
      edges: currentEdges,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('euler-workflow', JSON.stringify(workflowData));
  };

  const handleLoadWorkflow = () => {
    try {
      const saved = localStorage.getItem('euler-workflow');
      if (saved) {
        const workflowData = JSON.parse(saved);
        console.log('Loaded workflow:', workflowData);
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
    }
  };

  const handleExecuteWorkflow = () => {
    if (!wallet.isConnected) {
      connectWallet();
      return;
    }
    
    if (!wallet.isCorrectChain) {
      const shouldSwitch = confirm(
        'This workflow is designed for Devland. Switch networks?'
      );
      if (shouldSwitch) {
        switchToDevland();
      }
      return;
    }
    
    setIsExecutionDialogOpen(true);
  };

  const handleClearCanvas = () => {
    setClearCanvasFlag(flag => !flag); // Toggle to trigger clear
    setSelectedNode(null);
  };

  const handlePreviewWorkflow = () => {
    console.log('Previewing workflow:', { nodes: currentNodes, edges: currentEdges });
  };

  const handleNodeDrag = (nodeTemplate: any) => {
    console.log('Node dragged:', nodeTemplate);
  };

  const handleWorkflowStateChange = (nodes: Node[], edges: Edge[]) => {
    setCurrentNodes(nodes);
    setCurrentEdges(edges);
  };

  const handleNodeSelection = (node: Node | null) => {
    setSelectedNode(node);
  };

  const handleNodeUpdate = (nodeId: string, updates: any) => {
    setCurrentNodes(nodes => 
      nodes.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
    
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, ...updates } });
    }
  };

  const validation = validateWorkflow(currentNodes, currentEdges);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="header-bar flex-shrink-0 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-foreground">EulerFlow</h1>
              <Badge variant="outline" className="text-primary border-primary bg-primary/10">
                Visual Strategy Builder
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-xs">
                Nodes: {currentNodes.length}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Edges: {currentEdges.length}
              </Badge>
              {dataLoading && (
                <Badge variant="outline" className="text-xs animate-pulse">
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Loading...
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ChainSwitcher wallet={wallet} onSwitchToDevland={switchToDevland} />
            
            <div className="flex items-center space-x-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              {wallet.isConnected ? (
                <div className="flex items-center space-x-2">
                  <Badge className="bg-success/20 text-success border-success">
                    Connected
                  </Badge>
                  <span className="text-sm font-mono text-muted-foreground">
                    {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={disconnectWallet}
                    className="h-8 text-xs"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={connectWallet}>
                  Connect Wallet
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2 border-l border-border pl-4">
            <Button variant="outline" size="sm" onClick={handleClearCanvas} title="Clear Canvas">
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>

              <Button variant="outline" size="sm" onClick={handleSaveWorkflow}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleLoadWorkflow}>
                <Upload className="h-4 w-4 mr-2" />
                Load
              </Button>
              
              <Button variant="outline" size="sm" onClick={handlePreviewWorkflow}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              
              <Button 
                onClick={handleExecuteWorkflow}
                disabled={!isWorkflowValid}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                title={!isWorkflowValid ? 'Add nodes to create a valid workflow first' : 'Execute workflow'}
              >
                <Play className="h-4 w-4 mr-2" />
                Execute
              </Button>
            </div>
          </div>
        </div>
      </header>

      {wallet.isConnected && !wallet.isCorrectChain && (
        <div className="flex-shrink-0 border-b border-border px-6 py-3 bg-warning/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span className="text-sm text-warning">
                You're connected to the wrong network. Please switch to Devland to execute workflows.
              </span>
            </div>
            <Button size="sm" onClick={switchToDevland}>
              Switch to Devland
            </Button>
          </div>
        </div>
      )}

      {wallet.isConnected && wallet.isCorrectChain && (
        <div className="flex-shrink-0 border-b border-border px-6 py-3 bg-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Devland Status:
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {Object.entries(balances).slice(0, 4).map(([symbol, balance]) => (
                  <Badge key={symbol} variant="outline" className="text-xs bg-card">
                    {symbol}: {balance?.formatted ? parseFloat(balance.formatted).toFixed(2) : '0'}
                  </Badge>
                ))}
              </div>

              <Badge 
                variant="outline" 
                className={`text-xs ${userPool ? 'bg-success/20 text-success border-success' : 'bg-muted text-muted-foreground border-border'}`}
              >
                Pool: {userPool ? `${userPool.slice(0, 8)}...` : 'None'}
              </Badge>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetchData}
              disabled={dataLoading}
            >
              {dataLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <aside className="sidebar-container w-80 flex-shrink-0 overflow-y-auto">
          <NodePalette onNodeDrag={handleNodeDrag} />
        </aside>

        <main className={`flex-1 relative overflow-hidden flex flex-col transition-all duration-300 ${isPanelOpen ? 'mr-96' : ''}`}>
          <div className="flex-1 canvas-container">
            <WorkflowCanvas 
              clearFlag={clearCanvasFlag}
              nodes={currentNodes}
              edges={currentEdges}
              onWorkflowStateChange={handleWorkflowStateChange}
              onNodeSelection={handleNodeSelection}
            />
          </div>
          
          <StatusBar
            nodeCount={currentNodes.length}
            edgeCount={currentEdges.length}
            isValid={validation.valid}
            executionStatus="idle"
          />
        </main>

        {isPanelOpen && (
          <aside className="fixed right-0 top-0 bottom-0 w-96 z-40 animate-slide-in">
            <PropertyPanel
              isOpen={isPanelOpen}
              onClose={() => setSelectedNode(null)}
              selectedNode={selectedNode}
              onNodeUpdate={handleNodeUpdate}
            />
          </aside>
        )}
      </div>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
      
      <ExecutionDialog
        isOpen={isExecutionDialogOpen}
        onClose={() => setIsExecutionDialogOpen(false)}
        nodes={currentNodes}
        edges={currentEdges}
      />
    </div>
  );
}

export default App;