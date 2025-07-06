import { useState, useCallback } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { NodeData } from "../types/nodes";
import { toast } from "sonner";

interface ExecutionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasUsed?: bigint;
  message?: string;
}

interface ExecutionStep {
  nodeId: string;
  operation: any;
  status: "pending" | "executing" | "completed" | "failed";
  result?: any;
  error?: string;
  description?: string;
}

export const useWorkflowExecution = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);

  const getExecutionOrder = useCallback(
    (nodes: Node[], edges: Edge[]): string[] => {
      const graph = new Map<string, string[]>();
      const inDegree = new Map<string, number>();

      nodes.forEach((node) => {
        graph.set(node.id, []);
        inDegree.set(node.id, 0);
      });

      edges.forEach((edge) => {
        const sourceId = edge.source;
        const targetId = edge.target;

        graph.get(sourceId)?.push(targetId);
        inDegree.set(targetId, (inDegree.get(targetId) || 0) + 1);
      });

      const queue: string[] = [];
      const result: string[] = [];

      inDegree.forEach((degree, nodeId) => {
        if (degree === 0) {
          queue.push(nodeId);
        }
      });

      while (queue.length > 0) {
        const current = queue.shift()!;
        result.push(current);

        graph.get(current)?.forEach((neighbor) => {
          const newDegree = (inDegree.get(neighbor) || 0) - 1;
          inDegree.set(neighbor, newDegree);

          if (newDegree === 0) {
            queue.push(neighbor);
          }
        });
      }

      return result;
    },
    []
  );

  const validateWorkflow = useCallback(
    (nodes: Node[], edges: Edge[]): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];

      const startNodes = nodes.filter((n) => n.type === "startNode");
      if (startNodes.length === 0) {
        errors.push("Workflow must have a start node");
      }
      if (startNodes.length > 1) {
        errors.push("Workflow can only have one start node");
      }

      const endNodes = nodes.filter((n) => n.type === "endNode");
      if (endNodes.length === 0) {
        errors.push("Workflow must have an end node");
      }

      const executionOrder = getExecutionOrder(nodes, edges);
      if (executionOrder.length !== nodes.length) {
        errors.push("Workflow contains cycles or disconnected components");
      }

      nodes.forEach((node) => {
        const nodeData = node.data as NodeData;

        if (nodeData.category === "control") return;

        if (nodeData.category === "core") {
          const coreData = nodeData as any;
          switch (coreData.action) {
            case "supply":
            case "withdraw":
            case "borrow":
            case "repay":
              if (!coreData.vaultAddress) {
                errors.push(`${node.data.label}: Vault address is required`);
              }
              if (!coreData.amount) {
                errors.push(`${node.data.label}: Amount is required`);
              }
              break;
            case "swap":
              if (!coreData.tokenIn || !coreData.tokenOut) {
                errors.push(
                  `${node.data.label}: Both input and output tokens are required`
                );
              }
              break;
            case "permissions":
              if (
                !coreData.controller &&
                (!coreData.collaterals || coreData.collaterals.length === 0)
              ) {
                errors.push(
                  `${node.data.label}: Either controller or collaterals must be specified`
                );
              }
              break;
          }
        }

        if (nodeData.category === "strategy") {
          const strategyData = nodeData as any;
          switch (strategyData.strategyType) {
            case "leverage":
              if (!strategyData.collateralAsset || !strategyData.borrowAsset) {
                errors.push(
                  `${node.data.label}: Both collateral and borrow assets are required`
                );
              }
              if (
                !strategyData.leverageFactor ||
                strategyData.leverageFactor < 1.1
              ) {
                errors.push(
                  `${node.data.label}: Leverage factor must be at least 1.1x`
                );
              }
              break;
            case "borrow-against-lp":
              if (!strategyData.borrowAsset || !strategyData.borrowAmount) {
                errors.push(
                  `${node.data.label}: Borrow asset and amount are required`
                );
              }
              break;
          }
        }
      });

      return { valid: errors.length === 0, errors };
    },
    [getExecutionOrder]
  );

  const executeWorkflow = useCallback(async (nodes: Node[], edges: Edge[]): Promise<ExecutionResult> => {
    setIsExecuting(true);
    setCurrentStep(-1);
    setExecutionSteps([]);

    const executionToastId = toast.loading('Starting workflow execution...', {
      description: 'Preparing transactions and validating workflow'
    });

    try {
      console.log('🚀 Starting workflow execution...');
      
      const validation = validateWorkflow(nodes, edges);
      if (!validation.valid) {
        toast.error('Workflow validation failed', {
          description: validation.errors[0] || 'Unknown validation error',
          id: executionToastId
        });
        throw new Error(`Workflow validation failed:\n${validation.errors.join('\n')}`);
      }

      const executionOrder = getExecutionOrder(nodes, edges);
      console.log(`📋 Execution order: ${executionOrder.join(' → ')}`);
      
      const actionableNodes = executionOrder
        .map(nodeId => nodes.find(n => n.id === nodeId))
        .filter(node => node && node.data.category !== 'control')
        .map(node => ({ node: node!, data: node!.data as NodeData }));

      console.log(`🔧 Processing ${actionableNodes.length} actionable nodes`);

      if (actionableNodes.length === 0) {
        toast.success('Workflow completed', {
          description: 'No actionable operations to execute',
          id: executionToastId
        });
        return {
          success: true,
          message: 'Workflow completed (no actionable operations)'
        };
      }

      toast.loading(`Executing ${actionableNodes.length} operations...`, {
        description: 'Processing transactions on-chain',
        id: executionToastId
      });

      const steps: ExecutionStep[] = actionableNodes.map(({ node, data }) => ({
        nodeId: node.id,
        operation: data,
        status: 'pending',
        description: `${data.category}: ${node.data.label}`
      }));

      setExecutionSteps(steps);

      const completedTransactions: string[] = [];
      
      for (let i = 0; i < actionableNodes.length; i++) {
        const { node, data } = actionableNodes[i];
        
        setCurrentStep(i);
        
        setExecutionSteps(prev => 
          prev.map((step, index) => 
            index === i ? { ...step, status: 'executing' } : step
          )
        );

        console.log(`⚡ Executing step ${i + 1}/${actionableNodes.length}: ${node.data.label}`);

        try {
          // Simulate execution with a delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock transaction hash
          const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
          completedTransactions.push(mockTxHash);

          setExecutionSteps(prev => 
            prev.map((step, index) => 
              index === i ? { 
                ...step, 
                status: 'completed', 
                result: `Completed (tx: ${mockTxHash.slice(0, 10)}...)` 
              } : step
            )
          );

        } catch (stepError) {
          console.error(`❌ Step ${i + 1} failed:`, stepError);
          
          setExecutionSteps(prev => 
            prev.map((step, index) => 
              index === i ? { 
                ...step, 
                status: 'failed', 
                error: stepError instanceof Error ? stepError.message : 'Unknown error' 
              } : step
            )
          );

          toast.error(`Step ${i + 1} failed: ${node.data.label}`, {
            description: stepError instanceof Error ? stepError.message : 'Unknown error',
            id: executionToastId
          });

          throw stepError;
        }
      }

      setCurrentStep(-1);
      
      toast.success('Workflow executed successfully! 🎉', {
        description: `Completed ${actionableNodes.length} operations with ${completedTransactions.length} transactions`,
        id: executionToastId,
        action: completedTransactions.length > 0 ? {
          label: 'View Transaction',
          onClick: () => {
            const txHash = completedTransactions[0];
            window.open(`https://etherscan.io/tx/${txHash}`, '_blank');
          }
        } : undefined
      });
      
      console.log('✅ Workflow execution completed successfully!');
      return {
        success: true,
        message: `Workflow executed successfully! Completed ${actionableNodes.length} operations.`,
        transactionHash: completedTransactions[0]
      };

    } catch (error) {
      console.error('❌ Workflow execution failed:', error);
      
      toast.error('Workflow execution failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        id: executionToastId
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      setIsExecuting(false);
    }
  }, [validateWorkflow, getExecutionOrder]);

  const simulateWorkflow = useCallback(async (nodes: Node[], edges: Edge[]) => {
    const simulationToastId = toast.loading('Simulating workflow...', {
      description: 'Validating operations and estimating gas'
    });

    console.log('🔍 Simulating workflow...');
    
    const validation = validateWorkflow(nodes, edges);
    if (!validation.valid) {
      toast.error('Simulation failed', {
        description: validation.errors[0] || 'Workflow validation failed',
        id: simulationToastId
      });
      return { success: false, errors: validation.errors };
    }

    const executionOrder = getExecutionOrder(nodes, edges);
    const nodeDataSequence = executionOrder
      .map(nodeId => nodes.find(n => n.id === nodeId))
      .filter(node => node && node.data.category !== 'control')
      .map(node => node!.data as NodeData);

    try {
      // Simulate with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const operations = nodeDataSequence.map((data, index) => ({
        id: index,
        type: data.category,
        description: data.label || 'Unknown operation'
      }));
      
      toast.success('Simulation successful! ✅', {
        description: `Generated ${operations.length} operations, ready for execution`,
        id: simulationToastId
      });
      
      return {
        success: true,
        operations,
        estimatedGas: BigInt(operations.length * 100000),
        executionOrder,
        nodeCount: nodeDataSequence.length
      };
    } catch (error) {
      toast.error('Simulation failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        id: simulationToastId
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Simulation failed',
      };
    }
  }, [validateWorkflow, getExecutionOrder]);

  return {
    isExecuting,
    executionSteps,
    currentStep,
    executeWorkflow,
    simulateWorkflow,
    validateWorkflow,
  };
};