import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Plus } from 'lucide-react';

interface CoreActionPropertiesProps {
  data: any;
  onUpdate: (updates: any) => void;
}

const vaultOptions = [
  { value: 'WETH', label: 'WETH - Wrapped Ethereum' },
  { value: 'USDC', label: 'USDC - USD Coin' },
  { value: 'USDT', label: 'USDT - Tether USD' },
  { value: 'DAI', label: 'DAI - Dai Stablecoin' },
];

const templateOptions = [
  { value: 'all', label: 'All', description: 'Send email' },
  { value: 'basic', label: 'Basic notification', description: 'Notify you that the flow has been triggered' },
];

export const CoreActionProperties: React.FC<CoreActionPropertiesProps> = ({ data, onUpdate }) => {
  if (data.category === 'alert') {
    return (
      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium" style={{ color: 'var(--panel-text)' }}>
            Action
          </Label>
          <Select value="send-message" onValueChange={() => {}}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Send message" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="send-message">Send message</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium" style={{ color: 'var(--panel-text)' }}>
              Templates 💡
            </Label>
          </div>
          
          <div className="flex gap-2 mb-3">
            <Button 
              size="sm" 
              className="h-7 text-xs"
              style={{ backgroundColor: 'var(--tab-active)', color: 'var(--tab-text-active)' }}
            >
              All
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-7 text-xs"
            >
              Send message
            </Button>
          </div>

          <div 
            className="p-3 rounded-lg border mb-4"
            style={{ 
              backgroundColor: 'var(--card)', 
              borderColor: 'var(--panel-border)'
            }}
          >
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--panel-text)' }}>
              Basic notification
            </div>
            <div className="text-xs" style={{ color: 'var(--panel-text-muted)' }}>
              Notify you that the flow has been triggered
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium" style={{ color: 'var(--panel-text)' }}>
              To <span className="text-red-500">*</span>
            </Label>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Input
            type="email"
            value={data.recipient || 'ibishalgt@gmail.com'}
            onChange={(e) => onUpdate({ recipient: e.target.value })}
            className="property-field"
            placeholder="Enter email address"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium" style={{ color: 'var(--panel-text)' }}>
              Subject <span className="text-red-500">*</span>
            </Label>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Input
            type="text"
            value={data.subject || 'sUSDe negative switch'}
            onChange={(e) => onUpdate({ subject: e.target.value })}
            className="property-field"
            placeholder="Enter subject"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium" style={{ color: 'var(--panel-text)' }}>
              Body <span className="text-red-500">*</span>
            </Label>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Textarea
            value={data.message || "The sUSDe is now negative. You're losing money by holding it."}
            onChange={(e) => onUpdate({ message: e.target.value })}
            className="property-field"
            placeholder="Enter message body"
            rows={4}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.action && (
        <div>
          <Label className="text-sm font-medium" style={{ color: 'var(--panel-text)' }}>
            Action Type
          </Label>
          <Select value={data.action} onValueChange={(value) => onUpdate({ action: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="supply">Supply Assets</SelectItem>
              <SelectItem value="withdraw">Withdraw Assets</SelectItem>
              <SelectItem value="borrow">Borrow Assets</SelectItem>
              <SelectItem value="repay">Repay Debt</SelectItem>
              <SelectItem value="swap">Swap Tokens</SelectItem>
              <SelectItem value="permissions">Set Permissions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {(data.action === 'supply' || data.action === 'withdraw' || data.action === 'borrow' || data.action === 'repay') && (
        <>
          <div>
            <Label className="text-sm font-medium" style={{ color: 'var(--panel-text)' }}>
              Vault
            </Label>
            <Select value={data.vaultAddress} onValueChange={(value) => onUpdate({ vaultAddress: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select vault" />
              </SelectTrigger>
              <SelectContent>
                {vaultOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium" style={{ color: 'var(--panel-text)' }}>
              Amount
            </Label>
            <Input
              type="text"
              value={data.amount || ''}
              onChange={(e) => onUpdate({ amount: e.target.value })}
              className="mt-1 property-field"
              placeholder="Enter amount"
            />
          </div>
        </>
      )}

      {data.action === 'swap' && (
        <>
          <div>
            <Label className="text-sm font-medium" style={{ color: 'var(--panel-text)' }}>
              From Token
            </Label>
            <Select value={data.tokenIn} onValueChange={(value) => onUpdate({ tokenIn: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select input token" />
              </SelectTrigger>
              <SelectContent>
                {vaultOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium" style={{ color: 'var(--panel-text)' }}>
              To Token
            </Label>
            <Select value={data.tokenOut} onValueChange={(value) => onUpdate({ tokenOut: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select output token" />
              </SelectTrigger>
              <SelectContent>
                {vaultOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium" style={{ color: 'var(--panel-text)' }}>
              Amount
            </Label>
            <Input
              type="text"
              value={data.amount || ''}
              onChange={(e) => onUpdate({ amount: e.target.value })}
              className="mt-1 property-field"
              placeholder="Enter amount to swap"
            />
          </div>
        </>
      )}
    </div>
  );
};