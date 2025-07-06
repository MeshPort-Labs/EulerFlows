import { StartNode } from './StartNode';
import { EndNode } from './EndNode';
import { CoreActionNode } from './CoreActions';
import { LpToolkitNode } from './LpToolkit';
import { StrategyNode } from './Strategies';
import { AlertNode } from './Alerts';
import type { NodeTypes } from '@xyflow/react';

export const nodeTypes: NodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  coreActionNode: CoreActionNode,
  lpToolkitNode: LpToolkitNode,
  strategyNode: StrategyNode,
  alertNode: AlertNode,
};

export { 
  StartNode, 
  EndNode, 
  CoreActionNode,
  LpToolkitNode,
  StrategyNode,
  AlertNode
};