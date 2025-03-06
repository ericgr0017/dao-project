import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import './Benefits.css';

const Benefits = () => {
  const navigate = useNavigate();
  const { isConnected } = useWeb3();

  // Benefits categories
  const benefitCategories = [
    {
      id: 'impact',
      title: 'Meaningful Impact',
      description: 'Make a real difference in addressing humanity\'s most pressing challenges.',
      icon: '🌍',
      benefits: [
        {
          title: 'Direct Funding of Solutions',
          description: 'Your participation helps fund innovative solutions to global challenges that traditional institutions often overlook or are too slow to address.'
        },
        {
          title: 'Collective Intelligence',
          description: 'By pooling resources and knowledge, we can tackle complex problems more effectively than any individual or organization could alone.'
        },
        {
          title: 'Transparent Outcomes',
          description: 'All funded projects provide regular updates and measurable impact metrics, so you can see exactly how your contribution is making a difference.'
        }
      ]
    },
    {
      id: 'governance',
      title: 'Democratic Governance',
      description: 'Have a real voice in decisions that shape our collective future.',
      icon: '🗣️',
      benefits: [
        {
          title: 'Equal Voting Rights',
          description: 'Every member has an equal say in governance decisions, regardless of their financial contribution.'
        },
        {
          title: 'Proposal Creation',
          description: 'Any member can propose new initiatives, bringing diverse perspectives and innovative ideas to the table.'
        },
        {
          title: 'Transparent Decision-Making',
          description: 'All votes and governance actions are recorded on the blockchain, ensuring complete transparency and accountability.'
        }
      ]
    },
    {
      id: 'financial',
      title: 'Financial Benefits',
      description: 'Receive rewards while contributing to meaningful causes.',
      icon: '💰',
      benefits: [
        {
          title: 'Reputation Rewards',
          description: 'Earn reputation tokens for active participation, which can be used for governance and provide access to exclusive benefits.'
        },
        {
          title: 'Potential Returns',
          description: 'Some funded projects may generate returns that are distributed back to DAO members, creating a sustainable funding model.'
        },
        {
          title: 'Network Effects',
          description: 'As the DAO grows, the value of your participation and reputation increases through network effects and expanded impact.'
        }
      ]
    },
    {
      id: 'community',
      title: 'Vibrant Community',
      description: 'Connect with like-minded individuals committed to positive change.',
      icon: '👥',
      benefits: [
        {
          title: 'Global Network',
          description: 'Join a diverse community of changemakers, experts, and enthusiasts from around the world, united by shared values and goals.'
        },
        {
          title: 'Knowledge Sharing',
          description: 'Access exclusive educational resources, workshops, and discussions on cutting-edge solutions to global challenges.'
        },
        {
          title: 'Collaboration Opportunities',
          description: 'Find partners for your own initiatives, whether they\'re funded through the DAO or pursued independently.'
        }
      ]
    },
    {
      id: 'personal',
      title: 'Personal Growth',
      description: 'Develop new skills and perspectives through active participation.',
      icon: '🌱',
      benefits: [
        {
          title: 'Web3 Literacy',
          description: 'Gain practical experience with blockchain technology, decentralized governance, and digital communities.'
        },
        {
          title: 'Systems Thinking',
          description: 'Develop a deeper understanding of complex global challenges and the interconnected systems that drive them.'
        },
        {
          title: 'Leadership Experience',
          description: 'Build leadership skills by creating proposals, advocating for solutions, and mobilizing community support.'
        }
      ]
    }
  ];

  return (
    <div className="benefits-container">
      <div className="benefits-hero">
        <div className="benefits-hero-content">
          <h1>Member Benefits</h1>
          <p>Discover how participating in Humanity DAO benefits you while helping to address global challenges</p>
          
          {!isConnected && (
            <button 
              className="connect-wallet-btn"
              onClick={() => navigate('/dashboard')}
            >
              Connect Wallet to Join
            </button>
          )}
        </div>
      </div>

      <div className="benefits-intro">
        <h2>Why Join Humanity DAO?</h2>
        <p>
          Humanity DAO is more than just a funding platform—it's a community of changemakers working together to 
          address the most pressing challenges facing our world. By joining, you become part of a movement that 
          combines the best of decentralized technology with human collaboration to create meaningful impact.
        </p>
        <p>
          Unlike traditional charitable giving or impact investing, Humanity DAO gives you direct governance rights, 
          transparent tracking of funds, and the ability to build reputation while making a difference.
        </p>
      </div>

      <div className="benefits-grid">
        {benefitCategories.map((category) => (
          <div key={category.id} className="benefit-card">
            <div className="benefit-header">
              <div className="benefit-icon">{category.icon}</div>
              <h3>{category.title}</h3>
              <p className="benefit-description">{category.description}</p>
            </div>
            <div className="benefit-details">
              {category.benefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <h4>{benefit.title}</h4>
                  <p>{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="testimonials-section">
        <h2>What Our Members Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial">
            <div className="testimonial-content">
              <p>"Being part of Humanity DAO has given me the opportunity to contribute to solutions for climate change in a way that feels meaningful and transparent. I can see exactly where my contribution goes and have a say in what gets funded."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">MS</div>
              <div className="author-info">
                <h4>Maria S.</h4>
                <p>Member since 2023</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial">
            <div className="testimonial-content">
              <p>"I've learned so much about blockchain governance and complex global issues since joining. The community is incredibly supportive and knowledgeable, and I feel like I'm making a real impact while also growing professionally."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">JT</div>
              <div className="author-info">
                <h4>James T.</h4>
                <p>Member since 2022</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial">
            <div className="testimonial-content">
              <p>"What I love about Humanity DAO is that it combines purpose with innovation. We're not just talking about making the world better—we're building and funding real solutions using cutting-edge technology and collaborative decision-making."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">AL</div>
              <div className="author-info">
                <h4>Aisha L.</h4>
                <p>Member since 2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="join-section">
        <div className="join-content">
          <h2>Ready to Make a Difference?</h2>
          <p>Join Humanity DAO today and start contributing to solutions for humanity's greatest challenges while enjoying all the benefits of membership.</p>
          <div className="join-actions">
            <button 
              className="primary-join-btn"
              onClick={() => navigate(isConnected ? '/challenges' : '/dashboard')}
            >
              {isConnected ? 'Explore Challenges' : 'Connect Wallet to Join'}
            </button>
            <button 
              className="secondary-join-btn"
              onClick={() => navigate('/about')}
            >
              Learn More About Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Benefits; 