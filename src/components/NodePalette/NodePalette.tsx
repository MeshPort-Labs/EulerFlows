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
  MessageCircle,
  Zap,
  BarChart3,
  TrendingUp,
  Coins,
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
  // Control nodes
  {
    id: 'start',
    type: 'startNode',
    label: 'Start',
    category: 'control',
    description: 'Workflow starting point',
    icon: <Play className="w-4 h-4" />
  },
  {
    id: 'end',
    type: 'endNode',
    label: 'End',
    category: 'control',
    description: 'Workflow ending point',
    icon: <Square className="w-4 h-4" />
  },
  
  // Core Actions (each with specific action type)
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
    id: 'withdraw-assets',
    type: 'coreActionNode',
    label: 'Withdraw Assets',
    category: 'core',
    description: 'Withdraw assets from vault to wallet',
    icon: <ArrowUpRight className="w-4 h-4" />,
    defaultData: { action: 'withdraw' }
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

  // LP Toolkit
  {
    id: 'create-pool',
    type: 'lpToolkitNode',
    label: 'Create Pool',
    category: 'lp-toolkit',
    description: 'Deploy new EulerSwap pool',
    icon: <Layers className="w-4 h-4" />,
    defaultData: { action: 'create-pool' }
  },
  {
    id: 'add-liquidity',
    type: 'lpToolkitNode',
    label: 'Add Liquidity',
    category: 'lp-toolkit',
    description: 'Add liquidity to pool',
    icon: <Coins className="w-4 h-4" />,
    defaultData: { action: 'add-liquidity' }
  },
  {
    id: 'remove-liquidity',
    type: 'lpToolkitNode',
    label: 'Remove Liquidity',
    category: 'lp-toolkit',
    description: 'Remove liquidity from pool',
    icon: <Coins className="w-4 h-4" />,
    defaultData: { action: 'remove-liquidity' }
  },

  // Structured Strategies (The Magic Buttons)
  {
    id: 'leveraged-position',
    type: 'strategyNode',
    label: 'Build Leveraged Position',
    category: 'strategy',
    description: 'Create leveraged long position',
    icon: <TrendingUp className="w-4 h-4" />,
    defaultData: { strategyType: 'leverage' }
  },
  {
    id: 'borrow-against-lp',
    type: 'strategyNode',
    label: 'Borrow Against LP',
    category: 'strategy',
    description: 'Use LP position as collateral',
    icon: <Target className="w-4 h-4" />,
    defaultData: { strategyType: 'borrow-against-lp' }
  },
  {
    id: 'hedged-lp',
    type: 'strategyNode',
    label: 'Hedged LP',
    category: 'strategy',
    description: 'Create delta-neutral LP position',
    icon: <BarChart3 className="w-4 h-4" />,
    defaultData: { strategyType: 'hedged-lp' }
  },
  {
    id: 'jit-liquidity',
    type: 'strategyNode',
    label: 'JIT Liquidity',
    category: 'strategy',
    description: 'Just-in-time liquidity provision',
    icon: <Zap className="w-4 h-4" />,
    defaultData: { strategyType: 'jit-liquidity' }
  },

  // Alert Nodes
  {
    id: 'telegram-alert',
    type: 'alertNode',
    label: 'Telegram Alert',
    category: 'alert',
    description: 'Send notification to Telegram',
    icon: <MessageCircle className="w-4 h-4" />,  
    defaultData: { alertType: 'telegram' }
  },
  {
    id: 'discord-alert',
    type: 'alertNode',
    label: 'Discord Alert',
    category: 'alert',
    description: 'Send notification to Discord',
    icon: <MessageSquare className="w-4 h-4" />,
    defaultData: { alertType: 'discord' }
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

 const categories = ['core', 'strategy', 'lp-toolkit', 'alert', 'control'] as const;

 return (
   <div className="h-full flex flex-col">
     <div className="p-6 border-b border-border">
       <h2 className="text-lg font-semibold text-foreground mb-4">
         Add to workflow
       </h2>

       <div className="relative mb-4 overflow-x-auto">
         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
         <Input
           placeholder="Search Action"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="pl-10 h-10 bg-input border-border"
         />
       </div>

       <div className="flex gap-2 mb-4 overflow-x-auto">
         {categories.map((category) => (
           <Button
             key={category}
             variant={selectedCategory === category ? "default" : "ghost"}
             size="sm"
             onClick={() => setSelectedCategory(category)}
             className={`tab-trigger whitespace-nowrap ${
               selectedCategory === category 
                 ? 'bg-primary text-primary-foreground' 
                 : 'text-muted-foreground hover:text-foreground'
             }`}
           >
             {categoryInfo[category].label}
           </Button>
         ))}
       </div>
     </div>

     <div className="flex-1 overflow-y-auto p-6">
       <div className="space-y-2">
         {selectedCategory && categoryInfo[selectedCategory as keyof typeof categoryInfo] && (
           <div className="mb-6">
             <div className="flex items-center gap-2 mb-4">
               {categoryInfo[selectedCategory as keyof typeof categoryInfo].icon}
               <h3 className="font-medium text-foreground">
                 {categoryInfo[selectedCategory as keyof typeof categoryInfo].label}
               </h3>
             </div>
           </div>
         )}

         {filteredNodes.map((node, index) => (
           <div
             key={node.id}
             draggable
             onDragStart={(e) => handleDragStart(e, node)}
             className="sidebar-item group animate-fade-in"
             style={{ animationDelay: `${index * 0.05}s` }}
           >
             <div 
               className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 category-${node.category === 'lp-toolkit' ? 'lp' : node.category}`}
             >
               {node.icon}
             </div>
             
             <div className="flex-1 min-w-0">
               <div className="font-medium text-sm text-foreground">
                 {node.label}
               </div>
               <p className="text-xs text-muted-foreground truncate">
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