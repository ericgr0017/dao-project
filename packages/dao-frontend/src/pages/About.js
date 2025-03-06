import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';

const About = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('what-is-dao');

  const scrollToSection = (sectionId) => {
    setActiveTab(sectionId);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="about-container">
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>Understanding Humanity DAO</h1>
          <p>Your guide to decentralized governance for global challenges</p>
        </div>
      </section>

      <div className="about-content">
        <nav className="about-nav">
          <ul>
            <li><a href="#what-is-dao" className={activeTab === 'what-is-dao' ? 'active' : ''} onClick={() => scrollToSection('what-is-dao')}>What is a DAO?</a></li>
            <li><a href="#why-humanity-dao" className={activeTab === 'why-humanity-dao' ? 'active' : ''} onClick={() => scrollToSection('why-humanity-dao')}>Why Humanity DAO?</a></li>
            <li><a href="#how-it-works" className={activeTab === 'how-it-works' ? 'active' : ''} onClick={() => scrollToSection('how-it-works')}>How It Works</a></li>
            <li><a href="#who-should-join" className={activeTab === 'who-should-join' ? 'active' : ''} onClick={() => scrollToSection('who-should-join')}>Who Should Join?</a></li>
            <li><a href="#getting-started" className={activeTab === 'getting-started' ? 'active' : ''} onClick={() => scrollToSection('getting-started')}>Getting Started</a></li>
            <li><a href="#no-wallet" className={activeTab === 'no-wallet' ? 'active' : ''} onClick={() => scrollToSection('no-wallet')}>No Digital Wallet?</a></li>
            <li><a href="#faq" className={activeTab === 'faq' ? 'active' : ''} onClick={() => scrollToSection('faq')}>FAQ</a></li>
          </ul>
        </nav>

        <div className="about-sections">
          <section id="what-is-dao" className="about-section">
            <h2>What is a DAO?</h2>
            <div className="section-content">
              <div className="text-content">
                <p>
                  A <strong>Decentralized Autonomous Organization (DAO)</strong> is a community-led entity with no central authority. 
                  It's fully autonomous and transparent, governed by its members who collectively make decisions.
                </p>
                <p>
                  Unlike traditional organizations with hierarchical management, DAOs operate using smart contracts—
                  self-executing code that automatically implements decisions when predetermined conditions are met.
                </p>
                <p>
                  Think of a DAO as a digital community with a shared bank account and rulebook, where everyone has a say in how resources are used.
                </p>
              </div>
              <div className="info-box">
                <h3>Key DAO Characteristics</h3>
                <ul>
                  <li><strong>Decentralized:</strong> No single point of control</li>
                  <li><strong>Transparent:</strong> All actions and funds are visible on the blockchain</li>
                  <li><strong>Democratic:</strong> Members vote on decisions</li>
                  <li><strong>Autonomous:</strong> Operates via code, not human managers</li>
                  <li><strong>Global:</strong> Anyone can participate from anywhere</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="why-humanity-dao" className="about-section">
            <h2>Why Humanity DAO?</h2>
            <div className="section-content">
              <div className="text-content">
                <p>
                  <strong>Humanity DAO</strong> was created to address the most pressing challenges facing our species. 
                  Traditional institutions often struggle with bureaucracy, short-term thinking, and misaligned incentives.
                </p>
                <p>
                  We believe that by harnessing collective intelligence and resources through decentralized governance, 
                  we can develop more effective, transparent, and innovative solutions to global problems.
                </p>
                <p>
                  Our mission is to create a platform where anyone can contribute to humanity's future, regardless of 
                  their background, nationality, or social status. We're building a community that transcends traditional 
                  boundaries to focus on what matters most: ensuring a thriving future for all.
                </p>
              </div>
              <div className="info-box highlight">
                <h3>Our Purpose</h3>
                <p>
                  To mobilize global resources and intelligence toward solving humanity's greatest challenges through 
                  transparent, democratic, and effective decentralized governance.
                </p>
              </div>
            </div>
          </section>

          <section id="how-it-works" className="about-section">
            <h2>How It Works</h2>
            <div className="section-content">
              <div className="process-steps">
                <div className="process-step">
                  <div className="step-number">1</div>
                  <h3>Join the Community</h3>
                  <p>Connect your digital wallet to become a member of Humanity DAO. New members receive a small amount of governance tokens to get started.</p>
                </div>
                <div className="process-step">
                  <div className="step-number">2</div>
                  <h3>Explore Challenges</h3>
                  <p>Browse our categorized global challenges to understand the problems we're working to solve.</p>
                </div>
                <div className="process-step">
                  <div className="step-number">3</div>
                  <h3>Review Proposals</h3>
                  <p>Examine existing proposals that address these challenges, including their goals, requested funding, and community support.</p>
                </div>
                <div className="process-step">
                  <div className="step-number">4</div>
                  <h3>Vote on Initiatives</h3>
                  <p>Use your governance tokens to vote on proposals you believe will make the most impact.</p>
                </div>
                <div className="process-step">
                  <div className="step-number">5</div>
                  <h3>Create Proposals</h3>
                  <p>Submit your own proposals to address challenges with innovative solutions.</p>
                </div>
                <div className="process-step">
                  <div className="step-number">6</div>
                  <h3>Earn Reputation</h3>
                  <p>Contribute meaningfully to the community to earn reputation and additional governance tokens.</p>
                </div>
              </div>

              <div className="info-box">
                <h3>Governance Model</h3>
                <p>Humanity DAO uses a token-weighted voting system with these key features:</p>
                <ul>
                  <li><strong>Proposal Threshold:</strong> Members need a minimum number of tokens to submit proposals</li>
                  <li><strong>Voting Period:</strong> All proposals have a 7-day voting window</li>
                  <li><strong>Execution:</strong> Approved proposals are automatically funded and tracked</li>
                  <li><strong>Transparency:</strong> All votes and fund movements are recorded on the blockchain</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="who-should-join" className="about-section">
            <h2>Who Should Join?</h2>
            <div className="section-content">
              <div className="persona-grid">
                <div className="persona">
                  <div className="persona-icon">🧠</div>
                  <h3>Problem Solvers</h3>
                  <p>Individuals with innovative ideas and solutions to global challenges</p>
                </div>
                <div className="persona">
                  <div className="persona-icon">💰</div>
                  <h3>Contributors</h3>
                  <p>Those who want to direct resources toward impactful projects</p>
                </div>
                <div className="persona">
                  <div className="persona-icon">🔍</div>
                  <h3>Researchers</h3>
                  <p>Experts who can help evaluate and improve proposals</p>
                </div>
                <div className="persona">
                  <div className="persona-icon">🌍</div>
                  <h3>Global Citizens</h3>
                  <p>Anyone concerned about humanity's future and eager to help</p>
                </div>
                <div className="persona">
                  <div className="persona-icon">🛠️</div>
                  <h3>Builders</h3>
                  <p>Developers, designers, and creators who can implement solutions</p>
                </div>
                <div className="persona">
                  <div className="persona-icon">📢</div>
                  <h3>Advocates</h3>
                  <p>Those who can amplify important initiatives and bring in more participants</p>
                </div>
              </div>

              <div className="text-content">
                <p>
                  Humanity DAO is for everyone who believes in the power of collective action to solve big problems. 
                  You don't need to be an expert in blockchain or have technical skills—just a passion for making 
                  a positive impact and a willingness to participate in a new form of global cooperation.
                </p>
                <p>
                  <strong>Don't have a digital wallet?</strong> No problem! You can still explore proposals, 
                  learn about challenges, and engage with our community. See the <a href="#no-wallet" onClick={(e) => {e.preventDefault(); scrollToSection('no-wallet');}}>No Digital Wallet?</a> section below.
                </p>
              </div>
            </div>
          </section>

          <section id="getting-started" className="about-section">
            <h2>Getting Started</h2>
            <div className="section-content">
              <div className="getting-started-steps">
                <div className="gs-step">
                  <h3>Step 1: Set Up a Digital Wallet</h3>
                  <p>
                    If you don't already have one, you'll need to set up a digital wallet. We recommend MetaMask, 
                    which is free and easy to use.
                  </p>
                  <div className="step-instructions">
                    <ol>
                      <li>Visit <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">metamask.io</a> and install the browser extension</li>
                      <li>Follow the setup instructions to create a new wallet</li>
                      <li>Securely store your recovery phrase (never share this with anyone!)</li>
                      <li>Once installed, you'll see the MetaMask fox icon in your browser</li>
                    </ol>
                  </div>
                </div>

                <div className="gs-step">
                  <h3>Step 2: Connect Your Wallet to Humanity DAO</h3>
                  <p>
                    Once you have a wallet set up, you can connect it to our platform.
                  </p>
                  <div className="step-instructions">
                    <ol>
                      <li>Click the "Connect Wallet" button in the top right corner of our site</li>
                      <li>Select MetaMask (or your chosen wallet) from the options</li>
                      <li>Approve the connection request in your wallet</li>
                      <li>You're now connected and can participate in the DAO!</li>
                    </ol>
                  </div>
                </div>

                <div className="gs-step">
                  <h3>Step 3: Get Familiar with the Platform</h3>
                  <p>
                    Take some time to explore the different sections of Humanity DAO.
                  </p>
                  <div className="step-instructions">
                    <ul>
                      <li>Visit the <strong>Dashboard</strong> to see an overview of DAO activities</li>
                      <li>Explore the <strong>Challenges</strong> section to understand the problems we're addressing</li>
                      <li>Review active <strong>Proposals</strong> to see what solutions are being considered</li>
                      <li>Check out the <strong>Governance</strong> page to learn how decisions are made</li>
                    </ul>
                  </div>
                </div>

                <div className="gs-step">
                  <h3>Step 4: Participate!</h3>
                  <p>
                    There are many ways to get involved, even if you're new to DAOs.
                  </p>
                  <div className="step-instructions">
                    <ul>
                      <li>Vote on proposals that align with your values</li>
                      <li>Join discussions about active proposals</li>
                      <li>Share your expertise by commenting on proposals in your area of knowledge</li>
                      <li>When you're ready, create your own proposal to address a challenge</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="cta-box">
                <h3>Ready to Make a Difference?</h3>
                <p>Join thousands of others working together to solve humanity's greatest challenges.</p>
                <button className="primary-button" onClick={() => navigate('/dashboard')}>
                  Get Started Now
                </button>
              </div>
            </div>
          </section>

          <section id="no-wallet" className="about-section">
            <h2>No Digital Wallet? Here's How You Can Still Participate</h2>
            <div className="section-content">
              <div className="text-content">
                <p>
                  While full participation in Humanity DAO requires a digital wallet, we believe everyone should be able to 
                  contribute to solving humanity's challenges. Here are ways you can engage without a wallet:
                </p>
              </div>
              
              <div className="participation-options">
                <div className="participation-option">
                  <div className="option-icon">👀</div>
                  <h3>Explore & Learn</h3>
                  <p>
                    Browse all proposals, challenges, and educational content without connecting a wallet. 
                    Get familiar with the platform and the issues we're addressing.
                  </p>
                </div>
                
                <div className="participation-option">
                  <div className="option-icon">💬</div>
                  <h3>Join Our Community</h3>
                  <p>
                    Participate in our Discord and forum discussions where you can share ideas, 
                    provide feedback on proposals, and connect with like-minded individuals.
                  </p>
                  <a href="https://discord.gg/humanitydao" target="_blank" rel="noopener noreferrer" className="option-link">Join Discord</a>
                </div>
                
                <div className="participation-option">
                  <div className="option-icon">🤝</div>
                  <h3>Contribute Skills</h3>
                  <p>
                    Offer your expertise, skills, or time to help implement approved proposals. 
                    Many projects need non-technical contributions like research, design, or outreach.
                  </p>
                </div>
                
                <div className="participation-option">
                  <div className="option-icon">📝</div>
                  <h3>Submit Ideas</h3>
                  <p>
                    Share your proposal ideas through our public submission form. If approved by the community, 
                    a DAO member can formally submit it on your behalf.
                  </p>
                  <button className="option-button" onClick={() => window.open('https://forms.humanitydao.org/proposal-idea', '_blank')}>
                    Submit an Idea
                  </button>
                </div>
              </div>
              
              <div className="wallet-assistance">
                <h3>Need Help Setting Up a Wallet?</h3>
                <p>
                  We understand that blockchain technology can be intimidating at first. We offer:
                </p>
                <ul>
                  <li><strong>Guided Workshops:</strong> Regular online sessions to help newcomers set up wallets</li>
                  <li><strong>One-on-One Support:</strong> Schedule a call with a community member for personalized assistance</li>
                  <li><strong>Beginner-Friendly Guides:</strong> Step-by-step tutorials designed for non-technical users</li>
                </ul>
                <button className="secondary-button wallet-help-btn" onClick={() => navigate('/resources')}>
                  Access Wallet Resources
                </button>
              </div>
            </div>
          </section>

          <section id="faq" className="about-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              <div className="faq-item">
                <h3>Do I need to know about blockchain to participate?</h3>
                <p>
                  No, we've designed Humanity DAO to be accessible to everyone. While understanding blockchain 
                  can be helpful, our interface is user-friendly and doesn't require technical knowledge.
                </p>
              </div>
              <div className="faq-item">
                <h3>Is there a cost to join?</h3>
                <p>
                  There's no membership fee, but you will need a small amount of cryptocurrency (ETH) to pay for 
                  transaction fees when voting or creating proposals. New members receive a small allocation of 
                  governance tokens to get started.
                </p>
              </div>
              <div className="faq-item">
                <h3>How are funds managed and distributed?</h3>
                <p>
                  All funds are held in a transparent treasury controlled by smart contracts. Funds can only be 
                  distributed when a proposal passes the required voting threshold. Every transaction is recorded 
                  on the blockchain and visible to all members.
                </p>
              </div>
              <div className="faq-item">
                <h3>How do I earn more governance tokens?</h3>
                <p>
                  You can earn additional governance tokens by contributing meaningfully to the DAO. This includes 
                  creating successful proposals, participating in governance, and helping implement approved projects.
                </p>
              </div>
              <div className="faq-item">
                <h3>What if I don't have technical skills to offer?</h3>
                <p>
                  Humanity DAO needs all kinds of skills and perspectives! You can contribute through research, 
                  communication, community building, proposal evaluation, and many other non-technical ways.
                </p>
              </div>
              <div className="faq-item">
                <h3>Can I participate without a digital wallet?</h3>
                <p>
                  Yes! While a wallet is required for voting and creating proposals, you can still explore the platform, 
                  join community discussions, contribute skills to projects, and submit ideas through our public channels. 
                  See our <a href="#no-wallet" onClick={(e) => {e.preventDefault(); scrollToSection('no-wallet');}}>No Digital Wallet?</a> section for details.
                </p>
              </div>
              <div className="faq-item">
                <h3>Is my personal information secure?</h3>
                <p>
                  We prioritize privacy and security. Your wallet address is visible on the blockchain, but you 
                  control how much personal information you share with the community. We never ask for or store 
                  your private keys or recovery phrases.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About; 