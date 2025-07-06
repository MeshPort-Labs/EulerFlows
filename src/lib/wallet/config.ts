import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { metaMask, injected, coinbaseWallet } from 'wagmi/connectors';

export const devlandChain = {
  id: 31337,
  name: 'Devland',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
  blockExplorers: {
    default: { name: 'Local', url: 'http://localhost:8545' },
  },
  testnet: true,
} as const;

const connectors = [
  metaMask({
    dappMetadata: {
      name: 'EulerFlow',
      url: 'http://localhost:5173',
    },
  }),
  
  injected({
    target: 'metaMask',
  }),
  
  coinbaseWallet({
    appName: 'EulerFlow',
    appLogoUrl: 'https://example.com/logo.png',
  }),
];

export const wagmiConfig = createConfig({
  chains: [devlandChain, mainnet],
  connectors,
  transports: {
    [devlandChain.id]: http('http://127.0.0.1:8545'),
    [mainnet.id]: http(),
  },
});