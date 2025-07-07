import type { NodeData, CoreActionNodeData, StrategyNodeData, LpToolkitNodeData } from '../types/nodes';
import {
  supplyToVault,
  borrowAndSendTo,
  repayToVault,
  withdrawFromVault,
  enableController,
  prepareDirectPoolSwap,
  getMyEulerSwapPool,
  getQuoteOnChain,
  createLeverageStrategy,
  createLpCollateralizationStrategy,
  createHedgedLpStrategy,
  createJitDepositStrategy,
  createJitWithdrawalStrategy,
} from './euler/eulerLib';
import { DEVLAND_ADDRESSES } from './euler/addresses';
import { parseUnits } from 'viem';
import type { Address } from 'viem';

export class EulerWorkflowExecutor {
  static async executeNodeSequence(nodes: NodeData[], userAddress: Address): Promise<any[]> {
    const allBatches: any[] = [];
    
    for (const node of nodes) {
      const batches = await this.nodeToEulerLibOperations(node, userAddress);
      allBatches.push(...batches);
    }
    
    return allBatches;
  }

  private static async nodeToEulerLibOperations(node: NodeData, userAddress: Address): Promise<any[]> {
    switch (node.category) {
      case 'core':
        return this.handleCoreActionWithEulerLib(node as CoreActionNodeData, userAddress);
      case 'strategy':
        return this.handleStrategyWithEulerLib(node as StrategyNodeData, userAddress);
      case 'lp-toolkit':
        return this.handleLpToolkitWithEulerLib(node as LpToolkitNodeData, userAddress);
      default:
        return [];
    }
  }

