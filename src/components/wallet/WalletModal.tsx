import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Wallet, X } from 'lucide-react';
import { useConnect } from 'wagmi';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connect, connectors, isPending } = useConnect();

  const handleConnectWallet = (connector: any) => {
    connect({ connector });
    onClose();
  };

  const getWalletIcon = (connectorId: string) => {
    switch (connectorId) {
      case 'metaMask':
        return '🦊';
      case 'coinbaseWallet':
        return '🔵';
      case 'walletConnect':
        return '🔗';
      default:
        return '💼';
    }
  };

  const getWalletName = (connector: any) => {
    switch (connector.id) {
      case 'metaMask':
        return 'MetaMask';
      case 'coinbaseWallet':
        return 'Coinbase Wallet';
      case 'walletConnect':
        return 'WalletConnect';
      default:
        return connector.name;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            Choose a wallet to connect to EulerFlow
          </p>
          
          {connectors.map((connector) => (
            <Button
              key={connector.id}
              variant="outline"
              className="w-full justify-start h-12"
              onClick={() => handleConnectWallet(connector)}
              disabled={isPending}
            >
              <span className="text-2xl mr-3">
                {getWalletIcon(connector.id)}
              </span>
              <span className="font-medium">
                {getWalletName(connector)}
              </span>
              {connector.id === 'metaMask' && (
                <span className="ml-auto text-xs text-muted-foreground">
                  Recommended
                </span>
              )}
            </Button>
          ))}
          
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 <strong>Devland Setup:</strong> Make sure your devland is running on localhost:8545 
              and add the network to your wallet if needed.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};