import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { 
  Play, 
  CheckCircle, 
  Eye,
  Zap,
  AlertCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  X,
} from 'lucide-react';
import { useWorkflowExecution } from '../../hooks/useWorkflowExecution';
import type { Node, Edge } from '@xyflow/react';

interface ExecutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
}

export const ExecutionDialog: React.FC<ExecutionDialogProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const {
    isExecuting,
    executionSteps,
    currentStep,
    executeWorkflow,
    simulateWorkflow,
    validateWorkflow,
  } = useWorkflowExecution();

  const validation = validateWorkflow(nodes, edges);
  const actionableNodes = nodes.filter(node => node.data.category !== 'control');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
      setSimulationResult(null);
    }
  }, [isOpen]);

  const handleSimulate = async () => {
    setIsSimulating(true);
    setActiveTab('simulation');
    try {
      const result = await simulateWorkflow(nodes, edges);
      setSimulationResult(result);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleExecute = async () => {
    setActiveTab('execution');
    await executeWorkflow(nodes, edges);
  };

  const getStepIcon = (step: any) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'executing':
        return <RefreshCw className="w-4 h-4 text-primary animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getOverallProgress = () => {
    if (executionSteps.length === 0) return 0;
    const completedSteps = executionSteps.filter(step => step.status === 'completed').length;
    return (completedSteps / executionSteps.length) * 100;
  };

  // Helper function to safely render step result - ONLY ADDITION
  const renderStepResult = (result: any) => {
    if (!result) return null;
    
    if (typeof result === 'string') {
      return result;
    }
    
    if (typeof result === 'object') {
      if (result.message) return result.message;
      if (result.transactionHash) return `tx: ${result.transactionHash.slice(0, 10)}...`;
      return 'Completed';
    }
    
    return String(result);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Zap className="w-6 h-6 text-primary" />
                Workflow Execution
              </DialogTitle>
              <DialogDescription className="mt-1">
                Review, simulate, and execute your EulerSwap workflow
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Separator />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow">
            <TabsContent value="overview" className="h-full overflow-y-auto mt-0">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {validation.valid ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      )}
                      Workflow Validation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {validation.valid ? (
                      <div className="text-success">
                        ✅ Workflow is valid and ready for execution
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-destructive">
                          ❌ Workflow validation failed:
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          {validation.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className='overflow-y-auto'>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Workflow Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4">
                    <div className="max-h-[40vh] overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="text-2xl font-bold text-primary">{nodes.length}</div>
                          <div className="text-sm text-muted-foreground">Total Nodes</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="text-2xl font-bold text-primary">{edges.length}</div>
                          <div className="text-sm text-muted-foreground">Connections</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="text-2xl font-bold text-primary">{actionableNodes.length}</div>
                          <div className="text-sm text-muted-foreground">Actions</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="text-2xl font-bold text-primary">
                            {nodes.filter(n => n.data.category === 'control').length}
                          </div>
                          <div className="text-sm text-muted-foreground">Controls</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Action Breakdown:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {actionableNodes.map((node, index) => (
                            <div key={node.id} className="flex items-center gap-3 p-3 rounded-lg border">
                              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-primary">{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">{node.data.label}</div>
                                <div className="text-xs text-muted-foreground capitalize">
                                  {node.data.action || node.data.category}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {node.data.category}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleSimulate}
                    variant="outline"
                    disabled={!validation.valid || isSimulating}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {isSimulating ? 'Simulating...' : 'Simulate Workflow'}
                  </Button>
                  <Button 
                    onClick={handleExecute}
                    disabled={!validation.valid || isExecuting}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isExecuting ? 'Executing...' : 'Execute Workflow'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="simulation" className="h-full overflow-y-auto mt-0">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Transaction Simulation</h3>
                  <Button 
                    onClick={handleSimulate}
                    variant="outline"
                    disabled={!validation.valid || isSimulating}
                  >
                    {isSimulating ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4 mr-2" />
                    )}
                    {isSimulating ? 'Simulating...' : 'Run Simulation'}
                  </Button>
                </div>

                {isSimulating && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                        <div>
                          <div className="font-medium">Running simulation...</div>
                          <div className="text-sm text-muted-foreground">
                            Validating operations and estimating gas costs
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {simulationResult && (
                  <div className="space-y-4">
                    {simulationResult.success ? (
                      <>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg text-success flex items-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              Simulation Successful
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div>
                                <div className="text-sm text-muted-foreground">Operations</div>
                                <div className="text-lg font-medium">{simulationResult.nodeCount || 0}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Estimated Gas</div>
                                <div className="text-lg font-medium">
                                  {simulationResult.estimatedGas ? 
                                    `${(Number(simulationResult.estimatedGas) / 1000000).toFixed(2)}M` : 
                                    'N/A'
                                  }
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Status</div>
                                <Badge className="bg-success/20 text-success">Ready to Execute</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {simulationResult.operations && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Execution Plan</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {simulationResult.operations.map((op: any, index: number) => (
                                  <div key={op.id} className="flex items-center gap-3 p-3 rounded-lg border">
                                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                      <span className="text-sm font-medium text-primary">{index + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium">{op.description}</div>
                                      <div className="text-sm text-muted-foreground capitalize">{op.type}</div>
                                    </div>
                                    <CheckCircle className="w-4 h-4 text-success" />
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg text-destructive flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Simulation Failed
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-destructive">
                            {simulationResult.error || 'Unknown simulation error'}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {!simulationResult && !isSimulating && (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="font-medium mb-2">Ready to Simulate</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Run a simulation to validate your workflow and estimate gas costs before execution.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="execution" className="h-full overflow-y-auto mt-0">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Execute Workflow</h3>
                  <Button 
                    onClick={handleExecute}
                    disabled={!validation.valid || isExecuting}
                  >
                    {isExecuting ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {isExecuting ? 'Executing...' : 'Execute'}
                  </Button>
                </div>

                {isExecuting && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Execution Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="max-h-[40vh] overflow-y-auto">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Overall Progress</span>
                          <span>{Math.round(getOverallProgress())}%</span>
                        </div>
                        <Progress value={getOverallProgress()} className="h-2" />
                      </div>
                      
                      <div className="space-y-3">
                        {executionSteps.map((step, index) => (
                          <div 
                            key={step.nodeId} 
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                              index === currentStep ? 'border-primary bg-primary/5' : ''
                            }`}
                          >
                            {getStepIcon(step)}
                            <div className="flex-1">
                              <div className="font-medium text-sm">{step.description}</div>
                              {step.result && (
                                <div className="text-xs text-muted-foreground">{renderStepResult(step.result)}</div>
                              )}
                              {step.error && (
                                <div className="text-xs text-destructive">{step.error}</div>
                              )}
                            </div>
                            {step.status === 'executing' && (
                              <div className="text-xs text-primary font-medium">Executing...</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!isExecuting && executionSteps.length === 0 && (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="font-medium mb-2">Ready to Execute</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Execute your workflow on-chain. Make sure you have sufficient gas and token balances.
                      </p>
                      {!validation.valid && (
                        <div className="text-destructive text-sm">
                          Fix validation errors before execution
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {!isExecuting && executionSteps.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-success flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Execution Complete
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* <div className="space-y-3 "> */}
                      <div className="max-h-[40vh] overflow-y-auto">
                        {executionSteps.map((step) => (
                          <div key={step.nodeId} className="flex items-center gap-3 p-3 rounded-lg border">
                            {getStepIcon(step)}
                            <div className="flex-1">
                              <div className="font-medium text-sm">{step.description}</div>
                              {step.result && (
                                <div className="text-xs text-muted-foreground">{renderStepResult(step.result)}</div>
                              )}
                            </div>
                            {step.result?.includes && step.result.includes('tx:') && (
                              <Button size="sm" variant="ghost">
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};