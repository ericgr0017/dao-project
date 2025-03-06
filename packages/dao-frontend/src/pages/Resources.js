import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Resources.css';

const Resources = () => {
  const navigate = useNavigate();

  // Function to handle resource link clicks
  const handleResourceClick = (resourceName) => {
    console.log(`Resource clicked: ${resourceName}`);
    // In a real app, this would navigate to the actual resource
    // For now, we'll just log the action
  };

  return (
    <div className="resources-container">
      <section className="resources-hero">
        <div className="resources-hero-content">
          <h1>Resources & Guides</h1>
          <p>Everything you need to get started with Humanity DAO</p>
        </div>
      </section>

      <div className="resources-content">
        <div className="resources-section">
          <h2>Digital Wallet Setup Guides</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <div className="resource-icon">🦊</div>
              <h3>MetaMask Setup Guide</h3>
              <p>Learn how to set up the most popular Ethereum wallet in less than 10 minutes.</p>
              <div className="resource-difficulty beginner">Beginner Friendly</div>
              <button 
                onClick={() => handleResourceClick('MetaMask Setup Guide')} 
                className="resource-link"
              >
                View Guide
              </button>
            </div>
            
            <div className="resource-card">
              <div className="resource-icon">📱</div>
              <h3>Mobile Wallet Guide</h3>
              <p>Set up a wallet on your smartphone for on-the-go access to the DAO.</p>
              <div className="resource-difficulty beginner">Beginner Friendly</div>
              <button 
                onClick={() => handleResourceClick('Mobile Wallet Guide')} 
                className="resource-link"
              >
                View Guide
              </button>
            </div>
            
            <div className="resource-card">
              <div className="resource-icon">🔐</div>
              <h3>Wallet Security Best Practices</h3>
              <p>Essential tips to keep your digital assets safe and secure.</p>
              <div className="resource-difficulty intermediate">Intermediate</div>
              <button 
                onClick={() => handleResourceClick('Wallet Security Best Practices')} 
                className="resource-link"
              >
                View Guide
              </button>
            </div>
            
            <div className="resource-card">
              <div className="resource-icon">💸</div>
              <h3>Getting Your First ETH</h3>
              <p>A step-by-step guide to acquiring the cryptocurrency needed for transactions.</p>
              <div className="resource-difficulty beginner">Beginner Friendly</div>
              <button 
                onClick={() => handleResourceClick('Getting Your First ETH')} 
                className="resource-link"
              >
                View Guide
              </button>
            </div>
          </div>
        </div>

        <div className="resources-section">
          <h2>Video Tutorials</h2>
          <div className="video-resources">
            <div className="video-resource">
              <div className="video-thumbnail">
                <div className="play-icon">▶</div>
                <img src="/images/wallet-setup-thumbnail.jpg" alt="Wallet Setup Tutorial" />
              </div>
              <h3>Complete Wallet Setup Tutorial</h3>
              <p>A comprehensive video guide walking you through every step of setting up your first digital wallet.</p>
              <span className="video-duration">12:34</span>
            </div>
            
            <div className="video-resource">
              <div className="video-thumbnail">
                <div className="play-icon">▶</div>
                <img src="/images/dao-participation-thumbnail.jpg" alt="DAO Participation Tutorial" />
              </div>
              <h3>How to Participate in Humanity DAO</h3>
              <p>Learn how to vote on proposals, create your own initiatives, and earn reputation within the community.</p>
              <span className="video-duration">15:21</span>
            </div>
          </div>
        </div>

        <div className="resources-section">
          <h2>Upcoming Workshops</h2>
          <div className="workshops-list">
            <div className="workshop-item">
              <div className="workshop-date">
                <span className="month">JUN</span>
                <span className="day">15</span>
              </div>
              <div className="workshop-details">
                <h3>Beginner's Guide to Digital Wallets</h3>
                <p>A hands-on workshop where we'll help you set up your first wallet and answer all your questions.</p>
                <div className="workshop-meta">
                  <span className="workshop-time">2:00 PM - 3:30 PM UTC</span>
                  <span className="workshop-host">Hosted by: Sarah Chen</span>
                </div>
                <button className="workshop-register">Register Now</button>
              </div>
            </div>
            
            <div className="workshop-item">
              <div className="workshop-date">
                <span className="month">JUN</span>
                <span className="day">22</span>
              </div>
              <div className="workshop-details">
                <h3>Understanding DAO Governance</h3>
                <p>Learn how decentralized governance works and how you can effectively participate in decision-making.</p>
                <div className="workshop-meta">
                  <span className="workshop-time">6:00 PM - 7:30 PM UTC</span>
                  <span className="workshop-host">Hosted by: Miguel Rodriguez</span>
                </div>
                <button className="workshop-register">Register Now</button>
              </div>
            </div>
          </div>
        </div>

        <div className="resources-section">
          <h2>One-on-One Support</h2>
          <div className="support-box">
            <div className="support-content">
              <h3>Need personalized help?</h3>
              <p>
                Schedule a 30-minute call with one of our community volunteers who can guide you through 
                setting up your wallet, joining the DAO, or answering any questions you might have.
              </p>
              <button className="schedule-call-btn">Schedule a Call</button>
            </div>
            <div className="support-image">
              <img src="/images/support-illustration.svg" alt="Support Illustration" />
            </div>
          </div>
        </div>

        <div className="resources-section">
          <h2>Frequently Asked Questions</h2>
          <div className="resources-faq">
            <div className="faq-item">
              <h3>Is it safe to use a digital wallet?</h3>
              <p>
                Yes, when set up and used correctly, digital wallets are very secure. The key is to follow best practices 
                like never sharing your recovery phrase, using strong passwords, and being cautious of phishing attempts.
              </p>
            </div>
            
            <div className="faq-item">
              <h3>Do I need to be technical to use a wallet?</h3>
              <p>
                Not at all! Modern wallets like MetaMask are designed to be user-friendly. If you can use online banking 
                or shopping apps, you can use a digital wallet. Our guides are specifically designed for non-technical users.
              </p>
            </div>
            
            <div className="faq-item">
              <h3>How much does it cost to set up a wallet?</h3>
              <p>
                Setting up a wallet is completely free. You'll only need funds (ETH) when you want to perform actions 
                on the blockchain like voting or creating proposals. New members receive a small amount to get started.
              </p>
            </div>
            
            <div className="faq-item">
              <h3>What if I lose access to my wallet?</h3>
              <p>
                When you set up your wallet, you'll receive a recovery phrase (usually 12 or 24 words). As long as you 
                securely store this phrase, you can always regain access to your wallet, even if you lose your device.
              </p>
            </div>
          </div>
        </div>

        <div className="back-to-about">
          <button className="back-button" onClick={() => navigate('/about')}>
            ← Back to About Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resources; 