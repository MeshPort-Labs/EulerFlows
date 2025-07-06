import React from 'react';
import { BaseNode } from './BaseNode';
import { Play } from 'lucide-react';
import type { NodeProps } from '@xyflow/react';

export const StartNode: React.FC<NodeProps> = ({ data, selected, ...props }) => {
  return (
    <BaseNode data={data} selected={selected} {...props}>
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ 
            backgroundColor: 'var(--category-control)',
            color: 'white'
          }}
        >
          <Play className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground truncate">
            Trigger
          </div>
          
          <div className="flex items-center gap-1 mt-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Ready</span>
          </div>
        </div>
      </div>
    </BaseNode>
  );
};