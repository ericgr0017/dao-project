import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';

const WalletConnect = () => {
  const { 
    address, 
    balance, 
    connectWallet, 
    disconnectWallet, 
    isConnecting, 
    error,
    chain
  } = useWeb3();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(false);

  useEffect(() => {
    // Check if MetaMask is installed
    setHasMetaMask(window.ethereum && window.ethereum.isMetaMask);
  }, []);

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatBalance = (bal) => {
    if (!bal) return '0.00';
    // Convert from wei to ETH and format to 4 decimal places
    return (Number(bal) / 1e18).toFixed(4);
  };

  const getNetworkName = () => {
    if (!chain) return 'Unknown Network';
    
    switch (chain.id) {
      case 1:
        return 'Ethereum Mainnet';
      case 11155111:
        return 'Sepolia Testnet';
      case 1337:
        return 'Local Network';
      default:
        return `Chain ID: ${chain.id}`;
    }
  };

  return (
    <div className="wallet-connect">
      {error && <div className="wallet-error">{error}</div>}
      
      {!address ? (
        <button 
          className={`connect-button ${hasMetaMask ? 'metamask-button' : ''}`}
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : hasMetaMask ? 'Connect MetaMask' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="wallet-info">
          <div className="wallet-address" onClick={toggleDropdown}>
            <span className="network-badge">{getNetworkName()}</span>
            <span className="address">{formatAddress(address)}</span>
            <span className="balance">{formatBalance(balance)} ETH</span>
            <span className="dropdown-icon">▼</span>
          </div>
          
          {showDropdown && (
            <div className="wallet-dropdown">
              <div className="dropdown-item full-address">
                <span className="label">Address:</span>
                <span className="value">{address}</span>
              </div>
              <div className="dropdown-item">
                <span className="label">Balance:</span>
                <span className="value">{formatBalance(balance)} ETH</span>
              </div>
              <button 
                className="disconnect-button" 
                onClick={handleDisconnect}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 