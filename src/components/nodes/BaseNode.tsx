import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BaseNodeProps {
  data: any;
  selected?: boolean;
  children?: React.ReactNode;
  onDelete?: () => void;
}

export const BaseNode: React.FC<BaseNodeProps> = ({ data, selected, children, onDelete }) => {
  const deleteHandler = onDelete || data.onDelete;
  
  return (
    <div className="relative group">
      <div
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          "bg-card border border-border shadow-md hover:shadow-lg",
          "min-w-[160px] min-h-[60px] rounded-lg",
          selected && "ring-2 ring-primary shadow-lg border-primary"
        )}
        style={{
          background: 'var(--node-bg)',
          borderColor: selected ? 'var(--node-selected)' : 'var(--node-border)',
          boxShadow: selected 
            ? '0 0 0 2px var(--node-selected)' 
            : '0 4px 12px var(--node-shadow)'
        }}
      >
        <div className="px-4 py-3">
          {children}
        </div>
      </div>

      {selected && deleteHandler && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            deleteHandler();
          }}
          className={cn(
            "absolute -top-2 -right-2 w-5 h-5 rounded-full",
            "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
            "flex items-center justify-center shadow-md",
            "transition-all duration-200 hover:scale-110",
            "border border-background z-30"
          )}
        >
          <X className="w-3 h-3" />
        </button>
      )}

      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 border-2 border-background rounded-full shadow-sm hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
        style={{ 
          background: 'var(--node-handle)',
          top: '-6px'
        }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 border-2 border-background rounded-full shadow-sm hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
        style={{ 
          background: 'var(--node-handle)',
          bottom: '-6px'
        }}
      />
    </div>
  );
};