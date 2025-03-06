import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { Link } from 'react-router-dom';
import './UserAnalytics.css';

const UserAnalytics = () => {
  const { account, isConnected } = useWeb3();
  const [isLoading, setIsLoading] = useState(true);
  
  // User profile and early adopter status
  const [userProfile, setUserProfile] = useState({
    memberSince: '2023-03-05',
    memberNumber: 278,
    earlyAdopterTier: 'Pioneer',
    tierExpiration: '2024-03-05',
    referralCode: '',
    totalTokens: 0
  });
  
  // Rewards and multipliers
  const [rewardsData, setRewardsData] = useState({
    baseTokens: 500,
    referralBonus: 200,
    achievementBonus: 125,
    dailyCheckInBonus: 75,
    stakingRewards: 150,
    multiplier: 2,
    multipliedRewards: 0,
    totalTokens: 0
  });
  
  // Activity metrics
  // eslint-disable-next-line no-unused-vars
  const [activityMetrics, setActivityMetrics] = useState({
    proposalsCreated: 3,
    proposalsVoted: 12,
    challengesSupported: 2,
    commentsPosted: 8,
    lastActive: '2023-03-04'
  });
  
  // Referral statistics
  // eslint-disable-next-line no-unused-vars
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 2,
    pendingReferrals: 1,
    referralTokensEarned: 200,
    topReferrers: [
      { name: 'Alex', referrals: 5 },
      { name: 'Jordan', referrals: 4 },
      { name: 'Taylor', referrals: 3 },
      { name: 'You', referrals: 2 },
      { name: 'Morgan', referrals: 1 }
    ]
  });
  
  // Achievement progress
  // eslint-disable-next-line no-unused-vars
  const [achievements, setAchievements] = useState([
    { id: 'join', title: 'Join the DAO', description: 'Become a member of Humanity DAO', completed: true, reward: '50 GT' },
    { id: 'refer', title: 'First Referral', description: 'Refer a friend to join the DAO', completed: true, reward: '100 GT' },
    { id: 'refer5', title: 'Referral Master', description: 'Refer 5 friends to join the DAO', completed: false, progress: 2, total: 5, reward: '250 GT' },
    { id: 'streak3', title: '3-Day Streak', description: 'Check in for 3 consecutive days', completed: true, reward: '75 GT' },
    { id: 'streak7', title: '7-Day Streak', description: 'Check in for 7 consecutive days', completed: false, progress: 4, total: 7, reward: '150 GT' },
    { id: 'profile', title: 'Complete Profile', description: 'Fill out all profile information', completed: true, reward: '50 GT' },
    { id: 'vote10', title: 'Active Voter', description: 'Vote on 10 proposals', completed: true, reward: '100 GT' },
    { id: 'create3', title: 'Proposal Creator', description: 'Create 3 proposals', completed: true, reward: '150 GT' },
    { id: 'stake', title: 'Token Staker', description: 'Stake tokens in the DAO', completed: false, reward: '100 GT' }
  ]);
  
  // Daily check-in data
  // eslint-disable-next-line no-unused-vars
  const [checkInData, setCheckInData] = useState({
    currentStreak: 4,
    longestStreak: 5,
    lastCheckIn: '2023-03-04',
    nextMilestone: 7,
    streakHistory: [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1]
  });
  
  // Token history data for chart
  // eslint-disable-next-line no-unused-vars
  const [tokenHistory, setTokenHistory] = useState([
    { date: '2023-02-01', tokens: 500 },
    { date: '2023-02-08', tokens: 650 },
    { date: '2023-02-15', tokens: 750 },
    { date: '2023-02-22', tokens: 900 },
    { date: '2023-03-01', tokens: 1050 }
  ]);
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isConnected) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // In a real implementation, this would fetch data from contracts and backend
        // For now, we'll use mock data
        
        // Generate referral code from account address
        if (account) {
          const referralCode = `${account.substring(0, 4)}${account.substring(account.length - 4)}`.toUpperCase();
          setUserProfile(prev => ({ ...prev, referralCode }));
        }
        
        // Calculate total tokens and multiplied rewards
        const baseTotal = rewardsData.baseTokens + rewardsData.referralBonus + 
                         rewardsData.achievementBonus + rewardsData.dailyCheckInBonus +
                         rewardsData.stakingRewards;
        
        const multipliedRewards = Math.floor(baseTotal * rewardsData.multiplier);
        
        setRewardsData(prev => ({
          ...prev,
          multipliedRewards,
          totalTokens: multipliedRewards
        }));
        
        setUserProfile(prev => ({
          ...prev,
          totalTokens: multipliedRewards
        }));
        
        // Simulate loading delay
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching user analytics data:', error);
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [isConnected, account, rewardsData.baseTokens, rewardsData.referralBonus, 
      rewardsData.achievementBonus, rewardsData.dailyCheckInBonus, 
      rewardsData.stakingRewards, rewardsData.multiplier]);
  
  // Calculate achievement progress
  const completedAchievements = achievements.filter(a => a.completed).length;
  const totalAchievements = achievements.length;
  const achievementProgress = Math.floor((completedAchievements / totalAchievements) * 100);
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="page-container user-analytics-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your analytics dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Render not connected state
  if (!isConnected) {
    return (
      <div className="page-container user-analytics-page">
        <div className="not-connected-container">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view your analytics dashboard.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page-container user-analytics-page">
      <div className="analytics-header">
        <h1>Your Analytics Dashboard</h1>
        <p className="analytics-subtitle">
          Track your rewards, achievements, and contributions to the DAO
        </p>
      </div>
      
      {/* Early Adopter Status Card */}
      <div className="analytics-card early-adopter-status">
        <div className="card-header">
          <h2>Early Adopter Status</h2>
        </div>
        <div className="early-adopter-content">
          <div className="adopter-badge">
            <div className="badge-icon">
              <span className="badge-text">{userProfile.earlyAdopterTier}</span>
            </div>
          </div>
          <div className="adopter-details">
            <div className="detail-item">
              <span className="detail-label">Member Since:</span>
              <span className="detail-value">{userProfile.memberSince}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Member #:</span>
              <span className="detail-value">{userProfile.memberNumber}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tier:</span>
              <span className="detail-value">{userProfile.earlyAdopterTier}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Multiplier:</span>
              <span className="detail-value">{rewardsData.multiplier}x</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Expires:</span>
              <span className="detail-value">{userProfile.tierExpiration}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rewards Summary Card */}
      <div className="analytics-card rewards-summary">
        <div className="card-header">
          <h2>Rewards Summary</h2>
        </div>
        <div className="rewards-content">
          <div className="total-tokens">
            <span className="token-value">{rewardsData.totalTokens}</span>
            <span className="token-label">GT</span>
          </div>
          <div className="rewards-breakdown">
            <div className="breakdown-item">
              <span className="breakdown-label">Base Tokens:</span>
              <span className="breakdown-value">{rewardsData.baseTokens} GT</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Referral Bonus:</span>
              <span className="breakdown-value">{rewardsData.referralBonus} GT</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Achievement Bonus:</span>
              <span className="breakdown-value">{rewardsData.achievementBonus} GT</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Check-in Bonus:</span>
              <span className="breakdown-value">{rewardsData.dailyCheckInBonus} GT</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Staking Rewards:</span>
              <span className="breakdown-value">{rewardsData.stakingRewards} GT</span>
            </div>
            <div className="breakdown-multiplier">
              <span className="multiplier-label">Multiplier:</span>
              <span className="multiplier-value">{rewardsData.multiplier}x</span>
            </div>
            <div className="breakdown-total">
              <span className="total-label">Total Rewards:</span>
              <span className="total-value">{rewardsData.multipliedRewards} GT</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Two-column layout for smaller cards */}
      <div className="analytics-grid">
        {/* Achievement Progress Card */}
        <div className="analytics-card achievements-progress">
          <div className="card-header">
            <h2>Achievement Progress</h2>
          </div>
          <div className="achievements-content">
            <div className="progress-summary">
              <div className="progress-circle">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="circle"
                    strokeDasharray={`${achievementProgress}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">{achievementProgress}%</text>
                </svg>
              </div>
              <div className="progress-text">
                <span className="completed">{completedAchievements}</span>
                <span className="separator">/</span>
                <span className="total">{totalAchievements}</span>
                <span className="label">Completed</span>
              </div>
            </div>
            <div className="achievements-list">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`achievement-item ${achievement.completed ? 'completed' : ''}`}
                >
                  <div className="achievement-icon">
                    {achievement.id === 'join' ? '🚀' : 
                     achievement.id === 'refer' || achievement.id === 'refer5' ? '👥' :
                     achievement.id === 'streak3' || achievement.id === 'streak7' ? '🔥' :
                     achievement.id === 'profile' ? '📝' :
                     achievement.id === 'vote10' ? '🗳️' :
                     achievement.id === 'create3' ? '📋' :
                     achievement.id === 'stake' ? '💰' : '🏆'}
                  </div>
                  <div className="achievement-info">
                    <h3>{achievement.title}</h3>
                    <p>{achievement.description}</p>
                    {!achievement.completed && achievement.progress && (
                      <div className="achievement-progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                        ></div>
                        <span className="progress-text">
                          {achievement.progress}/{achievement.total}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="achievement-reward">
                    {achievement.reward}
                  </div>
                </div>
              ))}
            </div>
            <Link to="/membership" className="view-all-link">
              View All Achievements
            </Link>
          </div>
        </div>
        
        {/* Daily Check-in Card */}
        <div className="analytics-card daily-checkin">
          <div className="card-header">
            <h2>Daily Check-in Streak</h2>
          </div>
          <div className="checkin-content">
            <div className="streak-summary">
              <div className="current-streak">
                <span className="streak-value">{checkInData.currentStreak}</span>
                <span className="streak-label">Current Streak</span>
              </div>
              <div className="streak-separator"></div>
              <div className="longest-streak">
                <span className="streak-value">{checkInData.longestStreak}</span>
                <span className="streak-label">Longest Streak</span>
              </div>
            </div>
            <div className="streak-calendar">
              {checkInData.streakHistory.map((day, index) => (
                <div 
                  key={index} 
                  className={`calendar-day ${day === 1 ? 'checked-in' : 'missed'}`}
                  title={day === 1 ? 'Checked In' : 'Missed'}
                >
                  {day === 1 ? '✓' : '×'}
                </div>
              ))}
            </div>
            <div className="next-milestone">
              <span className="milestone-label">Next Milestone:</span>
              <span className="milestone-value">{checkInData.nextMilestone} days</span>
              <span className="milestone-reward">+150 GT</span>
            </div>
            <Link to="/membership" className="check-in-btn">
              Check In Today
            </Link>
          </div>
        </div>
        
        {/* Referral Stats Card */}
        <div className="analytics-card referral-stats">
          <div className="card-header">
            <h2>Referral Program</h2>
          </div>
          <div className="referral-content">
            <div className="referral-code-container">
              <span className="referral-label">Your Referral Code:</span>
              <div className="referral-code">
                <span className="code-value">{userProfile.referralCode}</span>
                <button 
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(userProfile.referralCode);
                    alert('Referral code copied to clipboard!');
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="referral-stats-summary">
              <div className="stat-item">
                <span className="stat-value">{referralStats.totalReferrals}</span>
                <span className="stat-label">Total Referrals</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{referralStats.pendingReferrals}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{referralStats.referralTokensEarned} GT</span>
                <span className="stat-label">Tokens Earned</span>
              </div>
            </div>
            <div className="referral-leaderboard">
              <h3>Referral Leaderboard</h3>
              <div className="leaderboard-list">
                {referralStats.topReferrers.map((referrer, index) => (
                  <div 
                    key={index} 
                    className={`leaderboard-item ${referrer.name === 'You' ? 'is-you' : ''}`}
                  >
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{referrer.name}</span>
                    <span className="count">{referrer.referrals} referrals</span>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/membership" className="share-referral-btn">
              Share Your Referral Code
            </Link>
          </div>
        </div>
        
        {/* Activity Summary Card */}
        <div className="analytics-card activity-summary">
          <div className="card-header">
            <h2>Activity Summary</h2>
          </div>
          <div className="activity-content">
            <div className="activity-metrics">
              <div className="metric-item">
                <div className="metric-icon">📋</div>
                <div className="metric-info">
                  <span className="metric-value">{activityMetrics.proposalsCreated}</span>
                  <span className="metric-label">Proposals Created</span>
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-icon">🗳️</div>
                <div className="metric-info">
                  <span className="metric-value">{activityMetrics.proposalsVoted}</span>
                  <span className="metric-label">Proposals Voted</span>
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-icon">🌍</div>
                <div className="metric-info">
                  <span className="metric-value">{activityMetrics.challengesSupported}</span>
                  <span className="metric-label">Challenges Supported</span>
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-icon">💬</div>
                <div className="metric-info">
                  <span className="metric-value">{activityMetrics.commentsPosted}</span>
                  <span className="metric-label">Comments Posted</span>
                </div>
              </div>
            </div>
            <div className="last-active">
              <span className="last-active-label">Last Active:</span>
              <span className="last-active-value">{activityMetrics.lastActive}</span>
            </div>
            <div className="activity-cta">
              <Link to="/proposals" className="activity-btn">
                View Proposals
              </Link>
              <Link to="/challenges" className="activity-btn">
                Explore Challenges
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Token Growth Chart Card */}
      <div className="analytics-card token-growth">
        <div className="card-header">
          <h2>Token Growth Over Time</h2>
        </div>
        <div className="token-chart-content">
          <div className="chart-container">
            {/* In a real implementation, this would be a chart component */}
            <div className="placeholder-chart">
              <div className="chart-bars">
                {tokenHistory.map((entry, index) => (
                  <div key={index} className="chart-bar-container">
                    <div 
                      className="chart-bar" 
                      style={{ height: `${(entry.tokens / 1200) * 100}%` }}
                    ></div>
                    <span className="bar-label">{entry.date.split('-')[1]}/{entry.date.split('-')[2]}</span>
                  </div>
                ))}
              </div>
              <div className="chart-y-axis">
                <span>1200</span>
                <span>900</span>
                <span>600</span>
                <span>300</span>
                <span>0</span>
              </div>
            </div>
          </div>
          <div className="chart-summary">
            <div className="summary-item">
              <span className="summary-label">Starting Balance:</span>
              <span className="summary-value">{tokenHistory[0].tokens} GT</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Current Balance:</span>
              <span className="summary-value">{tokenHistory[tokenHistory.length - 1].tokens} GT</span>
            </div>
            <div className="summary-item growth">
              <span className="summary-label">Growth:</span>
              <span className="summary-value">
                +{tokenHistory[tokenHistory.length - 1].tokens - tokenHistory[0].tokens} GT
                ({Math.floor(((tokenHistory[tokenHistory.length - 1].tokens - tokenHistory[0].tokens) / tokenHistory[0].tokens) * 100)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics; 