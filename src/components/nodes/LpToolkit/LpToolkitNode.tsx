import React from 'react';
import type { NodeProps } from '@xyflow/react';
import type { LpToolkitNodeData } from '../../../types/nodes';
import { CreatePool } from './CreatePool';
import { AddLiquidity } from './AddLiquidity';
import { RemoveLiquidity } from './RemoveLiquidity';

export const LpToolkitNode: React.FC<NodeProps> = (props) => {
  const nodeData = props.data as LpToolkitNodeData;
  
  switch (nodeData.action) {
    case 'create-pool':
      return <CreatePool {...props} />;
    case 'add-liquidity':
      return <AddLiquidity {...props} />;
    case 'remove-liquidity':
      return <RemoveLiquidity {...props} />;
    default:
      return <CreatePool {...props} />;
  }
};