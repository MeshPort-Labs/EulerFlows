import { useState } from 'react';

export const useWallet = () => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const wallet = {
    isConnected: false,
    address: null,
    chainId: null,
    isCorrectChain: false,
  };

  const connectWallet = () => {
    setIsWalletModalOpen(true);
  };

  const disconnectWallet = () => {
    console.log('Disconnecting wallet');
  };

  const switchToDevland = () => {
    console.log('Switching to devland');
  };

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    switchToDevland,
    isWalletModalOpen,
    setIsWalletModalOpen,
    connectors: [],
    isPending: false,
  };
};