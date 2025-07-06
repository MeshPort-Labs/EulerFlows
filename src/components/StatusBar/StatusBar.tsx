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
        return <Clock className="w-4 h-4 text-warning" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Zap className="w-4 h-4 text-muted-foreground" />;
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

  const getStatusBadgeClass = () => {
    switch (executionStatus) {
      case 'running':
        return 'bg-warning/20 text-warning border-warning';
      case 'completed':
        return 'bg-success/20 text-success border-success';
      case 'error':
        return 'bg-destructive/20 text-destructive border-destructive';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="footer-bar h-12 flex items-center justify-between px-6 text-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Nodes:</span>
          <Badge variant="outline" className="text-xs h-5 bg-card">
            {nodeCount}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Connections:</span>
          <Badge variant="outline" className="text-xs h-5 bg-card">
            {edgeCount}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Status:</span>
          <Badge 
            variant="outline" 
            className={`text-xs h-5 ${
              isValid 
                ? 'bg-success/20 text-success border-success' 
                : 'bg-destructive/20 text-destructive border-destructive'
            }`}
          >
            {isValid ? 'Valid' : 'Invalid'}
          </Badge>
        </div>
      </div>

      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getStatusBadgeClass()}`}>
        {getStatusIcon()}
        <span className="font-medium">{getStatusText()}</span>
      </div>
    </div>
  );
};