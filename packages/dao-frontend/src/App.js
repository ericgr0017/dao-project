import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ethers } from 'ethers';
import { WagmiConfig, createConfig } from 'wagmi';
import { ConnectKitProvider } from 'connectkit';

// Pages
import Home from './pages/Home';
import Proposals from './pages/Proposals';
import CreateProposal from './pages/CreateProposal';
import Treasury from './pages/Treasury';
import Profile from './pages/Profile';
import Projects from './pages/Projects';

// Context
import { Web3Provider } from './contexts/Web3Context';

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <ConnectKitProvider>
        <Web3Provider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/proposals" element={<Proposals />} />
              <Route path="/create-proposal" element={<CreateProposal />} />
              <Route path="/treasury" element={<Treasury />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/projects" element={<Projects />} />
            </Routes>
          </Router>
        </Web3Provider>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

export default App; 