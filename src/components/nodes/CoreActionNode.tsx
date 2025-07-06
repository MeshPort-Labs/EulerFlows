import React from 'react';
import { BaseNode } from './BaseNode';
import { 
  Database, 
  ArrowRightLeft, 
  Settings, 
  ArrowUpRight,
  CheckCircle,
  Download
} from 'lucide-react';
import type { NodeProps } from '@xyflow/react';
import { cn } from '../../lib/utils';

interface CoreActionNodeData {
  label: string;
  action: 'supply' | 'withdraw' | 'borrow' | 'repay' | 'swap' | 'permissions';
  controller?: string;
  collaterals?: any[];
  vaultAddress?: string;
  amount?: string | number;
  // add other fields as needed
}

export const CoreActionNode: React.FC<NodeProps> = ({ data, selected, ...props }) => {
  const nodeData = data as unknown as CoreActionNodeData;
  const getIcon = () => {
    switch (nodeData.action) {
      case 'supply': return <Database className="w-4 h-4" />;
      case 'withdraw': return <ArrowUpRight className="w-4 h-4" />;
      case 'borrow': return <Download className="w-4 h-4" />;
      case 'repay': return <CheckCircle className="w-4 h-4" />;
      case 'swap': return <ArrowRightLeft className="w-4 h-4" />;
      case 'permissions': return <Settings className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const getStatus = () => {
    if (nodeData.action === 'permissions') {
      return nodeData.controller || (Array.isArray(nodeData.collaterals) && nodeData.collaterals.length > 0) ? 'ready' : 'needs-config';
    }
    return nodeData.vaultAddress && nodeData.amount ? 'ready' : 'needs-config';
  };

  const status = getStatus();

  return (
    <BaseNode data={nodeData} selected={selected} {...props}>
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ 
            backgroundColor: 'var(--category-core)',
            color: 'white'
          }}
        >
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground truncate">
            {nodeData.label}
          </div>
          
          <div className="flex items-center gap-1 mt-1">
            <div 
              className={cn(
                "w-2 h-2 rounded-full",
                status === 'ready' ? 'bg-green-500' : 'bg-yellow-500'
              )}
            /> 
            <span className="text-xs text-muted-foreground">
              {status === 'ready' ? 'Ready' : 'Configure'}
            </span>
          </div>
        </div>
      </div>
    </BaseNode>
  );
};