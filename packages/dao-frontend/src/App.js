import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { mainnet, sepolia, localhost } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { InjectedConnector } from 'wagmi/connectors/injected';
import './App.css';

// Import components
import Navigation from './components/Navigation';
import { Web3Provider } from './contexts/Web3Context';

// Import full Dashboard component
import Dashboard from './pages/Dashboard';
// Import Governance component
import Governance from './pages/Governance';
// Import Proposals component
import Proposals from './pages/Proposals';
// Import Treasury component
import Treasury from './pages/Treasury';
// Import Reputation component
import Reputation from './pages/Reputation';

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia, localhost],
  [publicProvider()]
);

// Set up wagmi config
const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new InjectedConnector({ chains })
  ],
  publicClient,
  webSocketPublicClient,
});

// Simple placeholder components for testing
const NotFound = () => <div className="page-container"><h1>404 - Not Found</h1><p>The page you're looking for doesn't exist.</p></div>;

function App() {
  return (
    <div className="app">
      <WagmiConfig config={config}>
        <Web3Provider>
          <Router>
            <Navigation />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/governance" element={<Governance />} />
                <Route path="/proposals" element={<Proposals />} />
                <Route path="/treasury" element={<Treasury />} />
                <Route path="/reputation" element={<Reputation />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <footer className="footer">
              <div className="footer-content">
                <p>DAO Project &copy; {new Date().getFullYear()}</p>
              </div>
            </footer>
          </Router>
        </Web3Provider>
      </WagmiConfig>
    </div>
  );
}

export default App; 