/**
 * MetaMask SDK Composable for Nuxt 3
 *
 * Provides a clean interface to use MetaMask SDK in Nuxt/Vue pages
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { ethers } from 'ethers';

export function useMetaMaskSDK() {
  const sdkInstance = ref(null);
  const provider = ref(null);
  const connectedAddress = ref('');
  const chainId = ref(null);
  const isConnected = ref(false);
  const isSDKReady = ref(false);

  // Initialize MetaMask SDK
  async function initializeSDK() {
    if (process.client && !sdkInstance.value) {
      try {
        const { MetaMaskSDK } = await import('@metamask/sdk');

        sdkInstance.value = new MetaMaskSDK({
          dappMetadata: {
            name: 'Crypto Trading Platform',
            url: typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000',
          },
          injectProvider: true,
          checkInstallationImmediately: false,
          storage: {
            enabled: true,
          },
        });

        const ethereum = sdkInstance.value.getProvider();

        if (ethereum) {
          provider.value = ethereum;
          isSDKReady.value = true;

          console.log('[MetaMask SDK] Initialized successfully');

          // Setup event listeners
          ethereum.on('accountsChanged', handleAccountsChanged);
          ethereum.on('chainChanged', handleChainChanged);
          ethereum.on('disconnect', handleDisconnect);
        }
      } catch (error) {
        console.error('[MetaMask SDK] Initialization error:', error);
      }
    }
  }

  // Connect to MetaMask
  async function connect() {
    if (!provider.value) {
      console.error('[MetaMask SDK] Provider not ready');
      return null;
    }

    try {
      const accounts = await provider.value.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        connectedAddress.value = accounts[0];
        isConnected.value = true;

        // Get chain ID
        const chain = await provider.value.request({
          method: 'eth_chainId',
        });
        chainId.value = parseInt(chain, 16);

        console.log('[MetaMask SDK] Connected:', connectedAddress.value);
        return connectedAddress.value;
      }
    } catch (error) {
      console.error('[MetaMask SDK] Connection error:', error);
      throw error;
    }
  }

  // Disconnect
  function disconnect() {
    connectedAddress.value = '';
    isConnected.value = false;
    chainId.value = null;
    console.log('[MetaMask SDK] Disconnected');
  }

  // Switch chain
  async function switchChain(targetChainId, chainConfig) {
    if (!provider.value) return false;

    try {
      const hexChainId = typeof targetChainId === 'string'
        ? targetChainId
        : `0x${targetChainId.toString(16)}`;

      await provider.value.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });

      return true;
    } catch (switchError) {
      // Chain not added, try to add it
      if (switchError.code === 4902 && chainConfig) {
        try {
          await provider.value.request({
            method: 'wallet_addEthereumChain',
            params: [chainConfig],
          });
          return true;
        } catch (addError) {
          console.error('[MetaMask SDK] Error adding chain:', addError);
          return false;
        }
      }

      console.error('[MetaMask SDK] Error switching chain:', switchError);
      return false;
    }
  }

  // Send transaction
  async function sendTransaction(txParams) {
    if (!provider.value || !isConnected.value) {
      throw new Error('Not connected');
    }

    try {
      const txHash = await provider.value.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      return txHash;
    } catch (error) {
      console.error('[MetaMask SDK] Transaction error:', error);
      throw error;
    }
  }

  // Sign message
  async function signMessage(message) {
    if (!provider.value || !isConnected.value) {
      throw new Error('Not connected');
    }

    try {
      const signature = await provider.value.request({
        method: 'personal_sign',
        params: [message, connectedAddress.value],
      });

      return signature;
    } catch (error) {
      console.error('[MetaMask SDK] Signing error:', error);
      throw error;
    }
  }

  // Get balance
  async function getBalance(address = null) {
    const targetAddress = address || connectedAddress.value;

    if (!provider.value || !targetAddress) {
      return '0';
    }

    try {
      const ethersProvider = new ethers.BrowserProvider(provider.value);
      const balance = await ethersProvider.getBalance(targetAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('[MetaMask SDK] Error getting balance:', error);
      return '0';
    }
  }

  // Event handlers
  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      disconnect();
    } else {
      connectedAddress.value = accounts[0];
      console.log('[MetaMask SDK] Account changed:', accounts[0]);
    }
  }

  function handleChainChanged(newChainId) {
    chainId.value = parseInt(newChainId, 16);
    console.log('[MetaMask SDK] Chain changed:', chainId.value);
    // Reload recommended by MetaMask
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  function handleDisconnect() {
    disconnect();
    console.log('[MetaMask SDK] Provider disconnected');
  }

  // Cleanup
  function cleanup() {
    if (provider.value) {
      provider.value.removeListener('accountsChanged', handleAccountsChanged);
      provider.value.removeListener('chainChanged', handleChainChanged);
      provider.value.removeListener('disconnect', handleDisconnect);
    }

    if (sdkInstance.value) {
      // Cleanup SDK if needed
      sdkInstance.value.terminate?.();
    }
  }

  // Auto-initialize on mount (client-side only)
  if (process.client) {
    initializeSDK();
  }

  return {
    // State
    provider,
    connectedAddress,
    chainId,
    isConnected,
    isSDKReady,

    // Methods
    connect,
    disconnect,
    switchChain,
    sendTransaction,
    signMessage,
    getBalance,
    cleanup,
  };
}
