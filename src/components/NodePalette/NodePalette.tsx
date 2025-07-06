import React, { useState } from 'react';
import { 
  Database, 
  ArrowRightLeft,
  Target,
  Play,
  Square,
  Settings,
  ArrowUpRight,
  CheckCircle,
  Layers,
  MessageSquare,
  Bell,
  Search,
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface NodeTemplate {
  id: string;
  type: string;
  label: string;
  category: 'core' | 'lp-toolkit' | 'strategy' | 'control' | 'alert';
  description: string;
  icon: React.ReactNode;
  defaultData?: Record<string, any>;
}

const nodeTemplates: NodeTemplate[] = [
  {
    id: 'start',
    type: 'startNode',
    label: 'Trigger',
    category: 'control',
    description: 'Workflow starting point',
    icon: <Play className="w-4 h-4" />
  },
  {
    id: 'supply-assets',
    type: 'coreActionNode',
    label: 'Supply Assets',
    category: 'core',
    description: 'Deposit assets to vault to earn yield',
    icon: <Database className="w-4 h-4" />,
    defaultData: { action: 'supply' }
  },
  {
    id: 'borrow-assets',
    type: 'coreActionNode',
    label: 'Borrow Assets',
    category: 'core',
    description: 'Borrow assets against collateral',
    icon: <Database className="w-4 h-4" />,
    defaultData: { action: 'borrow' }
  },
  {
    id: 'withdraw-assets',
    type: 'coreActionNode',
    label: 'Withdraw Assets',
    category: 'core',
    description: 'Withdraw assets from vault',
    icon: <ArrowUpRight className="w-4 h-4" />,
    defaultData: { action: 'withdraw' }
  },
  {
    id: 'repay-debt',
    type: 'coreActionNode',
    label: 'Repay Debt',
    category: 'core',
    description: 'Repay borrowed assets',
    icon: <CheckCircle className="w-4 h-4" />,
    defaultData: { action: 'repay' }
  },
  {
    id: 'swap-tokens',
    type: 'coreActionNode',
    label: 'Swap Tokens',
    category: 'core',
    description: 'Swap tokens via EulerSwap',
    icon: <ArrowRightLeft className="w-4 h-4" />,
    defaultData: { action: 'swap' }
  },
  {
    id: 'set-permissions',
    type: 'coreActionNode',
    label: 'Set Permissions',
    category: 'core',
    description: 'Enable collaterals and controllers',
    icon: <Settings className="w-4 h-4" />,
    defaultData: { action: 'permissions' }
  },
  {
    id: 'discord-alert',
    type: 'alertNode',
    label: 'Discord',
    category: 'alert',
    description: 'Send notification to Discord',
    icon: <MessageSquare className="w-4 h-4" />,
    defaultData: { alertType: 'discord' }
  },
  {
    id: 'end',
    type: 'endNode',
    label: 'End',
    category: 'control',
    description: 'Workflow ending point',
    icon: <Square className="w-4 h-4" />
  },
];

const categoryInfo = {
  control: { label: 'Trigger', icon: <Play className="w-4 h-4" /> },
  core: { label: 'Action', icon: <Database className="w-4 h-4" /> },
  strategy: { label: 'Strategy', icon: <Target className="w-4 h-4" /> },
  'lp-toolkit': { label: 'LP Toolkit', icon: <Layers className="w-4 h-4" /> },
  alert: { label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
};

export const NodePalette: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('core');

  const handleDragStart = (event: React.DragEvent, nodeTemplate: NodeTemplate) => {
    const nodeTemplateWithDefaults = {
      ...nodeTemplate,
      data: {
        label: nodeTemplate.label,
        category: nodeTemplate.category,
        description: nodeTemplate.description,
        ...nodeTemplate.defaultData,
      }
    };
    
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeTemplateWithDefaults));
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredNodes = nodeTemplates.filter(node => {
    const matchesSearch = node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['core', 'alert', 'control'] as const;

  return (
    <div 
      className="w-80 border-r flex flex-col"
      style={{ 
        background: 'var(--sidebar-bg)',
        borderColor: 'var(--sidebar-border)'
      }}
    >
      <div className="p-4 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--sidebar-text)' }}>
            Add to workflow
          </h2>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                  style={{ color: 'var(--sidebar-text)' }} />
          <Input
            placeholder="Search Action"
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
            style={{ 
              background: 'var(--input)',
              borderColor: 'var(--border)',
              color: 'var(--sidebar-text)'
            }}
          />
        </div>

        <div className="flex gap-1 mb-4 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`panel-tabs tab-trigger whitespace-nowrap ${
                selectedCategory === category ? 'data-[state=active]' : ''
              }`}
              data-state={selectedCategory === category ? 'active' : 'inactive'}
            >
              {categoryInfo[category].label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {selectedCategory && categoryInfo[selectedCategory as keyof typeof categoryInfo] && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                {categoryInfo[selectedCategory as keyof typeof categoryInfo].icon}
                <h3 className="font-medium" style={{ color: 'var(--sidebar-text)' }}>
                  {categoryInfo[selectedCategory as keyof typeof categoryInfo].label}
                </h3>
              </div>
            </div>
          )}

          {filteredNodes.map((node) => (
            <div
              key={node.id}
              draggable
              onDragStart={(e) => handleDragStart(e, node)}
              className="sidebar-item group"
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ 
                  background: `var(--category-${node.category === 'lp-toolkit' ? 'lp' : node.category})`,
                  color: 'white'
                }}
              >
                {node.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm" style={{ color: 'var(--sidebar-text)' }}>
                  {node.label}
                </div>
                <p className="text-xs truncate" style={{ color: 'var(--sidebar-text-muted)' }}>
                  {node.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};