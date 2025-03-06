import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { Link } from 'react-router-dom';
import './SocialFeed.css';
import DaoTrivia from '../components/DaoTrivia';

const SocialFeed = () => {
  const { account, isConnected } = useWeb3();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('community');
  
  // Game states
  const [showTrivia, setShowTrivia] = useState(false);
  const [recentRewards, setRecentRewards] = useState(null);
  
  // User profile state
  const [userProfile, setUserProfile] = useState({
    name: 'DAO Member',
    avatar: '',
    memberSince: '2023-03-05',
    bio: 'Passionate about decentralized governance and community building.',
    interests: ['Governance', 'DeFi', 'Community', 'Education'],
    following: 12,
    followers: 8
  });
  
  // Posts state
  const [posts, setPosts] = useState([
    {
      id: 'post1',
      author: {
        name: 'Alex',
        avatar: '',
        address: '0x1234...5678',
        isVerified: true
      },
      content: 'Just voted on the new treasury allocation proposal! Make sure to cast your vote before the deadline.',
      timestamp: '2023-03-04T14:30:00',
      likes: 24,
      comments: 5,
      shares: 3,
      type: 'activity',
      activityType: 'vote',
      liked: false
    },
    {
      id: 'post2',
      author: {
        name: 'Jordan',
        avatar: '',
        address: '0x2345...6789',
        isVerified: true
      },
      content: 'Excited to share that I just earned the "Proposal Creator" badge! Working on more proposals to improve our DAO.',
      timestamp: '2023-03-03T10:15:00',
      likes: 42,
      comments: 8,
      shares: 6,
      type: 'achievement',
      achievementId: 'create3',
      achievementTitle: 'Proposal Creator',
      liked: true
    },
    {
      id: 'post3',
      author: {
        name: 'Taylor',
        avatar: '',
        address: '0x3456...7890',
        isVerified: false
      },
      content: 'Looking for collaborators on a new education initiative for the DAO. DM me if interested!',
      timestamp: '2023-03-02T16:45:00',
      likes: 18,
      comments: 12,
      shares: 2,
      type: 'general',
      liked: false
    },
    {
      id: 'post4',
      author: {
        name: 'Morgan',
        avatar: '',
        address: '0x4567...8901',
        isVerified: true
      },
      content: 'Just reached a 7-day streak! The daily check-in rewards are really adding up.',
      timestamp: '2023-03-01T09:20:00',
      likes: 31,
      comments: 4,
      shares: 1,
      type: 'achievement',
      achievementId: 'streak7',
      achievementTitle: '7-Day Streak',
      liked: false
    },
    {
      id: 'post5',
      author: {
        name: 'System',
        avatar: '',
        address: '0x0000...0000',
        isVerified: true
      },
      content: 'Community Challenge: Reach 500 total members by the end of the month! Current progress: 278/500',
      timestamp: '2023-02-28T12:00:00',
      likes: 56,
      comments: 15,
      shares: 24,
      type: 'challenge',
      challengeProgress: 55.6,
      liked: true
    }
  ]);
  
  // Events state
  const [events, setEvents] = useState([
    {
      id: 'event1',
      title: 'DAO Town Hall',
      description: 'Monthly community meeting to discuss DAO progress and upcoming initiatives.',
      date: '2023-03-15T18:00:00',
      location: 'Discord Voice Channel',
      attendees: 45,
      isAttending: false
    },
    {
      id: 'event2',
      title: 'Governance Workshop',
      description: 'Learn how to create effective proposals and participate in governance.',
      date: '2023-03-20T15:00:00',
      location: 'Zoom Webinar',
      attendees: 32,
      isAttending: true
    },
    {
      id: 'event3',
      title: 'New Member Onboarding',
      description: 'Welcome session for new DAO members with Q&A and networking.',
      date: '2023-03-10T17:00:00',
      location: 'Discord Voice Channel',
      attendees: 18,
      isAttending: false
    }
  ]);
  
  // Trending topics
  const [trendingTopics, setTrendingTopics] = useState([
    { id: 'topic1', name: 'Treasury', count: 42 },
    { id: 'topic2', name: 'Governance', count: 38 },
    { id: 'topic3', name: 'Rewards', count: 27 },
    { id: 'topic4', name: 'Challenges', count: 23 },
    { id: 'topic5', name: 'Education', count: 19 }
  ]);
  
  // Suggested connections
  const [suggestedConnections, setSuggestedConnections] = useState([
    { id: 'user1', name: 'Casey', avatar: '', mutualConnections: 5, isFollowing: false },
    { id: 'user2', name: 'Riley', avatar: '', mutualConnections: 3, isFollowing: false },
    { id: 'user3', name: 'Quinn', avatar: '', mutualConnections: 2, isFollowing: false }
  ]);
  
  // New post state
  const [newPostContent, setNewPostContent] = useState('');
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // In a real implementation, this would fetch data from contracts and backend
        // For now, we'll use mock data
        
        // Generate avatar from account address
        if (account) {
          const avatarSeed = account.toLowerCase();
          // This would typically generate an avatar based on the address
          // For now, we'll just set a placeholder
          setUserProfile(prev => ({ 
            ...prev, 
            avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${avatarSeed}`,
            name: account.substring(0, 6) + '...' + account.substring(account.length - 4)
          }));
        }
        
        // Simulate loading delay
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching social feed data:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isConnected, account]);
  
  // Handle post submission
  const handlePostSubmit = (e) => {
    e.preventDefault();
    
    if (!newPostContent.trim()) return;
    
    const newPost = {
      id: `post${Date.now()}`,
      author: {
        name: userProfile.name,
        avatar: userProfile.avatar,
        address: account,
        isVerified: true
      },
      content: newPostContent,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      type: 'general',
      liked: false
    };
    
    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };
  
  // Handle like toggle
  const handleLikeToggle = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };
  
  // Handle event attendance toggle
  const handleAttendanceToggle = (eventId) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          isAttending: !event.isAttending,
          attendees: event.isAttending ? event.attendees - 1 : event.attendees + 1
        };
      }
      return event;
    }));
  };
  
  // Handle follow toggle
  const handleFollowToggle = (userId) => {
    setSuggestedConnections(suggestedConnections.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          isFollowing: !user.isFollowing
        };
      }
      return user;
    }));
  };
  
  // Handle game launch
  const handleGameLaunch = (gameType) => {
    if (gameType === 'trivia') {
      setShowTrivia(true);
    }
  };
  
  // Handle rewards earned from games
  const handleRewardsEarned = (amount) => {
    setRecentRewards({
      amount,
      timestamp: new Date().toISOString()
    });
    
    // In a real implementation, this would update the user's token balance
    // For now, we'll just create a post about it
    const rewardPost = {
      id: `post${Date.now()}`,
      author: {
        name: 'System',
        avatar: '',
        address: '0x0000...0000',
        isVerified: true
      },
      content: `${userProfile.name} just earned ${amount} GT tokens playing DAO Trivia! 🎮`,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      type: 'achievement',
      achievementId: 'trivia',
      achievementTitle: 'Trivia Master',
      liked: false
    };
    
    setPosts([rewardPost, ...posts]);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="page-container social-feed-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading social feed...</p>
        </div>
      </div>
    );
  }
  
  // Render not connected state
  if (!isConnected) {
    return (
      <div className="page-container social-feed-page">
        <div className="not-connected-container">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view the social feed.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page-container social-feed-page">
      {showTrivia && (
        <DaoTrivia 
          onClose={() => setShowTrivia(false)} 
          onRewardEarned={handleRewardsEarned} 
        />
      )}
      
      {recentRewards && (
        <div className="reward-notification">
          <div className="reward-notification-content">
            <span className="reward-icon">🎉</span>
            <div className="reward-message">
              <h4>Congratulations!</h4>
              <p>You earned {recentRewards.amount} GT tokens</p>
            </div>
            <button 
              className="close-notification-btn"
              onClick={() => setRecentRewards(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="social-header">
        <h1>DAO Social Feed</h1>
        <p className="social-subtitle">
          Connect with other members, share achievements, and participate in community activities
        </p>
      </div>
      
      <div className="social-layout">
        {/* Left Sidebar */}
        <div className="social-sidebar left-sidebar">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt={userProfile.name} />
                ) : (
                  <div className="avatar-placeholder">{userProfile.name.charAt(0)}</div>
                )}
              </div>
              <div className="profile-info">
                <h3>{userProfile.name}</h3>
                <p className="member-since">Member since {new Date(userProfile.memberSince).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{userProfile.following}</span>
                <span className="stat-label">Following</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userProfile.followers}</span>
                <span className="stat-label">Followers</span>
              </div>
            </div>
            <div className="profile-bio">
              <p>{userProfile.bio}</p>
            </div>
            <div className="profile-interests">
              <h4>Interests</h4>
              <div className="interest-tags">
                {userProfile.interests.map((interest, index) => (
                  <span key={index} className="interest-tag">{interest}</span>
                ))}
              </div>
            </div>
            <Link to="/analytics" className="view-profile-btn">
              View My Analytics
            </Link>
          </div>
          
          <div className="trending-card">
            <h3>Trending in the DAO</h3>
            <ul className="trending-list">
              {trendingTopics.map(topic => (
                <li key={topic.id} className="trending-item">
                  <span className="trending-name">#{topic.name}</span>
                  <span className="trending-count">{topic.count} posts</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="social-main">
          {/* Tabs */}
          <div className="social-tabs">
            <button 
              className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`}
              onClick={() => setActiveTab('community')}
            >
              Community Feed
            </button>
            <button 
              className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              Following
            </button>
            <button 
              className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              Achievements
            </button>
            <button 
              className={`tab-btn ${activeTab === 'challenges' ? 'active' : ''}`}
              onClick={() => setActiveTab('challenges')}
            >
              Challenges
            </button>
          </div>
          
          {/* New Post Form */}
          <div className="new-post-card">
            <form onSubmit={handlePostSubmit}>
              <div className="post-input-container">
                <div className="post-avatar">
                  {userProfile.avatar ? (
                    <img src={userProfile.avatar} alt={userProfile.name} />
                  ) : (
                    <div className="avatar-placeholder">{userProfile.name.charAt(0)}</div>
                  )}
                </div>
                <textarea
                  className="post-input"
                  placeholder="Share something with the community..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={3}
                ></textarea>
              </div>
              <div className="post-actions">
                <div className="post-attachments">
                  <button type="button" className="attachment-btn">
                    <span className="attachment-icon">📷</span>
                    <span className="attachment-label">Photo</span>
                  </button>
                  <button type="button" className="attachment-btn">
                    <span className="attachment-icon">🏆</span>
                    <span className="attachment-label">Achievement</span>
                  </button>
                  <button type="button" className="attachment-btn">
                    <span className="attachment-icon">📊</span>
                    <span className="attachment-label">Poll</span>
                  </button>
                </div>
                <button type="submit" className="post-submit-btn" disabled={!newPostContent.trim()}>
                  Post
                </button>
              </div>
            </form>
          </div>
          
          {/* Posts Feed */}
          <div className="posts-feed">
            {posts.filter(post => {
              if (activeTab === 'community') return true;
              if (activeTab === 'following') return post.author.name === 'Alex' || post.author.name === 'Jordan';
              if (activeTab === 'achievements') return post.type === 'achievement';
              if (activeTab === 'challenges') return post.type === 'challenge';
              return true;
            }).map(post => (
              <div key={post.id} className={`post-card ${post.type}-post`}>
                <div className="post-header">
                  <div className="post-avatar">
                    {post.author.avatar ? (
                      <img src={post.author.avatar} alt={post.author.name} />
                    ) : (
                      <div className="avatar-placeholder">{post.author.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="post-author-info">
                    <div className="author-name-container">
                      <h4 className="author-name">{post.author.name}</h4>
                      {post.author.isVerified && (
                        <span className="verified-badge" title="Verified Member">✓</span>
                      )}
                    </div>
                    <p className="post-timestamp">{formatDate(post.timestamp)}</p>
                  </div>
                </div>
                
                <div className="post-content">
                  <p>{post.content}</p>
                  
                  {post.type === 'achievement' && (
                    <div className="achievement-highlight">
                      <div className="achievement-icon">🏆</div>
                      <div className="achievement-info">
                        <h4>{post.achievementTitle}</h4>
                        <p>Achievement Unlocked</p>
                      </div>
                    </div>
                  )}
                  
                  {post.type === 'challenge' && (
                    <div className="challenge-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${post.challengeProgress}%` }}
                        ></div>
                      </div>
                      <p className="progress-text">{post.challengeProgress}% Complete</p>
                    </div>
                  )}
                </div>
                
                <div className="post-footer">
                  <button 
                    className={`post-action-btn ${post.liked ? 'active' : ''}`}
                    onClick={() => handleLikeToggle(post.id)}
                  >
                    <span className="action-icon">{post.liked ? '❤️' : '🤍'}</span>
                    <span className="action-count">{post.likes}</span>
                  </button>
                  <button className="post-action-btn">
                    <span className="action-icon">💬</span>
                    <span className="action-count">{post.comments}</span>
                  </button>
                  <button className="post-action-btn">
                    <span className="action-icon">🔄</span>
                    <span className="action-count">{post.shares}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="social-sidebar right-sidebar">
          <div className="events-card">
            <h3>Upcoming Events</h3>
            <div className="events-list">
              {events.map(event => (
                <div key={event.id} className="event-item">
                  <div className="event-date">
                    <span className="event-month">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="event-day">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <div className="event-details">
                    <h4 className="event-title">{event.title}</h4>
                    <p className="event-location">{event.location}</p>
                    <p className="event-attendees">{event.attendees} attending</p>
                    <button 
                      className={`event-attend-btn ${event.isAttending ? 'attending' : ''}`}
                      onClick={() => handleAttendanceToggle(event.id)}
                    >
                      {event.isAttending ? 'Attending' : 'Attend'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="view-all-events-btn">
              View All Events
            </button>
          </div>
          
          <div className="connections-card">
            <h3>Suggested Connections</h3>
            <div className="connections-list">
              {suggestedConnections.map(user => (
                <div key={user.id} className="connection-item">
                  <div className="connection-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <div className="avatar-placeholder">{user.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="connection-info">
                    <h4 className="connection-name">{user.name}</h4>
                    <p className="mutual-connections">{user.mutualConnections} mutual connections</p>
                  </div>
                  <button 
                    className={`follow-btn ${user.isFollowing ? 'following' : ''}`}
                    onClick={() => handleFollowToggle(user.id)}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
            <button className="view-all-connections-btn">
              View All Suggestions
            </button>
          </div>
          
          <div className="gamification-card">
            <h3>Fun & Games</h3>
            <div className="game-options">
              <div 
                className="game-option"
                onClick={() => handleGameLaunch('trivia')}
              >
                <div className="game-icon">🎮</div>
                <div className="game-info">
                  <h4>DAO Trivia</h4>
                  <p>Test your knowledge about the DAO and earn rewards</p>
                </div>
              </div>
              <div className="game-option">
                <div className="game-icon">🎲</div>
                <div className="game-info">
                  <h4>Daily Lottery</h4>
                  <p>Daily token giveaway for active members</p>
                </div>
              </div>
              <div className="game-option">
                <div className="game-icon">🏁</div>
                <div className="game-info">
                  <h4>Governance Race</h4>
                  <p>Compete to predict governance outcomes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialFeed; 