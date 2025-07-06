import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';

interface GeneralPropertiesProps {
  data: any;
  onUpdate: (updates: any) => void;
}

export const GeneralProperties: React.FC<GeneralPropertiesProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--panel-text)' }}>
          {data.category === 'alert' ? 'Discord Action' : `${data.label}`}
        </h3>
        <p className="text-sm" style={{ color: 'var(--panel-text-muted)' }}>
          {data.category === 'alert' 
            ? 'Discord is a communication service to talk with your favorite communities.' 
            : data.description || 'Configure the basic properties of this node.'
          }
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium" style={{ color: 'var(--panel-text)' }}>
            Node Label
          </Label>
          <Input
            type="text"
            value={data.label || ''}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="mt-1 property-field"
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
            className="mt-1 property-field"
            placeholder="Enter a description for this node"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};