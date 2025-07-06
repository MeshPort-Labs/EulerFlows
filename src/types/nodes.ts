export type NodeCategory = 'core' | 'lp-toolkit' | 'strategy' | 'control' | 'alert';

export type CoreActionType = 'supply' | 'withdraw' | 'borrow' | 'repay' | 'swap' | 'permissions';
export type LpToolkitActionType = 'create-pool' | 'add-liquidity' | 'remove-liquidity';
export type StrategyType = 'leverage' | 'borrow-against-lp' | 'hedged-lp' | 'jit-liquidity';
export type ControlType = 'start' | 'end';
export type AlertActionType = 'telegram' | 'discord';

export interface BaseNodeData {
  label: string;
  category: NodeCategory;
  description?: string;
  onDelete?: () => void;
  [key: string]: unknown;
}

export interface ControlNodeData extends BaseNodeData {
  category: 'control';
  controlType: ControlType;
}

export interface CoreActionNodeData extends BaseNodeData {
  category: 'core';
  action: CoreActionType;
  vaultAddress?: string;
  amount?: string;
  tokenIn?: string;
  tokenOut?: string;
  slippage?: number;
  collaterals?: string[];
  controller?: string;
}

export interface LpToolkitNodeData extends BaseNodeData {
  category: 'lp-toolkit';
  action: LpToolkitActionType;
  vault0?: string;
  vault1?: string;
  amount0?: string;
  amount1?: string;
  fee?: string;
  poolAddress?: string;
}

export interface StrategyNodeData extends BaseNodeData {
  category: 'strategy';
  strategyType: StrategyType;
  
  collateralAsset?: string;
  borrowAsset?: string;
  leverageFactor?: number;

  borrowAmount?: string;

  jitAsset?: string;
  jitAmount?: string;
  jitAction?: 'deploy' | 'withdraw';
}

export interface AlertNodeData extends BaseNodeData {
  category: 'alert';
  alertType: AlertActionType;
  recipient?: string;
  message?: string;
  triggerCondition?: 'success' | 'failure' | 'always';
  webhookUrl?: string;
  chatId?: string;
  botToken?: string;
}

export type NodeData = ControlNodeData | CoreActionNodeData | LpToolkitNodeData | StrategyNodeData | AlertNodeData;