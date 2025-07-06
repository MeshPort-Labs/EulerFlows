import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  X, 
  Settings, 
  Info, 
  Save,
  RotateCcw
} from 'lucide-react';
import { CoreActionProperties } from './sections/CoreActionProperties';
import { GeneralProperties } from './sections/GeneralProperties';
import type { Node } from '@xyflow/react';

interface PropertyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: Node<any> | null;
  onNodeUpdate: (nodeId: string, updates: any) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  isOpen,
  onClose,
  selectedNode,
  onNodeUpdate,
}) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('desc');

  if (!selectedNode) {
    return null;
  }

  const nodeData = selectedNode.data;

  const handleUpdate = (updates: any) => {
    onNodeUpdate(selectedNode.id, updates);
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
  };

  const handleReset = () => {
    setHasChanges(false);
  };

  const getCategoryTheme = (category: string) => {
    const themes = {
      core: 'category-core',
      strategy: 'category-strategy',
      'lp-toolkit': 'category-lp', 
      alert: 'category-alert',
      control: 'category-control',
    };
    return themes[category as keyof typeof themes] || 'category-control';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      core: 'Action',
      strategy: 'Strategy',
      'lp-toolkit': 'LP Toolkit',
      alert: 'Notifications',
      control: 'Control',
    };
    return labels[category as keyof typeof labels] || 'Unknown';
  };

  const renderNodeSpecificProperties = () => {
    switch (nodeData.category) {
      case 'core':
        return <CoreActionProperties data={nodeData} onUpdate={handleUpdate} />;
      case 'alert':
        return <CoreActionProperties data={nodeData} onUpdate={handleUpdate} />;
      case 'control':
        return (
          <div 
            className="text-center py-12"
            style={{ color: 'var(--panel-text-muted)' }}
          >
            <Settings className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <h3 className="font-medium mb-2">Control Node</h3>
            <p className="text-sm">Control nodes have no configurable properties.</p>
          </div>
        );
      default:
        return (
          <div 
            className="text-center py-12"
            style={{ color: 'var(--panel-text-muted)' }}
          >
            <Settings className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <h3 className="font-medium mb-2">Unknown Node Type</h3>
            <p className="text-sm">No properties available for this node type.</p>
          </div>
        );
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        className="w-96 overflow-hidden flex flex-col p-0"
        style={{ backgroundColor: 'var(--panel-bg)' }}
      >
        <SheetHeader className="flex-shrink-0 p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <SheetTitle 
                className="text-lg font-semibold"
                style={{ color: 'var(--panel-text)' }}
              >
                {nodeData.label}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs category-badge ${getCategoryTheme(nodeData.category)}`}
                >
                  {getCategoryLabel(nodeData.category)}
                </Badge>
                {hasChanges && (
                  <Badge variant="secondary" className="text-xs animate-pulse">
                    Modified
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <Separator style={{ borderColor: 'var(--panel-border)' }} />

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList 
              className="grid w-full grid-cols-3 mx-6 mt-4 panel-tabs"
              style={{ background: 'transparent' }}
            >
              <TabsTrigger value="desc" className="tab-trigger">
                Desc
              </TabsTrigger>
              <TabsTrigger value="param" className="tab-trigger">
                Param
              </TabsTrigger>
              <TabsTrigger value="output" className="tab-trigger">
                Output
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden mt-4">
              <TabsContent value="desc" className="h-full overflow-y-auto px-6 mt-0">
                <GeneralProperties data={nodeData} onUpdate={handleUpdate} />
              </TabsContent>

              <TabsContent value="param" className="h-full overflow-y-auto px-6 mt-0">
                {renderNodeSpecificProperties()}
              </TabsContent>

              <TabsContent value="output" className="h-full overflow-y-auto px-6 mt-0">
                <div 
                  className="text-center py-12"
                  style={{ color: 'var(--panel-text-muted)' }}
                >
                  <Info className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <h3 className="font-medium mb-2">Output</h3>
                  <p className="text-sm">Output configuration will be available soon.</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <Separator style={{ borderColor: 'var(--panel-border)' }} />

        <div className="flex-shrink-0 p-6 pt-4">
          {hasChanges && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={handleSave}
                className="flex-1"
                size="sm"
                style={{
                  backgroundColor: 'var(--tab-active)',
                  color: 'var(--tab-text-active)'
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};