  private static async handleCoreActionWithEulerLib(data: CoreActionNodeData, userAddress: Address): Promise<any[]> {
    console.log(`🔧 Processing core action: ${data.action} for vault: ${data.vaultAddress}, amount: ${data.amount}`);
    
    // Parse amount with correct decimals
    const getTokenDecimals = (vaultSymbol: string) => {
      return ['USDC', 'USDT'].includes(vaultSymbol) ? 6 : 18;
    };

    switch (data.action) {
      case 'supply': {
        if (!data.vaultAddress || !data.amount) {
          console.error(`❌ Missing required fields for supply: vaultAddress=${data.vaultAddress}, amount=${data.amount}`);
          return [];
        }

        const decimals = getTokenDecimals(data.vaultAddress);
        const amount = parseUnits(data.amount, decimals);
        
        console.log(`📥 Creating supply operation: ${data.amount} ${data.vaultAddress} (${amount} with ${decimals} decimals)`);
        
        const operation = supplyToVault(
          data.vaultAddress as keyof typeof DEVLAND_ADDRESSES.vaults, 
          amount
        );
        return [operation];
      }
      
      case 'withdraw': {
        if (!data.vaultAddress || !data.amount) {
          console.error(`❌ Missing required fields for withdraw: vaultAddress=${data.vaultAddress}, amount=${data.amount}`);
          return [];
        }

        const decimals = getTokenDecimals(data.vaultAddress);
        const amount = parseUnits(data.amount, decimals);
        
        console.log(`📤 Creating withdraw operation: ${data.amount} ${data.vaultAddress} (${amount} with ${decimals} decimals)`);
        
        const operation = withdrawFromVault(
          data.vaultAddress as keyof typeof DEVLAND_ADDRESSES.vaults,
          amount,
          userAddress
        );
        return [operation];
      }
      
      case 'borrow': {
        if (!data.vaultAddress || !data.amount) {
          console.error(`❌ Missing required fields for borrow: vaultAddress=${data.vaultAddress}, amount=${data.amount}`);
          return [];
        }

        const decimals = getTokenDecimals(data.vaultAddress);
        const amount = parseUnits(data.amount, decimals);
        
        console.log(`📊 Creating borrow operation: ${data.amount} ${data.vaultAddress} (${amount} with ${decimals} decimals)`);
        
        const operation = borrowAndSendTo(
          data.vaultAddress as keyof typeof DEVLAND_ADDRESSES.vaults,
          amount,
          userAddress
        );
        return [operation];
      }
      
      case 'repay': {
        if (!data.vaultAddress || !data.amount) {
          console.error(`❌ Missing required fields for repay: vaultAddress=${data.vaultAddress}, amount=${data.amount}`);
          return [];
        }

        const decimals = getTokenDecimals(data.vaultAddress);
        const amount = parseUnits(data.amount, decimals);
        
        console.log(`💳 Creating repay operation: ${data.amount} ${data.vaultAddress} (${amount} with ${decimals} decimals)`);
        
        const operation = repayToVault(
          data.vaultAddress as keyof typeof DEVLAND_ADDRESSES.vaults,
          amount
        );
        return [operation];
      }
      
      case 'permissions': {
        const operations = [];
        
        if (data.controller) {
          console.log(`🎛️ Creating enable controller operation for ${data.controller}`);
          operations.push(enableController(data.controller as keyof typeof DEVLAND_ADDRESSES.vaults));
        }
        
        if (data.collaterals && data.collaterals.length > 0) {
          console.log(`🔒 Enable collateral operations not yet implemented for: ${data.collaterals.join(', ')}`);
        }
        
        return operations;
      }
      
      case 'swap': {
        if (!data.tokenIn || !data.tokenOut || !data.amount) {
          console.error(`❌ Missing required fields for swap: tokenIn=${data.tokenIn}, tokenOut=${data.tokenOut}, amount=${data.amount}`);
          return [];
        }
      
        console.log(`🔄 Creating swap operation: ${data.amount} ${data.tokenIn} → ${data.tokenOut}`);
        
        try {
          // Get user's EulerSwap pool
          const poolAddress = await getMyEulerSwapPool(userAddress);
          if (!poolAddress) {
            console.error(`❌ No EulerSwap pool found for user ${userAddress}`);
            return [];
          }
      
          // Parse amount with correct decimals for input token
          const inputDecimals = getTokenDecimals(data.tokenIn);
          const amountIn = parseUnits(data.amount, inputDecimals);
          
          console.log(`🔄 Attempting swap: ${data.amount} ${data.tokenIn} (${amountIn} raw) → ${data.tokenOut}`);
          
          // Try to get on-chain quote with error handling
          let quoteAmountOut: bigint | null = null;
          try {
            quoteAmountOut = await getQuoteOnChain(
              poolAddress,
              data.tokenIn as keyof typeof DEVLAND_ADDRESSES.vaults,
              data.tokenOut as keyof typeof DEVLAND_ADDRESSES.vaults,
              amountIn
            );
          } catch (quoteError: any) {
            console.error(`❌ Quote failed for ${data.tokenIn} → ${data.tokenOut}:`, quoteError);
            
            // Check if it's a SwapLimitExceeded error
            if (quoteError.message?.includes('SwapLimitExceeded')) {
              console.error(`💥 Swap amount ${data.amount} ${data.tokenIn} exceeds pool capacity`);
              console.error(`💡 Try reducing the swap amount or ensure the pool has sufficient liquidity`);
              
              // Return empty array to skip this operation but continue workflow
              console.warn(`⚠️ Skipping swap operation due to liquidity constraints`);
              return [];
            }
            
            // For other errors, also skip but log differently
            console.error(`❌ Failed to get swap quote: ${quoteError.message}`);
            return [];
          }
          
          if (!quoteAmountOut || quoteAmountOut === 0n) {
            console.error(`❌ Invalid quote received: ${quoteAmountOut}`);
            return [];
          }
      
          // Apply slippage (default 0.5% if not specified)
          const slippageBps = Math.floor((data.slippage || 0.5) * 100); // Convert to basis points
          const minAmountOut = (quoteAmountOut * BigInt(10000 - slippageBps)) / 10000n;
          
          console.log(`💱 Swap details: ${data.amount} ${data.tokenIn} → ~${quoteAmountOut} ${data.tokenOut} (min: ${minAmountOut})`);
      
          // Create swap operation
          const swapOperation = await prepareDirectPoolSwap(
            poolAddress,
            data.tokenIn as keyof typeof DEVLAND_ADDRESSES.vaults,
            data.tokenOut as keyof typeof DEVLAND_ADDRESSES.vaults,
            amountIn,
            minAmountOut,
            userAddress // Send swapped tokens to user's wallet
          );
      
          console.log(`✅ Swap operation created successfully`);
          return [swapOperation];
          
        } catch (error) {
          console.error(`❌ Failed to create swap operation:`, error);
          
          // Log specific error types for debugging
          if (error instanceof Error) {
            console.error(`Error type: ${error.constructor.name}`);
            console.error(`Error message: ${error.message}`);
          }
          
          return [];
        }
      }
      
      default:
        console.warn(`⚠️ Unsupported core action: ${data.action}`);
        return [];
    }
  }

