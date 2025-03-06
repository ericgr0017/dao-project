import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import './Membership.css';

const Membership = () => {
  const navigate = useNavigate();
  const { account, isConnected, contracts, connectWallet } = useWeb3();
  const [selectedTier, setSelectedTier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    expertise: '',
    interests: [],
    background: '',
    referral: '',
    commitment: '',
    membershipType: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [hasTokens, setHasTokens] = useState(false);
  
  // Early adopter program state
  // eslint-disable-next-line no-unused-vars
  const [currentMemberCount, setCurrentMemberCount] = useState(278);
  const [earlyAdopterTier, setEarlyAdopterTier] = useState('');
  const [earlyAdopterRewards, setEarlyAdopterRewards] = useState({
    tokens: 0,
    multiplier: 1,
    badge: '',
    specialPerks: []
  });
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  
  // New gamification features
  const [referralCode, setReferralCode] = useState('');
  const [referralBonus, setReferralBonus] = useState(0);
  const [showReferralInfo, setShowReferralInfo] = useState(false);
  const [dailyCheckInStreak, setDailyCheckInStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [achievements, setAchievements] = useState([
    { id: 'join', title: 'Join the DAO', description: 'Become a member of Humanity DAO', completed: false, reward: '50 GT' },
    { id: 'refer', title: 'First Referral', description: 'Refer a friend to join the DAO', completed: false, reward: '100 GT' },
    { id: 'streak3', title: '3-Day Streak', description: 'Check in for 3 consecutive days', completed: false, reward: '75 GT' },
    { id: 'streak7', title: '7-Day Streak', description: 'Check in for 7 consecutive days', completed: false, reward: '150 GT' },
    { id: 'profile', title: 'Complete Profile', description: 'Fill out all profile information', completed: false, reward: '50 GT' }
  ]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [completedAchievement, setCompletedAchievement] = useState(null);

  // New state for learn more modal
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);

  // Early adopter tiers wrapped in useMemo to prevent re-renders
  const earlyAdopterTiers = useMemo(() => [
    {
      name: 'Genesis Member',
      range: '1-100',
      tokens: 1000,
      multiplier: 3,
      badge: 'Genesis',
      specialPerks: [
        'Exclusive Genesis Member NFT',
        'Permanent 3x reward multiplier',
        'Direct access to founding team',
        'Name in DAO Hall of Fame',
        'Early access to all new features'
      ]
    },
    {
      name: 'Pioneer',
      range: '101-500',
      tokens: 500,
      multiplier: 2,
      badge: 'Pioneer',
      specialPerks: [
        'Limited Edition Pioneer NFT',
        '2x reward multiplier for first year',
        'Priority proposal review',
        'Special voting power in Pioneer-only polls',
        'Pioneer community channel access'
      ]
    },
    {
      name: 'Founder\'s Circle',
      range: '501-1000',
      tokens: 250,
      multiplier: 1.5,
      badge: 'Founder',
      specialPerks: [
        'Founder\'s Circle NFT',
        '1.5x reward multiplier for 6 months',
        'Founder\'s Circle community access',
        'Monthly exclusive events',
        'Early feature testing'
      ]
    },
    {
      name: 'Early Adopter',
      range: '1001-5000',
      tokens: 100,
      multiplier: 1.2,
      badge: 'Early Adopter',
      specialPerks: [
        'Early Adopter badge',
        '1.2x reward multiplier for 3 months',
        'Special onboarding support',
        'Early Adopter community access'
      ]
    }
  ], []);

  // Expertise options
  const expertiseOptions = [
    'Climate Change',
    'Global Health',
    'Education',
    'Poverty Reduction',
    'Technology',
    'Governance',
    'Economics',
    'Social Justice',
    'Environmental Science',
    'Other'
  ];

  // Interest areas
  const interestAreas = [
    'Funding Solutions',
    'Creating Proposals',
    'Voting on Governance',
    'Contributing Expertise',
    'Community Building',
    'Research',
    'Education & Outreach',
    'Technical Development'
  ];

  // Premium membership types
  const premiumTypes = [
    'Educator',
    'Subject Matter Expert',
    'Student',
    'Funder',
    'Founder',
    'Researcher',
    'NGO Representative',
    'Government Official',
    'Corporate Partner'
  ];

  // Membership tiers
  const membershipTiers = [
    {
      id: 'open',
      name: 'Open Membership',
      description: 'Join the community, participate in discussions, and learn about global challenges.',
      benefits: [
        'Access to community forums',
        'View proposals and solutions',
        'Participate in educational events',
        'Receive newsletter updates'
      ],
      requirements: 'No tokens required',
      tokenRequirement: 0,
      ctaText: 'Join Now'
    },
    {
      id: 'token',
      name: 'Token-Based Membership',
      description: 'Become a voting member with governance rights by holding DAO tokens.',
      benefits: [
        'All Open Membership benefits',
        'Voting rights on proposals',
        'Create and submit proposals',
        'Participate in governance decisions',
        'Earn rewards through staking'
      ],
      requirements: 'Minimum 100 GT tokens',
      tokenRequirement: 100,
      ctaText: 'Join with Tokens'
    },
    {
      id: 'premium',
      name: 'Premium Membership',
      description: 'For specialized contributors who bring unique expertise or resources to the DAO.',
      benefits: [
        'All Token-Based Membership benefits',
        'Verified credential badge',
        'Priority access to funding',
        'Invitation to exclusive events',
        'Direct connection to relevant stakeholders',
        'Featured profile in the community'
      ],
      requirements: 'Application review + 500 GT tokens',
      tokenRequirement: 500,
      ctaText: 'Apply for Premium'
    }
  ];

  // Generate referral code based on wallet address
  useEffect(() => {
    if (isConnected && account) {
      // Create a referral code from the first 4 and last 4 characters of the address
      const code = `${account.substring(0, 4)}${account.substring(account.length - 4)}`;
      setReferralCode(code.toUpperCase());
    }
  }, [isConnected, account]);

  // Check for daily check-in
  useEffect(() => {
    if (isConnected) {
      // Get last check-in from localStorage
      const storedCheckIn = localStorage.getItem('lastCheckIn');
      const storedStreak = localStorage.getItem('checkInStreak');
      
      if (storedCheckIn) {
        const lastDate = new Date(storedCheckIn);
        setLastCheckIn(lastDate);
        
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // If last check-in was before today (and not yesterday), show check-in modal
        if (lastDate.toDateString() !== today.toDateString() && 
            lastDate.toDateString() !== yesterday.toDateString()) {
          setShowCheckInModal(true);
        }
      }
      
      if (storedStreak) {
        setDailyCheckInStreak(parseInt(storedStreak));
      }
    }
  }, [isConnected]);

  // Check achievements
  useEffect(() => {
    if (isConnected) {
      // Load achievements from localStorage
      const storedAchievements = localStorage.getItem('achievements');
      if (storedAchievements) {
        setAchievements(JSON.parse(storedAchievements));
      }
    }
  }, [isConnected]);

  // Determine early adopter tier based on current member count
  useEffect(() => {
    // In a real implementation, fetch the actual member count from the contract
    // For now, we'll use a mock value
    
    // Determine which early adopter tier the user would get
    if (currentMemberCount < 100) {
      setEarlyAdopterTier('Genesis Member');
      setEarlyAdopterRewards(earlyAdopterTiers[0]);
    } else if (currentMemberCount < 500) {
      setEarlyAdopterTier('Pioneer');
      setEarlyAdopterRewards(earlyAdopterTiers[1]);
    } else if (currentMemberCount < 1000) {
      setEarlyAdopterTier('Founder\'s Circle');
      setEarlyAdopterRewards(earlyAdopterTiers[2]);
    } else if (currentMemberCount < 5000) {
      setEarlyAdopterTier('Early Adopter');
      setEarlyAdopterRewards(earlyAdopterTiers[3]);
    } else {
      setEarlyAdopterTier('');
      setEarlyAdopterRewards({
        tokens: 0,
        multiplier: 1,
        badge: '',
        specialPerks: []
      });
    }
  }, [currentMemberCount, earlyAdopterTiers]);

  // Check token balance when connected
  useEffect(() => {
    const checkTokenBalance = async () => {
      if (isConnected && contracts && contracts.governanceToken) {
        try {
          // In a real implementation, fetch the actual token balance
          if (contracts.governanceToken.isDevelopment) {
            // Mock data for development
            setTokenBalance('1000');
            setHasTokens(true);
          } else {
            const balance = await contracts.governanceToken.balanceOf(account);
            const formattedBalance = ethers.utils.formatEther(balance);
            setTokenBalance(formattedBalance);
            setHasTokens(parseFloat(formattedBalance) > 0);
          }
        } catch (error) {
          console.error('Error fetching token balance:', error);
          setTokenBalance('0');
          setHasTokens(false);
        }
      }
    };

    checkTokenBalance();
  }, [isConnected, account, contracts]);

  // Handle tier selection
  const handleSelectTier = (tierId) => {
    setSelectedTier(tierId);
    setFormData({
      ...formData,
      membershipType: tierId === 'premium' ? '' : tierId
    });
    
    // Scroll to form
    setTimeout(() => {
      document.getElementById('membership-form').scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle checkbox changes for interests
  const handleInterestChange = (interest) => {
    const updatedInterests = [...formData.interests];
    
    if (updatedInterests.includes(interest)) {
      // Remove if already selected
      const index = updatedInterests.indexOf(interest);
      updatedInterests.splice(index, 1);
    } else {
      // Add if not selected
      updatedInterests.push(interest);
    }
    
    setFormData({
      ...formData,
      interests: updatedInterests
    });
  };

  // Handle daily check-in
  const handleDailyCheckIn = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newStreak = dailyCheckInStreak;
    
    // If last check-in was yesterday, increment streak
    if (lastCheckIn && lastCheckIn.toDateString() === yesterday.toDateString()) {
      newStreak += 1;
    } else {
      // Otherwise reset streak
      newStreak = 1;
    }
    
    setDailyCheckInStreak(newStreak);
    setLastCheckIn(today);
    setShowCheckInModal(false);
    
    // Store in localStorage
    localStorage.setItem('lastCheckIn', today.toString());
    localStorage.setItem('checkInStreak', newStreak.toString());
    
    // Check for streak achievements
    const updatedAchievements = [...achievements];
    
    if (newStreak >= 3) {
      const streak3Achievement = updatedAchievements.find(a => a.id === 'streak3');
      if (streak3Achievement && !streak3Achievement.completed) {
        streak3Achievement.completed = true;
        setCompletedAchievement(streak3Achievement);
        setShowAchievementModal(true);
      }
    }
    
    if (newStreak >= 7) {
      const streak7Achievement = updatedAchievements.find(a => a.id === 'streak7');
      if (streak7Achievement && !streak7Achievement.completed) {
        streak7Achievement.completed = true;
        setCompletedAchievement(streak7Achievement);
        setShowAchievementModal(true);
      }
    }
    
    setAchievements(updatedAchievements);
    localStorage.setItem('achievements', JSON.stringify(updatedAchievements));
  };

  // Copy referral code to clipboard
  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    alert('Referral code copied to clipboard!');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Validate form based on selected tier
      if (selectedTier === 'token' || selectedTier === 'premium') {
        const requiredTokens = membershipTiers.find(tier => tier.id === selectedTier).tokenRequirement;
        const userTokens = parseFloat(tokenBalance);
        
        if (userTokens < requiredTokens) {
          throw new Error(`Insufficient tokens. You need at least ${requiredTokens} GT tokens.`);
        }
      }
      
      // Check if referral code is valid and add bonus
      let referralTokenBonus = 0;
      if (formData.referral && formData.referral.length > 0) {
        // In a real implementation, this would verify the referral code against the database
        // For now, we'll simulate a successful referral with a bonus
        referralTokenBonus = 100;
        setReferralBonus(referralTokenBonus);
      }
      
      // In a real implementation, this would interact with a smart contract
      // For now, we'll simulate a successful submission
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Membership application submitted:', {
        tier: selectedTier,
        ...formData,
        walletAddress: account,
        earlyAdopterTier,
        earlyAdopterRewards,
        referralBonus: referralTokenBonus
      });
      
      // Complete the "Join the DAO" achievement
      const updatedAchievements = [...achievements];
      const joinAchievement = updatedAchievements.find(a => a.id === 'join');
      if (joinAchievement && !joinAchievement.completed) {
        joinAchievement.completed = true;
        setCompletedAchievement(joinAchievement);
        // We'll show this achievement after the rewards modal
      }
      
      // Check if profile is complete for the achievement
      if (formData.name && formData.email && formData.expertise && formData.interests.length > 0) {
        const profileAchievement = updatedAchievements.find(a => a.id === 'profile');
        if (profileAchievement && !profileAchievement.completed) {
          profileAchievement.completed = true;
          // We'll queue this achievement to show after the join achievement
        }
      }
      
      setAchievements(updatedAchievements);
      localStorage.setItem('achievements', JSON.stringify(updatedAchievements));
      
      // Show rewards modal if user is an early adopter
      if (earlyAdopterTier) {
        setShowRewardsModal(true);
      } else {
        setSubmitSuccess(true);
      }
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          expertise: '',
          interests: [],
          background: '',
          referral: '',
          commitment: '',
          membershipType: ''
        });
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting membership application:', error);
      setSubmitError(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close rewards modal and show success message
  const handleCloseRewardsModal = () => {
    setShowRewardsModal(false);
    
    // Show achievement modal if we have a completed achievement
    if (completedAchievement) {
      setShowAchievementModal(true);
    } else {
      setSubmitSuccess(true);
    }
  };

  // Close achievement modal
  const handleCloseAchievementModal = () => {
    setShowAchievementModal(false);
    setSubmitSuccess(true);
  };

  // Handle opening learn more modal
  const handleOpenLearnMore = () => {
    setShowLearnMoreModal(true);
  };

  // Handle closing learn more modal
  const handleCloseLearnMore = () => {
    setShowLearnMoreModal(false);
  };

  // Render the daily check-in modal
  const renderCheckInModal = () => {
    if (!showCheckInModal) return null;
    
    return (
      <div className="rewards-modal-overlay">
        <div className="rewards-modal check-in-modal">
          <div className="rewards-modal-header">
            <h2>🌟 Daily Check-In 🌟</h2>
            <p>Maintain your streak to earn rewards!</p>
          </div>
          
          <div className="check-in-streak">
            <div className="streak-counter">
              <span className="streak-value">{dailyCheckInStreak}</span>
              <span className="streak-label">day streak</span>
            </div>
            
            <div className="streak-milestones">
              <div className={`milestone ${dailyCheckInStreak >= 3 ? 'achieved' : ''}`}>
                <span className="milestone-days">3</span>
                <span className="milestone-reward">+75 GT</span>
              </div>
              <div className={`milestone ${dailyCheckInStreak >= 7 ? 'achieved' : ''}`}>
                <span className="milestone-days">7</span>
                <span className="milestone-reward">+150 GT</span>
              </div>
              <div className="milestone">
                <span className="milestone-days">14</span>
                <span className="milestone-reward">+300 GT</span>
              </div>
              <div className="milestone">
                <span className="milestone-days">30</span>
                <span className="milestone-reward">+500 GT</span>
              </div>
            </div>
          </div>
          
          <div className="check-in-reward">
            <h3>Today's Reward</h3>
            <div className="reward-value">+25 GT</div>
          </div>
          
          <button 
            className="primary-button check-in-btn"
            onClick={handleDailyCheckIn}
          >
            Check In Now
          </button>
        </div>
      </div>
    );
  };

  // Render the achievement modal
  const renderAchievementModal = () => {
    if (!showAchievementModal || !completedAchievement) return null;
    
    return (
      <div className="rewards-modal-overlay">
        <div className="rewards-modal achievement-modal">
          <div className="rewards-modal-header">
            <h2>🏆 Achievement Unlocked! 🏆</h2>
          </div>
          
          <div className="achievement-badge">
            <div className="badge-icon">
              <span className="badge-text">
                {completedAchievement.id === 'join' ? '🚀' : 
                 completedAchievement.id === 'refer' ? '👥' :
                 completedAchievement.id === 'streak3' || completedAchievement.id === 'streak7' ? '🔥' :
                 completedAchievement.id === 'profile' ? '📝' : '🏆'}
              </span>
            </div>
            <h3>{completedAchievement.title}</h3>
          </div>
          
          <p className="achievement-description">{completedAchievement.description}</p>
          
          <div className="achievement-reward">
            <h4>Reward</h4>
            <div className="reward-value">{completedAchievement.reward}</div>
          </div>
          
          <button 
            className="primary-button close-modal-btn"
            onClick={handleCloseAchievementModal}
          >
            Claim Reward
          </button>
        </div>
      </div>
    );
  };

  // Render the early adopter rewards modal
  const renderRewardsModal = () => {
    if (!showRewardsModal) return null;
    
    const totalTokens = earlyAdopterRewards.tokens + referralBonus;
    
    return (
      <div className="rewards-modal-overlay">
        <div className="rewards-modal">
          <div className="rewards-modal-header">
            <h2>🎉 Congratulations, Early Adopter! 🎉</h2>
            <p>You're member #{currentMemberCount + 1} of Humanity DAO</p>
          </div>
          
          <div className="rewards-badge">
            <div className="badge-icon">
              <span className="badge-text">{earlyAdopterRewards.badge}</span>
            </div>
            <h3>{earlyAdopterTier}</h3>
          </div>
          
          <div className="rewards-details">
            <div className="reward-item">
              <h4>Tokens Awarded</h4>
              <div className="reward-value">
                {earlyAdopterRewards.tokens} GT
                {referralBonus > 0 && (
                  <span className="bonus-tokens"> + {referralBonus} GT (Referral Bonus)</span>
                )}
              </div>
              <div className="total-tokens">Total: {totalTokens} GT</div>
            </div>
            
            <div className="reward-item">
              <h4>Reward Multiplier</h4>
              <div className="reward-value">{earlyAdopterRewards.multiplier}x</div>
            </div>
          </div>
          
          <div className="special-perks">
            <h4>Special Perks Unlocked</h4>
            <ul>
              {earlyAdopterRewards.specialPerks.map((perk, index) => (
                <li key={index}>{perk}</li>
              ))}
            </ul>
          </div>
          
          <div className="next-steps">
            <h4>Next Steps</h4>
            <p>Your rewards have been added to your account. Start exploring the DAO to earn more rewards!</p>
          </div>
          
          <button 
            className="primary-button close-modal-btn"
            onClick={handleCloseRewardsModal}
          >
            Start My Journey
          </button>
        </div>
      </div>
    );
  };

  // Render the appropriate form based on selected tier
  const renderMembershipForm = () => {
    if (!selectedTier) return null;
    
    return (
      <div id="membership-form" className="membership-form-container">
        <h2>Join as {membershipTiers.find(tier => tier.id === selectedTier).name}</h2>
        
        {submitSuccess ? (
          <div className="success-message">
            <h3>Application Submitted Successfully!</h3>
            <p>Thank you for joining Humanity DAO. We've received your application and will process it shortly.</p>
            {selectedTier === 'premium' && (
              <p>Your premium membership application will be reviewed by the community. You'll receive a notification once it's approved.</p>
            )}
            <div className="referral-section">
              <h4>Invite Friends & Earn Rewards</h4>
              <p>Share your referral code with friends. You'll both receive 100 GT when they join!</p>
              <div className="referral-code-container">
                <span className="referral-code">{referralCode}</span>
                <button 
                  className="secondary-button copy-btn"
                  onClick={copyReferralCode}
                >
                  Copy
                </button>
              </div>
            </div>
            <button 
              className="primary-button"
              onClick={() => {
                setSelectedTier(null);
                setSubmitSuccess(false);
              }}
            >
              Apply for Another Tier
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="membership-form">
            {/* Early Adopter Banner */}
            {earlyAdopterTier && (
              <div className="early-adopter-banner">
                <div className="banner-content">
                  <h3>🚀 Early Adopter Opportunity!</h3>
                  <p>
                    You're about to become member #{currentMemberCount + 1} and qualify for our 
                    <strong> {earlyAdopterTier}</strong> rewards program.
                  </p>
                  <div className="early-adopter-rewards">
                    <div className="reward-preview">
                      <span className="reward-icon">🪙</span>
                      <span className="reward-label">{earlyAdopterRewards.tokens} GT Tokens</span>
                    </div>
                    <div className="reward-preview">
                      <span className="reward-icon">⭐</span>
                      <span className="reward-label">{earlyAdopterRewards.multiplier}x Reward Multiplier</span>
                    </div>
                    <div className="reward-preview">
                      <span className="reward-icon">🏆</span>
                      <span className="reward-label">Exclusive {earlyAdopterRewards.badge} Badge</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Referral Section */}
            <div className="form-section referral-section">
              <h3>Referred by a Friend?</h3>
              <p className="form-hint">Enter their referral code to earn 100 bonus tokens!</p>
              <div className="form-group">
                <input
                  type="text"
                  id="referral"
                  name="referral"
                  value={formData.referral}
                  onChange={handleInputChange}
                  placeholder="Enter referral code (optional)"
                />
              </div>
              <button 
                type="button" 
                className="secondary-button info-btn"
                onClick={() => setShowReferralInfo(!showReferralInfo)}
              >
                How referrals work
              </button>
              
              {showReferralInfo && (
                <div className="referral-info">
                  <p>When you join using a referral code:</p>
                  <ul>
                    <li>You receive 100 bonus GT tokens</li>
                    <li>Your referrer receives 100 GT tokens</li>
                    <li>After joining, you'll get your own referral code to share</li>
                  </ul>
                </div>
              )}
            </div>
            
            {/* Wallet Connection Section */}
            <div className="form-section">
              <h3>Wallet Connection</h3>
              {isConnected ? (
                <div className="wallet-info">
                  <p><strong>Connected Address:</strong> {account}</p>
                  <p><strong>Token Balance:</strong> {tokenBalance} GT</p>
                  
                  {(selectedTier === 'token' || selectedTier === 'premium') && (
                    <div className={`token-requirement ${hasTokens ? 'requirement-met' : 'requirement-not-met'}`}>
                      <p>Required: {membershipTiers.find(tier => tier.id === selectedTier).tokenRequirement} GT</p>
                      {!hasTokens && (
                        <button 
                          type="button" 
                          className="secondary-button"
                          onClick={() => navigate('/treasury')}
                        >
                          Get Tokens
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="connect-wallet-prompt">
                  <p>Please connect your wallet to continue.</p>
                  <button 
                    type="button" 
                    className="primary-button"
                    onClick={connectWallet}
                  >
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
            
            {/* Only show the rest of the form if wallet is connected */}
            {isConnected && (
              <>
                {/* Basic Information */}
                <div className="form-section">
                  <h3>Basic Information</h3>
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                {/* Interests Section */}
                <div className="form-section">
                  <h3>Areas of Interest</h3>
                  <p className="form-hint">Select all that apply to you</p>
                  
                  <div className="checkbox-grid">
                    {interestAreas.map(interest => (
                      <div key={interest} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`interest-${interest}`}
                          checked={formData.interests.includes(interest)}
                          onChange={() => handleInterestChange(interest)}
                        />
                        <label htmlFor={`interest-${interest}`}>{interest}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Expertise Section */}
                <div className="form-section">
                  <h3>Primary Expertise</h3>
                  
                  <div className="form-group">
                    <select
                      id="expertise"
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select your primary expertise</option>
                      {expertiseOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Additional Fields for Premium Membership */}
                {selectedTier === 'premium' && (
                  <>
                    <div className="form-section">
                      <h3>Premium Membership Details</h3>
                      
                      <div className="form-group">
                        <label htmlFor="membershipType">Membership Type</label>
                        <select
                          id="membershipType"
                          name="membershipType"
                          value={formData.membershipType}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select your membership type</option>
                          {premiumTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="background">Professional Background</label>
                        <textarea
                          id="background"
                          name="background"
                          value={formData.background}
                          onChange={handleInputChange}
                          placeholder="Briefly describe your professional background and relevant experience..."
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="commitment">Commitment to DAO</label>
                        <textarea
                          id="commitment"
                          name="commitment"
                          value={formData.commitment}
                          onChange={handleInputChange}
                          placeholder="How do you plan to contribute to the DAO's mission?"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="referral">Referral (Optional)</label>
                        <input
                          type="text"
                          id="referral"
                          name="referral"
                          value={formData.referral}
                          onChange={handleInputChange}
                          placeholder="Were you referred by an existing member? Enter their name or wallet address."
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {/* Submit Section */}
                <div className="form-section">
                  {submitError && (
                    <div className="error-message">
                      <p>{submitError}</p>
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : `Submit ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Membership Application`}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    );
  };

  // Render learn more modal
  const renderLearnMoreModal = () => {
    if (!showLearnMoreModal) return null;
    
    return (
      <div className="rewards-modal-overlay">
        <div className="rewards-modal learn-more-modal">
          <div className="rewards-modal-header">
            <h2>Early Adopter Program Explained</h2>
            <p>Everything you need to know about our rewards system</p>
          </div>
          
          <div className="learn-more-content">
            <div className="learn-more-section">
              <h3>What are GT Tokens?</h3>
              <p>
                <strong>Governance Tokens (GT)</strong> are the native cryptocurrency of Humanity DAO. 
                They serve multiple purposes within our ecosystem:
              </p>
              <ul>
                <li><strong>Governance:</strong> Vote on proposals and participate in decision-making</li>
                <li><strong>Utility:</strong> Access premium features and services</li>
                <li><strong>Rewards:</strong> Earn for contributions to the DAO</li>
                <li><strong>Value:</strong> Hold as an investment in the DAO's future</li>
              </ul>
              <p>
                GT tokens can be earned through participation, contributions, and as rewards
                for early adoption. They can also be staked to earn additional rewards.
              </p>
            </div>
            
            <div className="learn-more-section">
              <h3>What are Reward Multipliers?</h3>
              <p>
                Reward multipliers increase the amount of GT tokens you earn from various activities
                within the DAO. Here's what gets multiplied:
              </p>
              <ul>
                <li><strong>Proposal Rewards:</strong> Tokens earned when your proposals are approved</li>
                <li><strong>Voting Rewards:</strong> Tokens earned for participating in governance</li>
                <li><strong>Contribution Rewards:</strong> Tokens earned for contributing to projects</li>
                <li><strong>Staking Yields:</strong> Additional tokens earned when staking your GT</li>
                <li><strong>Referral Bonuses:</strong> Tokens earned when referring new members</li>
              </ul>
              <p>
                For example, with a 3x multiplier as a Genesis Member, if an activity normally rewards
                100 GT, you would receive 300 GT instead.
              </p>
            </div>
            
            <div className="learn-more-section">
              <h3>Early Adopter Tiers Explained</h3>
              <table className="tiers-table">
                <thead>
                  <tr>
                    <th>Tier</th>
                    <th>Member Range</th>
                    <th>Initial Tokens</th>
                    <th>Multiplier</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Genesis Member</td>
                    <td>1-100</td>
                    <td>1,000 GT</td>
                    <td>3x</td>
                    <td>Permanent</td>
                  </tr>
                  <tr>
                    <td>Pioneer</td>
                    <td>101-500</td>
                    <td>500 GT</td>
                    <td>2x</td>
                    <td>12 months</td>
                  </tr>
                  <tr>
                    <td>Founder's Circle</td>
                    <td>501-1,000</td>
                    <td>250 GT</td>
                    <td>1.5x</td>
                    <td>6 months</td>
                  </tr>
                  <tr>
                    <td>Early Adopter</td>
                    <td>1,001-5,000</td>
                    <td>100 GT</td>
                    <td>1.2x</td>
                    <td>3 months</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="learn-more-section">
              <h3>Special Badges & Perks</h3>
              <p>
                Each tier comes with exclusive badges and special perks that provide unique
                benefits within the DAO ecosystem:
              </p>
              <ul>
                <li>
                  <strong>Exclusive NFTs:</strong> Collectible digital assets that prove your early 
                  membership status and may appreciate in value over time
                </li>
                <li>
                  <strong>Special Access:</strong> Early or exclusive access to new features, 
                  events, and opportunities before they're available to the general membership
                </li>
                <li>
                  <strong>Recognition:</strong> Your name or handle displayed in the DAO Hall of Fame
                  and other recognition programs
                </li>
                <li>
                  <strong>Priority Support:</strong> Faster response times and dedicated support channels
                </li>
                <li>
                  <strong>Networking:</strong> Access to exclusive community channels with other early adopters
                  and founding team members
                </li>
              </ul>
            </div>
            
            <div className="learn-more-section">
              <h3>Frequently Asked Questions</h3>
              <div className="learn-more-faq">
                <div className="faq-item">
                  <h4>How long do my rewards last?</h4>
                  <p>
                    Initial token rewards are granted immediately upon joining. Multipliers last for 
                    different durations based on your tier (see table above). Genesis Members enjoy 
                    permanent multipliers as our most valued early supporters.
                  </p>
                </div>
                <div className="faq-item">
                  <h4>Can I upgrade my tier later?</h4>
                  <p>
                    Tier status is determined by when you join and cannot be upgraded later. 
                    This creates true scarcity and rewards those who join earliest.
                  </p>
                </div>
                <div className="faq-item">
                  <h4>What's the value of GT tokens?</h4>
                  <p>
                    GT tokens have utility within the DAO for governance, access, and rewards. 
                    As the DAO grows and develops, the utility and demand for GT may increase. 
                    However, like any token, value can fluctuate based on various factors.
                  </p>
                </div>
                <div className="faq-item">
                  <h4>How do I use my multiplier?</h4>
                  <p>
                    Multipliers are applied automatically to eligible rewards. You don't need 
                    to activate them manually. The system will track your tier and apply the 
                    appropriate multiplier to your earnings.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            className="primary-button close-modal-btn"
            onClick={handleCloseLearnMore}
          >
            Got It
          </button>
        </div>
      </div>
    );
  };

  // Render achievements section
  const renderAchievements = () => {
    const completedCount = achievements.filter(a => a.completed).length;
    const totalCount = achievements.length;
    const progressPercent = (completedCount / totalCount) * 100;
    
    return (
      <div className="achievements-section">
        <div className="section-header">
          <h2>🏆 Achievements</h2>
          <div className="achievement-progress">
            <span className="progress-text">{completedCount}/{totalCount} Completed</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="achievement-cards">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.completed ? 'completed' : ''}`}
            >
              <div className="achievement-icon">
                {achievement.id === 'join' ? '🚀' : 
                 achievement.id === 'refer' ? '👥' :
                 achievement.id === 'streak3' || achievement.id === 'streak7' ? '🔥' :
                 achievement.id === 'profile' ? '📝' : '🏆'}
              </div>
              <div className="achievement-info">
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
                <div className="achievement-reward">{achievement.reward}</div>
              </div>
              <div className="achievement-status">
                {achievement.completed ? 'Completed' : 'In Progress'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="page-container membership-page">
      <div className="membership-header">
        <h1>Join Humanity DAO</h1>
        <p className="membership-subtitle">
          Choose the membership tier that best fits your goals and level of involvement.
          Each tier offers different benefits and governance rights within the DAO.
        </p>
      </div>
      
      {/* Daily Check-in Streak (if logged in) */}
      {isConnected && dailyCheckInStreak > 0 && (
        <div className="check-in-banner">
          <div className="streak-flames">
            {[...Array(Math.min(dailyCheckInStreak, 7))].map((_, i) => (
              <span key={i} className="flame">🔥</span>
            ))}
          </div>
          <div className="streak-info">
            <span className="streak-count">{dailyCheckInStreak}</span>
            <span className="streak-text">day streak!</span>
          </div>
          <div className="streak-message">
            Come back tomorrow to continue your streak and earn rewards!
          </div>
        </div>
      )}
      
      {/* Early Adopter Program Banner */}
      <div className="early-adopter-program">
        <div className="program-header">
          <h2>🚀 Early Adopter Program</h2>
          <div className="member-counter">
            <span className="counter-label">Current Members:</span>
            <span className="counter-value">{currentMemberCount}</span>
            <span className="counter-max">/ 5,000</span>
          </div>
          <button 
            className="learn-more-btn"
            onClick={handleOpenLearnMore}
          >
            Learn More
          </button>
        </div>
        
        <p className="program-description">
          Join now to receive exclusive rewards! Early members get bonus tokens, reward multipliers, and special badges.
        </p>
        
        <div className="tier-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min((currentMemberCount / 5000) * 100, 100)}%` }}
            ></div>
            <div className="progress-markers">
              <div className="marker marker-1" style={{ left: '2%' }}>
                <div className="marker-label">Genesis<br/>1-100</div>
              </div>
              <div className="marker marker-2" style={{ left: '10%' }}>
                <div className="marker-label">Pioneer<br/>101-500</div>
              </div>
              <div className="marker marker-3" style={{ left: '20%' }}>
                <div className="marker-label">Founder's Circle<br/>501-1000</div>
              </div>
              <div className="marker marker-4" style={{ left: '100%' }}>
                <div className="marker-label">Early Adopter<br/>1001-5000</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="tier-cards">
          {earlyAdopterTiers.map((tier, index) => (
            <div 
              key={index} 
              className={`adopter-tier-card ${currentMemberCount < parseInt(tier.range.split('-')[1]) ? 'active' : 'expired'}`}
            >
              <div className="tier-status">
                {currentMemberCount < parseInt(tier.range.split('-')[0])
                  ? 'Coming Soon'
                  : currentMemberCount < parseInt(tier.range.split('-')[1])
                    ? 'Active Now'
                    : 'Expired'}
              </div>
              <h3>{tier.name}</h3>
              <div className="tier-range">Members {tier.range}</div>
              <div className="tier-rewards">
                <div className="reward-item">
                  <span className="reward-icon">🪙</span>
                  <span className="reward-value">{tier.tokens} GT</span>
                </div>
                <div className="reward-item">
                  <span className="reward-icon">⭐</span>
                  <span className="reward-value">{tier.multiplier}x Multiplier</span>
                </div>
                <div className="reward-item">
                  <span className="reward-icon">🏆</span>
                  <span className="reward-value">{tier.badge} Badge</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Achievements Section */}
      {isConnected && renderAchievements()}
      
      <div className="membership-tiers">
        {membershipTiers.map(tier => (
          <div key={tier.id} className={`tier-card ${selectedTier === tier.id ? 'selected' : ''}`}>
            <div className="tier-header">
              <h2>{tier.name}</h2>
              <div className="tier-requirement">{tier.requirements}</div>
            </div>
            
            <p className="tier-description">{tier.description}</p>
            
            <div className="tier-benefits">
              <h3>Benefits</h3>
              <ul>
                {tier.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
            
            <button 
              className={`tier-cta ${selectedTier === tier.id ? 'selected' : ''}`}
              onClick={() => handleSelectTier(tier.id)}
            >
              {tier.ctaText}
            </button>
          </div>
        ))}
      </div>
      
      {renderMembershipForm()}
      {renderRewardsModal()}
      {renderCheckInModal()}
      {renderAchievementModal()}
      {renderLearnMoreModal()}
      
      <div className="membership-faq">
        <h2>Frequently Asked Questions</h2>
        
        <div className="faq-item">
          <h3>What is the Early Adopter Program?</h3>
          <p>
            Our Early Adopter Program rewards the first 5,000 members who join Humanity DAO with special
            benefits including bonus tokens, reward multipliers, exclusive badges, and special access to
            features and events. The earlier you join, the greater the rewards!
          </p>
        </div>
        
        <div className="faq-item">
          <h3>What is the difference between membership tiers?</h3>
          <p>
            Open membership provides basic access to the community and educational resources.
            Token-based membership grants voting rights and the ability to create proposals.
            Premium membership offers additional benefits for specialized contributors and includes
            verification of expertise and priority access to funding.
          </p>
        </div>
        
        <div className="faq-item">
          <h3>How do I get DAO tokens?</h3>
          <p>
            You can acquire DAO tokens through several methods:
            1) Contributing to the DAO and earning rewards
            2) Receiving grants for approved proposals
            3) Purchasing tokens through the Treasury page
          </p>
        </div>
        
        <div className="faq-item">
          <h3>How is Premium membership approved?</h3>
          <p>
            Premium membership applications are reviewed by the existing community members.
            The review process typically takes 3-5 days, and approval is based on your expertise,
            potential contribution to the DAO, and alignment with our mission.
          </p>
        </div>
        
        <div className="faq-item">
          <h3>Can I upgrade my membership later?</h3>
          <p>
            Yes, you can upgrade your membership at any time by acquiring the required tokens
            and applying for the higher tier. Your existing contributions and reputation will
            be carried over to your new membership level.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Membership; 