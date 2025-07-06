import { useState, useMemo, useCallback } from 'react';
import { WorkflowCanvas } from './components/Canvas/WorkflowCanvas';
import { NodePalette } from './components/NodePalette/NodePalette';
import { ExecutionDialog } from './components/ExecutionDialog/ExecutionDialog';
import { WalletModal } from './components/wallet/WalletModal';
import { PropertyPanel } from './components/PropertyPanel/PropertyPanel';
import { StatusBar } from './components/StatusBar/StatusBar';
import { ErrorBoundary } from './components/ErrorBoundary';
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
  Activity,
} from 'lucide-react';
import { useWallet } from './hooks/useWallet';
import { useEulerData } from './hooks/useEulerData';
import type { Node, Edge } from '@xyflow/react';

function AppContent() {
  const [isExecutionDialogOpen, setIsExecutionDialogOpen] = useState(false);
  const [currentNodes, setCurrentNodes] = useState<Node[]>([]);
  const [currentEdges, setCurrentEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [clearCanvasFlag, setClearCanvasFlag] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const { 
    wallet, 
    connectWallet, 
    disconnectWallet, 
    switchToDevland,
    isWalletModalOpen, 
    setIsWalletModalOpen 
  } = useWallet();

  const { 
    balances = {}, 
    userPool = null, 
    loading: dataLoading, 
    refetch: refetchData 
  } = useEulerData();

  // Type guards for balances and userPool
  type BalancesType = { WETH?: { formatted?: string }, USDC?: { formatted?: string } };
  const safeBalances = (balances as BalancesType) || {};
  const safeUserPool: string | null = typeof userPool === 'string' ? userPool : null;

  const isPanelOpen = selectedNode !== null;

  const validation = useMemo(() => {
    if (currentNodes.length === 0) return { valid: false, errors: ['No nodes in workflow'] };
    const hasStartNode = currentNodes.some(n => n.data.controlType === 'start');
    const hasEndNode = currentNodes.some(n => n.data.controlType === 'end');
    const unconfiguredNodes = currentNodes.filter(n => n.data.category !== 'control' && !n.data.configured);
    
    const errors = [];
    if (!hasStartNode) errors.push('Missing start node');
    if (!hasEndNode) errors.push('Missing end node');
    if (unconfiguredNodes.length > 0) errors.push(`${unconfiguredNodes.length} nodes need configuration`);
    
    return { valid: errors.length === 0, errors };
  }, [currentNodes]);

  const handleWorkflowStateChange = useCallback((nodes: Node[], edges: Edge[]) => {
    setCurrentNodes(nodes);
    setCurrentEdges(edges);
  }, []);

  const handleNodeSelection = useCallback((node: Node | null) => {
    setSelectedNode(node);
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, updates: any) => {
    setCurrentNodes(prev => 
      prev.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  }, []);

  const handleNodeDrag = useCallback((nodeType: string, data: any) => {
    console.log('Node dragged:', nodeType, data);
  }, []);

  const handleClearCanvas = () => {
    setCurrentNodes([]);
    setCurrentEdges([]);
    setSelectedNode(null);
    setClearCanvasFlag(flag => !flag);
  };

  const handleExecuteWorkflow = () => {
    if (validation.valid && !isExecuting) {
      setIsExecutionDialogOpen(true);
    }
  };

  const handleCloseExecutionDialog = () => {
    setIsExecutionDialogOpen(false);
    setIsExecuting(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="header-bar px-6 py-3 flex items-center justify-between border-b flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">EulerFlow</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleClearCanvas}>
              Clear
            </Button>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Load
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExecuteWorkflow}
              disabled={!validation.valid || isExecuting}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              {isExecuting ? 'Executing...' : 'Execute'}
            </Button>
            
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Simulate
            </Button>
          </div>

          <ChainSwitcher wallet={wallet} onSwitchToDevland={switchToDevland} />
          
          {wallet.isConnected ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectWallet}
                className="gap-2"
              >
                <Wallet className="w-4 h-4" />
                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
              </Button>
            </div>
          ) : (
            <Button onClick={() => connectWallet()} size="sm">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          )}
        </div>
      </header>

      {/* Wallet Status & Data */}
      {wallet.isConnected && (
        <div className="px-6 py-2 bg-muted/30 border-b flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connected to Devland</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                WETH: {safeBalances.WETH?.formatted || '0.00'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                USDC: {safeBalances.USDC?.formatted || '0.00'}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${safeUserPool ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
              >
                Pool: {safeUserPool && typeof safeUserPool === 'string' ? `${safeUserPool.slice(0, 8)}...` : 'None'}
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <aside className="sidebar-container w-80 flex-shrink-0 overflow-y-auto">
          <NodePalette />
        </aside>

        <main className={`flex-1 relative overflow-hidden flex flex-col transition-all duration-300 ${isPanelOpen ? 'mr-96' : ''}`}>
          <div className="flex-1 canvas-container">
            <WorkflowCanvas 
              clearFlag={clearCanvasFlag}
              onWorkflowStateChange={handleWorkflowStateChange}
              onNodeSelection={handleNodeSelection}
            />
          </div>
          
          <StatusBar
            nodeCount={currentNodes.length}
            edgeCount={currentEdges.length}
            isValid={validation.valid}
            executionStatus={isExecuting ? "running" : "idle"}
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

      {/* Modals */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
      
      {/* Execution Dialog with Error Boundary */}
      {isExecutionDialogOpen && (
        <ErrorBoundary
          fallback={
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-background p-6 rounded-lg max-w-md text-center">
                <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Execution Error</h3>
                <p className="text-muted-foreground mb-4">
                  Something went wrong during workflow execution
                </p>
                <Button onClick={handleCloseExecutionDialog}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <ExecutionDialog
            isOpen={isExecutionDialogOpen}
            onClose={handleCloseExecutionDialog}
            nodes={currentNodes}
            edges={currentEdges}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;