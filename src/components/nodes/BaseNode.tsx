import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
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
      {selected && deleteHandler && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            deleteHandler();
          }}
          className={cn(
            "absolute -top-3 -right-3 w-7 h-7 rounded-full z-50",
            "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
            "flex items-center justify-center shadow-lg",
            "transition-all duration-200 hover:scale-110",
            "border-2 border-background animate-fade-in"
          )}
          style={{ zIndex: 1000 }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      
      <div
        className={cn(
          "node-card relative overflow-hidden",
          "min-w-[200px] min-h-[70px] rounded-xl p-4",
          selected && "selected"
        )}
      >
        {children}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 border-background rounded-full shadow-sm hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
        style={{ 
          background: 'var(--primary)',
          left: '-6px'
        }}
      />

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-background rounded-full shadow-sm hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
        style={{ 
          background: 'var(--primary)',
          right: '-6px'
        }}
      />
    </div>
  );
};