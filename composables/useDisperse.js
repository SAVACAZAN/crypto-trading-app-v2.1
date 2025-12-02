/**
 * Composable for interacting with Disperse.app smart contract
 * Allows batch transfers of ETH to multiple addresses in a single transaction
 *
 * Contract: https://disperse.app/
 * Universal Address: 0xD152f549545093347A162Dce210e7293f1452150
 */

import { ref } from 'vue';
import { ethers } from 'ethers';

export function useDisperse() {
  // Disperse.app contract address (same on all networks)
  const DISPERSE_CONTRACT = '0xD152f549545093347A162Dce210e7293f1452150';

  // Simplified ABI for Disperse contract
  const DISPERSE_ABI = [
    'function disperseEther(address[] recipients, uint256[] values) payable',
    'function disperseToken(address token, address[] recipients, uint256[] values)',
    'function disperseTokenSimple(address token, address[] recipients, uint256[] values)'
  ];

  const processing = ref(false);
  const estimatedGas = ref(null);

  /**
   * Parse CSV or text list into recipients array
   * Supports formats:
   * - address,amount
   * - address=amount
   * - address amount
   */
  function parseRecipientsList(text) {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const recipients = [];
    const amounts = [];
    const errors = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Skip empty lines or comments
      if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
        return;
      }

      // Support multiple separators: comma, equals, space/tab
      const parts = trimmedLine.split(/[,=\s\t]+/).filter(p => p.trim());

      if (parts.length < 2) {
        errors.push({
          line: index + 1,
          text: trimmedLine,
          error: 'Invalid format. Expected: address,amount or address=amount'
        });
        return;
      }

      const address = parts[0].trim();
      const amount = parts[1].trim();

      // Validate address
      if (!ethers.isAddress(address)) {
        errors.push({
          line: index + 1,
          text: trimmedLine,
          error: `Invalid Ethereum address: ${address}`
        });
        return;
      }

      // Validate amount
      try {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          throw new Error('Amount must be a positive number');
        }

        recipients.push(address);
        amounts.push(ethers.parseEther(amount.toString()));
      } catch (error) {
        errors.push({
          line: index + 1,
          text: trimmedLine,
          error: `Invalid amount: ${amount} - ${error.message}`
        });
      }
    });

    return {
      recipients,
      amounts,
      errors,
      isValid: errors.length === 0 && recipients.length > 0
    };
  }

  /**
   * Calculate total amount needed
   */
  function calculateTotal(amounts) {
    return amounts.reduce((sum, amount) => sum + amount, 0n);
  }

  /**
   * Estimate gas for batch transfer
   */
  async function estimateGas(provider, recipients, amounts) {
    try {
      const disperseContract = new ethers.Contract(
        DISPERSE_CONTRACT,
        DISPERSE_ABI,
        provider
      );

      const totalAmount = calculateTotal(amounts);

      const gasEstimate = await disperseContract.disperseEther.estimateGas(
        recipients,
        amounts,
        { value: totalAmount }
      );

      // Add 20% buffer for safety
      const gasWithBuffer = (gasEstimate * 120n) / 100n;

      estimatedGas.value = gasWithBuffer;
      return gasWithBuffer;
    } catch (error) {
      console.error('[Disperse] Gas estimation error:', error);
      throw new Error('Failed to estimate gas: ' + error.message);
    }
  }

  /**
   * Execute batch transfer
   */
  async function disperseEther(signer, recipients, amounts) {
    if (!signer) {
      throw new Error('Signer not available. Please connect wallet.');
    }

    if (recipients.length === 0 || amounts.length === 0) {
      throw new Error('No recipients or amounts provided');
    }

    if (recipients.length !== amounts.length) {
      throw new Error('Recipients and amounts arrays must have same length');
    }

    processing.value = true;

    try {
      const disperseContract = new ethers.Contract(
        DISPERSE_CONTRACT,
        DISPERSE_ABI,
        signer
      );

      const totalAmount = calculateTotal(amounts);

      console.log('[Disperse] Sending to', recipients.length, 'addresses');
      console.log('[Disperse] Total amount:', ethers.formatEther(totalAmount), 'ETH');

      // Execute the disperse transaction
      const tx = await disperseContract.disperseEther(recipients, amounts, {
        value: totalAmount,
        gasLimit: estimatedGas.value || undefined
      });

      console.log('[Disperse] Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();

      console.log('[Disperse] Transaction confirmed in block:', receipt.blockNumber);

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        recipients: recipients.length,
        totalAmount: ethers.formatEther(totalAmount)
      };
    } catch (error) {
      console.error('[Disperse] Transaction error:', error);

      // Parse error message for user-friendly display
      let errorMessage = error.message;
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient balance to complete the transfer';
      } else if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user';
      }

      throw new Error(errorMessage);
    } finally {
      processing.value = false;
    }
  }

  /**
   * Validate transfer before execution
   */
  async function validateTransfer(provider, userAddress, recipients, amounts) {
    const errors = [];

    // Check if Disperse contract exists
    try {
      const code = await provider.getCode(DISPERSE_CONTRACT);
      if (code === '0x') {
        errors.push('Disperse contract not deployed on this network');
      }
    } catch (error) {
      errors.push('Failed to check contract: ' + error.message);
    }

    // Check user balance
    try {
      const balance = await provider.getBalance(userAddress);
      const totalAmount = calculateTotal(amounts);

      if (balance < totalAmount) {
        errors.push(
          `Insufficient balance. Need: ${ethers.formatEther(totalAmount)} ETH, Have: ${ethers.formatEther(balance)} ETH`
        );
      }
    } catch (error) {
      errors.push('Failed to check balance: ' + error.message);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate CSV template
   */
  function generateTemplate() {
    return `# Batch Transfer Template
# Format: address,amount (in ETH)
# Example:
# 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb,0.1
# 0xdD2FD4581271e230360230F9337D5c0430Bf44C0,0.05

# Add your recipients below:
`;
  }

  return {
    // State
    processing,
    estimatedGas,

    // Constants
    DISPERSE_CONTRACT,

    // Methods
    parseRecipientsList,
    calculateTotal,
    estimateGas,
    disperseEther,
    validateTransfer,
    generateTemplate,
  };
}
