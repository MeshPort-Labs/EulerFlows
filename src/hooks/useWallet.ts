import { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';

export const useWallet = () => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isCorrectChain = chainId === 31337;

  const wallet = {
    isConnected,
    address,
    chainId,
    isCorrectChain,
  };

  const connectWallet = () => {
    const metaMaskConnector = connectors.find(
      (connector) => connector.id === 'metaMask'
    );
    
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    } else {
      setIsWalletModalOpen(true);
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const switchToDevland = () => {
    try {
      switchChain({ chainId: 31337 });
    } catch (error) {
      console.error('Failed to switch to Devland:', error);
    }
  };

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    switchToDevland,
    isWalletModalOpen,
    setIsWalletModalOpen,
    connectors,
    isPending,
  };
};