import React from 'react';
import { BaseNode } from './BaseNode';
import type { NodeProps } from '@xyflow/react';

interface MinimalNodeConfig {
  icon: React.ReactElement;
  label: string;
  getStatus: (data: any) => 'ready' | 'needs-config' | 'error';
  colorClass: string;
}

interface MinimalNodeProps extends NodeProps {
  config: MinimalNodeConfig;
  onDelete?: () => void;
}

export const MinimalNode: React.FC<MinimalNodeProps> = ({ 
  data, 
  selected, 
  config,
  onDelete 
}) => {
  const nodeData = data;
  const status = config.getStatus(nodeData);

  return (
    <BaseNode data={nodeData} selected={selected} onDelete={onDelete}>
      <div className="flex items-center gap-3">
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.colorClass}`}
        >
          {React.cloneElement(config.icon as React.ReactElement<any>, { className: "w-4 h-4 text-white" })}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground truncate">
            {config.label}
          </div>
          
          <div className="flex items-center gap-1 mt-1">
            <div 
              className={`w-2 h-2 rounded-full ${
                status === 'ready' ? 'bg-green-500' : 
                status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`} 
            />
            <span className="text-xs text-muted-foreground">
              {status === 'ready' ? 'Ready' : 
               status === 'error' ? 'Error' : 'Configure'}
            </span>
          </div>
        </div>
      </div>
    </BaseNode>
  );
};