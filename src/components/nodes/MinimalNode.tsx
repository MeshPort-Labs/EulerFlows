import React from 'react';
import { BaseNode } from './BaseNode';
import type { NodeProps } from '@xyflow/react';

interface MinimalNodeConfig {
  icon: React.ReactElement;
  label: string;
  getStatus: (data: any) => 'ready' | 'needs-config' | 'error';
  categoryClass: string;
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

  const getStatusColor = () => {
    switch (status) {
      case 'ready':
        return 'bg-success';
      case 'error':
        return 'bg-destructive';
      default:
        return 'bg-warning';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'error':
        return 'Error';
      default:
        return 'Configure';
    }
  };

  return (
    <BaseNode data={nodeData} selected={selected} onDelete={onDelete}>
      <div className="flex items-center gap-4">
        <div 
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${config.categoryClass}`}
        >
          {React.cloneElement(config.icon as React.ReactElement<any>, { 
            className: "w-5 h-5 text-white" 
          })}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground truncate">
            {config.label}
          </div>
          <div className="flex items-center mt-1 gap-1">
            {/* <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} /> */}
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground font-medium truncate">
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>
    </BaseNode>
  );
};