  private static async handleStrategyWithEulerLib(data: StrategyNodeData, userAddress: Address): Promise<any[]> {
    console.log(`🎯 Processing strategy: ${data.strategyType}`);
    
    const getTokenDecimals = (symbol: string) => {
      return ['USDC', 'USDT'].includes(symbol) ? 6 : 18;
    };

    switch (data.strategyType) {
      case 'leverage': {
        if (!data.collateralAsset || !data.borrowAsset || !data.leverageFactor) {
          console.error(`❌ Missing required fields for leverage strategy`);
          return [];
        }
        
        const initialAmount = parseUnits('1000', getTokenDecimals(data.collateralAsset));
        
        console.log(`🚀 Creating leverage strategy: ${data.leverageFactor}x leverage on ${data.collateralAsset} vs ${data.borrowAsset}`);
        
        const strategy = await createLeverageStrategy(
          data.collateralAsset as keyof typeof DEVLAND_ADDRESSES.vaults,
          initialAmount,
          data.borrowAsset as keyof typeof DEVLAND_ADDRESSES.vaults,
          data.leverageFactor
        );
        
        if (!strategy) {
          console.error(`❌ Failed to create leverage strategy`);
          return [];
        }
        
        console.log(`✅ Created leverage strategy with description: ${strategy.description}`);
        
        return [
          { batch: strategy.supplyMarginBatch, description: `${strategy.description} - Supply Margin` },
          { batch: strategy.borrowAndSwapBatch, description: `${strategy.description} - Borrow & Swap` }
        ];
      }
      
      case 'borrow-against-lp': {
        if (!data.borrowAsset || !data.borrowAmount) {
          console.error(`❌ Missing required fields for borrow-against-lp strategy`);
          return [];
        }
        
        const borrowAmount = parseUnits(data.borrowAmount, getTokenDecimals(data.borrowAsset));
        
        console.log(`🎯 Creating LP collateralization strategy: borrow ${data.borrowAmount} ${data.borrowAsset}`);
        
        const strategy = await createLpCollateralizationStrategy(
          data.borrowAsset as keyof typeof DEVLAND_ADDRESSES.vaults,
          borrowAmount
        );
        
        if (!strategy) {
          console.error(`❌ Failed to create LP collateralization strategy`);
          return [];
        }
        
        console.log(`✅ Created LP collateralization strategy: ${strategy.description}`);
        
        return [{ batch: strategy.batch, description: strategy.description }];
      }
      
      case 'hedged-lp': {
        if (!data.collateralAsset || !data.borrowAsset) {
          console.error(`❌ Missing required fields for hedged-lp strategy`);
          return [];
        }
        
        const supplyAmount = parseUnits('1000', getTokenDecimals(data.collateralAsset));
        const borrowAmount = parseUnits(data.borrowAmount || '500', getTokenDecimals(data.borrowAsset));
        
        console.log(`⚖️ Creating hedged LP strategy: supply ${supplyAmount} ${data.collateralAsset}, borrow ${borrowAmount} ${data.borrowAsset}`);
        
        const strategy = await createHedgedLpStrategy(
          data.collateralAsset as keyof typeof DEVLAND_ADDRESSES.vaults,
          supplyAmount,
          data.borrowAsset as keyof typeof DEVLAND_ADDRESSES.vaults,
          borrowAmount
        );
        
        if (!strategy) {
          console.error(`❌ Failed to create hedged LP strategy`);
          return [];
        }
        
        console.log(`✅ Created hedged LP strategy: ${strategy.description}`);
        
        return [{ batch: strategy.batch, description: strategy.description }];
      }
      
      case 'jit-liquidity': {
        if (!data.jitAsset || !data.jitAmount || !data.jitAction) {
          console.error(`❌ Missing required fields for JIT liquidity strategy`);
          return [];
        }
        
        const jitAmount = parseUnits(data.jitAmount, getTokenDecimals(data.jitAsset));
        const poolAddress = userAddress;
        
        console.log(`⚡ Creating JIT liquidity strategy: ${data.jitAction} ${data.jitAmount} ${data.jitAsset}`);
        
        if (data.jitAction === 'deploy') {
          const strategy = await createJitDepositStrategy(
            poolAddress,
            data.jitAsset as keyof typeof DEVLAND_ADDRESSES.vaults,
            jitAmount
          );
          
          if (!strategy) {
            console.error(`❌ Failed to create JIT deposit strategy`);
            return [];
          }
          
          console.log(`✅ Created JIT deposit strategy: ${strategy.description}`);
          return [{ batch: strategy.batch, description: strategy.description }];
          
        } else if (data.jitAction === 'withdraw') {
          const strategy = await createJitWithdrawalStrategy(
            poolAddress,
            data.jitAsset as keyof typeof DEVLAND_ADDRESSES.vaults,
            jitAmount
          );
          
          if (!strategy) {
            console.error(`❌ Failed to create JIT withdrawal strategy`);
            return [];
          }
          
          console.log(`✅ Created JIT withdrawal strategy: ${strategy.description}`);
          return [{ batch: strategy.batch, description: strategy.description }];
        }
        
        return [];
      }
      
      default:
        console.warn(`⚠️ Unsupported strategy type: ${data.strategyType}`);
        return [];
    }
  }

  private static async handleLpToolkitWithEulerLib(data: LpToolkitNodeData, userAddress: Address): Promise<any[]> {
    console.log(`🛠️ Processing LP toolkit action: ${data.action}`);
    
    switch (data.action) {
      case 'create-pool':
        console.warn(`⚠️ Create pool operation not yet implemented`);
        break;
      case 'add-liquidity':
        console.warn(`⚠️ Add liquidity operation not yet implemented`);
        break;
      case 'remove-liquidity':
        console.warn(`⚠️ Remove liquidity operation not yet implemented`);
        break;
      default:
        console.warn(`⚠️ Unknown LP toolkit action: ${data.action}`);
    }
    
    return [];
  }
}