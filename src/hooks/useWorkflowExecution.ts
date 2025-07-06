import { useState, useCallback } from "react";
import type { Node, Edge } from "@xyflow/react";
import { EulerWorkflowExecutor } from "../lib/eulerIntegrations";
import { executeEVCBatch } from "../lib/euler/eulerLib";
import type { NodeData } from "../types/nodes";
import { useAccount } from "wagmi";
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
  const { address: userAddress } = useAccount();
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);

  // Correct topological sort implementation from real-app
  const getExecutionOrder = useCallback(
    (nodes: Node[], edges: Edge[]): string[] => {
      const graph = new Map<string, string[]>();
      const inDegree = new Map<string, number>();

      // Initialize graph
      nodes.forEach((node) => {
        graph.set(node.id, []);
        inDegree.set(node.id, 0);
      });

      // Build adjacency list and calculate in-degrees
      edges.forEach((edge) => {
        const sourceId = edge.source;
        const targetId = edge.target;

        graph.get(sourceId)?.push(targetId);
        inDegree.set(targetId, (inDegree.get(targetId) || 0) + 1);
      });

      // Topological sort using Kahn's algorithm
      const queue: string[] = [];
      const result: string[] = [];

      // Find all nodes with no incoming edges
      inDegree.forEach((degree, nodeId) => {
        if (degree === 0) {
          queue.push(nodeId);
        }
      });

      while (queue.length > 0) {
        const current = queue.shift()!;
        result.push(current);

        // Process all neighbors
        const neighbors = graph.get(current) || [];
        neighbors.forEach((neighbor) => {
          const newInDegree = (inDegree.get(neighbor) || 0) - 1;
          inDegree.set(neighbor, newInDegree);

          if (newInDegree === 0) {
            queue.push(neighbor);
          }
        });
      }

      // Check for cycles
      if (result.length !== nodes.length) {
        console.warn('Detected cycle in workflow graph');
        return nodes.map(node => node.id);
      }

      return result;
    },
    []
  );

  const validateWorkflow = useCallback((nodes: Node[], edges: Edge[]) => {
    const errors: string[] = [];

    if (nodes.length === 0) {
      errors.push('Workflow must contain at least one node');
    }

    const unconfiguredNodes = nodes.filter(node => 
      node.data.category !== 'control' && !node.data.configured
    );

    if (unconfiguredNodes.length > 0) {
      errors.push(`${unconfiguredNodes.length} nodes need configuration`);
    }

    if (!userAddress) {
      errors.push('Wallet must be connected');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }, [userAddress]);

  const executeWorkflow = useCallback(async (nodes: Node[], edges: Edge[]): Promise<ExecutionResult> => {
    if (!userAddress) {
      toast.error('Wallet must be connected for execution');
      return { success: false, error: 'Wallet not connected' };
    }

    setIsExecuting(true);
    
    const executionToastId = toast.loading('Executing workflow...', {
      description: 'Preparing real transactions'
    });

    console.log('🚀 Starting REAL workflow execution...');
    
    try {
      const validation = validateWorkflow(nodes, edges);
      if (!validation.valid) {
        toast.error('Execution failed', {
          description: validation.errors[0] || 'Workflow validation failed',
          id: executionToastId
        });
        return { success: false, error: validation.errors[0] };
      }

      const executionOrder = getExecutionOrder(nodes, edges);
      console.log(`📋 Execution order: ${executionOrder.join(' → ')}`);
      
      const actionableNodes = executionOrder
        .map(nodeId => nodes.find(n => n.id === nodeId))
        .filter(node => node && node.data.category !== 'control')
        .map(node => ({ node: node!, data: node!.data as NodeData }));

      console.log(`🔧 Processing ${actionableNodes.length} actionable nodes with REAL contracts`);

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

      toast.loading(`Executing ${actionableNodes.length} operations on-chain...`, {
        description: 'Sending real transactions to Euler protocol',
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

        console.log(`⚡ Executing step ${i + 1}/${actionableNodes.length} with REAL contracts: ${node.data.label}`);

        try {
          // Generate REAL batch operations using EulerWorkflowExecutor
          const batchOperations = await EulerWorkflowExecutor.executeNodeSequence([data], userAddress);

          if (batchOperations.length === 0) {
            console.log(`⚠️ No operations generated for node: ${node.data.label}`);
            
            setExecutionSteps(prev => 
              prev.map((step, index) => 
                index === i ? { ...step, status: 'completed', result: { message: 'No operations needed' } } : step
              )
            );
            continue;
          }

          console.log(`🔄 Executing ${batchOperations.length} REAL batch operations for node: ${node.data.label}`);

          // Execute REAL contract calls using executeEVCBatch
          const batchResult = await executeEVCBatch(batchOperations);

          if (batchResult.success) {
            console.log(`✅ REAL transaction successful: ${node.data.label}`);
            console.log(`📦 Transaction hash: ${batchResult.transactionHash}`);
            console.log(`⛽ Gas used: ${batchResult.gasUsed}`);
            
            completedTransactions.push(batchResult.transactionHash || '');
            
            setExecutionSteps(prev => 
              prev.map((step, index) => 
                index === i ? { 
                  ...step, 
                  status: 'completed', 
                  result: {
                    transactionHash: batchResult.transactionHash,
                    gasUsed: batchResult.gasUsed,
                    message: 'Transaction confirmed on-chain'
                  }
                } : step
              )
            );
          } else {
            throw new Error(batchResult.error || 'Unknown execution error');
          }

        } catch (error) {
          console.error(`❌ REAL contract execution failed: ${node.data.label}`, error);
          
          setExecutionSteps(prev => 
            prev.map((step, index) => 
              index === i ? { 
                ...step, 
                status: 'failed', 
                error: error instanceof Error ? error.message : 'Unknown error' 
              } : step
            )
          );
          
          throw error;
        }
      }

      setCurrentStep(-1);
      
      toast.success('Workflow executed successfully with real contracts! 🎉', {
        description: `Completed ${actionableNodes.length} operations. Transaction hashes: ${completedTransactions.slice(0, 2).join(', ')}${completedTransactions.length > 2 ? '...' : ''}`,
        id: executionToastId
      });

      return {
        success: true,
        message: `Successfully completed ${actionableNodes.length} operations with real contracts.`,
        transactionHash: completedTransactions[0]
      };

    } catch (error) {
      console.error('❌ REAL workflow execution failed:', error);
      
      toast.error('Real workflow execution failed', {
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
  }, [validateWorkflow, getExecutionOrder, userAddress]);

  const simulateWorkflow = useCallback(async (nodes: Node[], edges: Edge[]) => {
    if (!userAddress) {
      toast.error('Wallet must be connected for simulation');
      return { success: false, errors: ['Wallet must be connected'] };
    }

    const simulationToastId = toast.loading('Simulating workflow...', {
      description: 'Generating operations without execution'
    });

    console.log('🔍 Simulating workflow (generating operations only)...');
    
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
      // Generate operations without executing (this is the simulation)
      const operations = await EulerWorkflowExecutor.executeNodeSequence(nodeDataSequence, userAddress);
      
      toast.success('Simulation successful! ✅', {
        description: `Generated ${operations.length} real operations, ready for execution`,
        id: simulationToastId
      });
      
      return {
        success: true,
        operations,
        estimatedGas: BigInt(operations.length * 150000),
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
  }, [validateWorkflow, getExecutionOrder, userAddress]);

  return {
    isExecuting,
    executionSteps,
    currentStep,
    executeWorkflow,
    simulateWorkflow,
    validateWorkflow,
  };
};