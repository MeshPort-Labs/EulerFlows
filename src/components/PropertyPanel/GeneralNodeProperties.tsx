import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Info, Tag } from 'lucide-react';
import type { NodeData } from '../../types/nodes';

interface GeneralNodePropertiesProps {
  data: NodeData;
  onUpdate: (updates: Partial<NodeData>) => void;
}

export const GeneralNodeProperties: React.FC<GeneralNodePropertiesProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-6">
      <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span style={{ color: 'var(--panel-text)' }}>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium" style={{ color: 'var(--panel-text)' }}>
              Node Label
            </Label>
            <Input
              type="text"
              value={data.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="mt-1"
              placeholder="Enter node label"
            />
          </div>

          <div>
            <Label className="text-sm font-medium" style={{ color: 'var(--panel-text)' }}>
              Description
            </Label>
            <Textarea
              value={data.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="mt-1"
              placeholder="Enter a description for this node"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-sm font-medium" style={{ color: 'var(--panel-text)' }}>
              Category
            </Label>
            <div className="mt-1">
              <Badge variant="outline" className="capitalize">
                {data.category}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Tag className="w-4 h-4" />
            <span style={{ color: 'var(--panel-text)' }}>Node Metadata</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span style={{ color: 'var(--panel-text-muted)' }}>Type:</span>
              <span className="font-mono text-xs" style={{ color: 'var(--panel-text)' }}>
                {data.category}Node
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--panel-text-muted)' }}>Status:</span>
              <Badge variant="outline" className="text-xs">
                {data.label && data.description ? 'Ready' : 'Needs Configuration'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div 
        className="p-3 rounded-lg border"
        style={{ 
          backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
          borderColor: 'var(--primary)'
        }}
      >
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
          <div className="text-sm" style={{ color: 'var(--primary)' }}>
            <p className="font-medium mb-1">Need help?</p>
            <p className="text-xs">
              Configure the node properties in the Properties tab. 
              Make sure all required fields are filled before executing the workflow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};