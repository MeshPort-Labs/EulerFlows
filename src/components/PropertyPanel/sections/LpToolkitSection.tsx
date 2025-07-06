import React from 'react';
import { FormRenderer } from '../components/FormRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { 
  Layers, 
  Plus, 
  Minus 
} from 'lucide-react';
import type { LpToolkitNodeData, NodeData } from '../../../types/nodes';

interface LpToolkitSectionProps {
  data: NodeData;
  onUpdate: (updates: Partial<NodeData>) => void;
}

export const LpToolkitSection: React.FC<LpToolkitSectionProps> = ({ 
  data, 
  onUpdate 
}) => {
  const lpData = data as LpToolkitNodeData;
  const config = []; // Add LP toolkit configs when available

  const getIcon = () => {
    switch (lpData.action) {
      case 'create-pool': return <Layers className="w-4 h-4" />;
      case 'add-liquidity': return <Plus className="w-4 h-4" />;
      case 'remove-liquidity': return <Minus className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const getTitle = () => {
    switch (lpData.action) {
      case 'create-pool': return 'Pool Creation';
      case 'add-liquidity': return 'Add Liquidity';
      case 'remove-liquidity': return 'Remove Liquidity';
      default: return 'LP Configuration';
    }
  };

  const getDescription = () => {
    switch (lpData.action) {
      case 'create-pool': return 'Deploy a new EulerSwap liquidity pool';
      case 'add-liquidity': return 'Provide liquidity to earn trading fees';
      case 'remove-liquidity': return 'Withdraw liquidity and claim fees';
      default: return 'Configure liquidity pool parameters';
    }
  };

  return (
    <div className="space-y-4">
      <Card 
        className="property-panel-section"
        style={{ 
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)'
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <div 
                className="p-1.5 rounded-md"
                style={{ backgroundColor: 'var(--category-lp)' }}
              >
                {React.cloneElement(getIcon(), { className: "w-4 h-4 text-white" })}
              </div>
              <div className="flex flex-col">
                <span style={{ color: 'var(--panel-text)' }}>{getTitle()}</span>
                <span 
                  className="text-xs font-normal"
                  style={{ color: 'var(--panel-text-muted)' }}
                >
                  {getDescription()}
                </span>
              </div>
            </CardTitle>
            <Badge 
              variant="outline" 
              className="category-badge category-lp text-xs"
            >
              {lpData.action}
            </Badge>
          </div>
        </CardHeader>
        
        <Separator style={{ borderColor: 'var(--border)' }} />
        
        <CardContent className="pt-4">
          <FormRenderer 
            fields={config} 
            data={data} 
            onUpdate={onUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
};