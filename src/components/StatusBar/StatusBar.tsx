import React from 'react';
import { Badge } from '../ui/badge';
import { CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';

interface StatusBarProps {
  nodeCount: number;
  edgeCount: number;
  isValid: boolean;
  executionStatus: 'idle' | 'running' | 'completed' | 'error';
}

export const StatusBar: React.FC<StatusBarProps> = ({
  nodeCount,
  edgeCount,
  isValid,
  executionStatus,
}) => {
  const getStatusIcon = () => {
    switch (executionStatus) {
      case 'running':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Zap className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (executionStatus) {
      case 'running':
        return 'Executing workflow...';
      case 'completed':
        return 'Workflow completed successfully';
      case 'error':
        return 'Workflow execution failed';
      default:
        return 'Ready to execute';
    }
  };

  const getStatusColor = () => {
    switch (executionStatus) {
      case 'running':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div 
      className="h-10 border-t flex items-center justify-between px-6 text-sm"
      style={{ 
        background: 'var(--panel-bg)',
        borderColor: 'var(--panel-border)'
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--panel-text-muted)' }}>Nodes:</span>
          <Badge variant="outline" className="text-xs h-5">
            {nodeCount}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--panel-text-muted)' }}>Connections:</span>
          <Badge variant="outline" className="text-xs h-5">
            {edgeCount}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--panel-text-muted)' }}>Status:</span>
          <Badge 
            variant="outline" 
            className={`text-xs h-5 ${isValid ? 'border-green-300 text-green-700' : 'border-red-300 text-red-700'}`}
          >
            {isValid ? 'Valid' : 'Invalid'}
          </Badge>
        </div>
      </div>

      <div className={`flex items-center gap-2 px-3 py-1 rounded border ${getStatusColor()}`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>
    </div>
  );
};