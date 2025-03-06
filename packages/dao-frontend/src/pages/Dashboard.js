import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { address, isConnected, contracts, balance, stakedBalance } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [daoStats, setDaoStats] = useState({
    totalMembers: '0',
    treasuryBalance: '0 ETH',
    totalProposals: '0',
    activeProposals: '0',
    tokenPrice: '$1.00',
    marketCap: '$0'
  });
  const [userStats, setUserStats] = useState({
    balance: '0',
    stakedBalance: '0',
    votingPower: '0%',
    reputation: '0',
    proposalsCreated: '0',
    proposalsVoted: '0'
  });
  const [recentProposals, setRecentProposals] = useState([]);
  const [userImpact, setUserImpact] = useState({
    challengesSupported: [],
    totalContribution: '0 ETH',
    impactScore: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!contracts.governanceToken || !contracts.proposalSystem || !contracts.treasury) return;
      
      try {
        setIsLoading(true);
        
        // For development/demo purposes
        if (contracts.governanceToken.isDevelopment) {
          // Use mock data
          setDaoStats({
            totalMembers: '1,245',
            treasuryBalance: '125.45 ETH',
            totalProposals: '48',
            activeProposals: '5',
            tokenPrice: '$1.00',
            marketCap: '$1,250,000'
          });
          
          if (isConnected) {
            setUserStats({
              balance: '1,000',
              stakedBalance: '500',
              votingPower: '0.04%',
              reputation: '750',
              proposalsCreated: '3',
              proposalsVoted: '12'
            });
          }
          
          setRecentProposals([
            {
              id: '1',
              title: 'Increase Developer Fund',
              state: 'Active',
              votesFor: '65%',
              votesAgainst: '35%',
              endTime: '2 days'
            },
            {
              id: '2',
              title: 'Add New Marketing Partner',
              state: 'Active',
              votesFor: '78%',
              votesAgainst: '22%',
              endTime: '1 day'
            },
            {
              id: '3',
              title: 'Reduce Token Emission Rate',
              state: 'Executed',
              votesFor: '82%',
              votesAgainst: '18%',
              endTime: 'Ended'
            }
          ]);
        } else {
          // Fetch real data from the contracts
          try {
            // Get treasury balance
            const treasuryBalance = await contracts.treasury.getBalance();
            
            // Get total supply
            const totalSupply = await contracts.governanceToken.totalSupply();
            
            // Get proposal count
            const proposalCount = await contracts.proposalSystem.getProposalCount();
            
            // Calculate active proposals (simplified)
            let activeProposalCount = 0;
            for (let i = 0; i < Math.min(proposalCount.toNumber(), 10); i++) {
              const proposal = await contracts.proposalSystem.getProposal(i);
              if (proposal.state === 1) { // Assuming 1 is the Active state
                activeProposalCount++;
              }
            }
            
            // Set DAO stats
            setDaoStats({
              totalMembers: '?', // We don't track this in our simple contract
              treasuryBalance: `${ethers.utils.formatEther(treasuryBalance)} ETH`,
              totalProposals: proposalCount.toString(),
              activeProposals: activeProposalCount.toString(),
              tokenPrice: '$1.00', // Simplified price
              marketCap: `$${ethers.utils.formatEther(totalSupply)}`
            });
            
            // Set user stats if connected
            if (isConnected && address) {
              // Get user's reputation from mock
              const reputation = await contracts.reputationSystem.getReputation(address);
              
              // Get proposals created by user
              let proposalsCreated = 0;
              let proposalsVoted = 0;
              
              for (let i = 0; i < Math.min(proposalCount.toNumber(), 10); i++) {
                const proposal = await contracts.proposalSystem.getProposal(i);
                
                if (proposal.proposer.toLowerCase() === address.toLowerCase()) {
                  proposalsCreated++;
                }
                
                // Check if user has voted on this proposal
                const hasVoted = await contracts.proposalSystem.hasVoted(i, address);
                if (hasVoted) {
                  proposalsVoted++;
                }
              }
              
              // Calculate voting power
              const totalStaked = await contracts.governanceToken.totalStaked();
              const votingPower = totalStaked.gt(0) && stakedBalance 
                ? (parseFloat(ethers.utils.formatEther(stakedBalance)) / parseFloat(ethers.utils.formatEther(totalStaked)) * 100).toFixed(2)
                : '0';
              
              setUserStats({
                balance: balance ? ethers.utils.formatEther(balance) : '0',
                stakedBalance: stakedBalance ? ethers.utils.formatEther(stakedBalance) : '0',
                votingPower: `${votingPower}%`,
                reputation: reputation.toString(),
                proposalsCreated: proposalsCreated.toString(),
                proposalsVoted: proposalsVoted.toString()
              });
            }
            
            // Get recent proposals
            const recentProposalsData = [];
            for (let i = Math.max(0, proposalCount.toNumber() - 3); i < proposalCount.toNumber(); i++) {
              const proposal = await contracts.proposalSystem.getProposal(i);
              
              // Convert state to string
              let stateStr;
              switch (proposal.state) {
                case 0: stateStr = 'Pending'; break;
                case 1: stateStr = 'Active'; break;
                case 2: stateStr = 'Defeated'; break;
                case 3: stateStr = 'Succeeded'; break;
                case 4: stateStr = 'Queued'; break;
                case 5: stateStr = 'Executed'; break;
                case 6: stateStr = 'Expired'; break;
                default: stateStr = 'Unknown';
              }
              
              // Calculate votes percentages
              const totalVotes = proposal.votesFor.add(proposal.votesAgainst);
              const votesForPercent = totalVotes.gt(0) 
                ? (parseFloat(ethers.utils.formatEther(proposal.votesFor)) / parseFloat(ethers.utils.formatEther(totalVotes)) * 100).toFixed(0)
                : '0';
              const votesAgainstPercent = totalVotes.gt(0)
                ? (parseFloat(ethers.utils.formatEther(proposal.votesAgainst)) / parseFloat(ethers.utils.formatEther(totalVotes)) * 100).toFixed(0)
                : '0';
              
              // Calculate end time
              const now = Math.floor(Date.now() / 1000);
              const endTime = proposal.endTime.toNumber();
              let endTimeStr;
              
              if (endTime > now) {
                const daysLeft = Math.floor((endTime - now) / 86400);
                const hoursLeft = Math.floor(((endTime - now) % 86400) / 3600);
                
                if (daysLeft > 0) {
                  endTimeStr = `${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
                } else {
                  endTimeStr = `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}`;
                }
              } else {
                endTimeStr = 'Ended';
              }
              
              recentProposalsData.push({
                id: i.toString(),
                title: proposal.title,
                state: stateStr,
                votesFor: `${votesForPercent}%`,
                votesAgainst: `${votesAgainstPercent}%`,
                endTime: endTimeStr
              });
            }
            
            setRecentProposals(recentProposalsData.reverse()); // Most recent first
          } catch (err) {
            console.error('Error fetching dashboard data:', err);
            // Fallback to empty data
            setDaoStats({
              totalMembers: '0',
              treasuryBalance: '0 ETH',
              totalProposals: '0',
              activeProposals: '0',
              tokenPrice: '$1.00',
              marketCap: '$0'
            });
            
            if (isConnected) {
              setUserStats({
                balance: '0',
                stakedBalance: '0',
                votingPower: '0%',
                reputation: '0',
                proposalsCreated: '0',
                proposalsVoted: '0'
              });
            }
            
            setRecentProposals([]);
          }
        }
      } catch (err) {
        console.error('Error in fetchDashboardData:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [contracts.governanceToken, contracts.proposalSystem, contracts.treasury, contracts.reputationSystem, isConnected, address, balance, stakedBalance]);
  
  // Calculate user impact (mock data for now)
  useEffect(() => {
    if (isConnected) {
      setUserImpact({
        challengesSupported: [
          { name: 'Climate Change', count: 3 },
          { name: 'Education', count: 2 },
          { name: 'Healthcare', count: 1 }
        ],
        totalContribution: '1.5 ETH',
        impactScore: 78
      });
    }
  }, [isConnected]);
  
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const getSuggestedActions = () => {
    if (!isConnected) {
      return [
        {
          title: 'Connect Your Wallet',
          description: 'Connect your wallet to participate in the DAO',
          action: 'Connect',
          path: '#'
        },
        {
          title: 'Learn About Benefits',
          description: 'Discover how you can benefit from joining the DAO',
          action: 'Learn More',
          path: '/benefits'
        },
        {
          title: 'Explore Challenges',
          description: 'See what global challenges we\'re addressing',
          action: 'Explore',
          path: '/challenges'
        }
      ];
    }

    const actions = [];

    // If user has low balance
    if (parseFloat(userStats.balance) < 10) {
      actions.push({
        title: 'Get DAO Tokens',
        description: 'Acquire tokens to increase your voting power',
        action: 'Get Tokens',
        path: '/treasury'
      });
    }

    // If user has tokens but hasn't staked
    if (parseFloat(userStats.balance) > 0 && parseFloat(userStats.stakedBalance) === 0) {
      actions.push({
        title: 'Stake Your Tokens',
        description: 'Stake tokens to participate in governance',
        action: 'Stake',
        path: '/governance'
      });
    }

    // If user hasn't voted recently
    if (parseInt(userStats.proposalsVoted) < 5) {
      actions.push({
        title: 'Vote on Proposals',
        description: 'Make your voice heard on active proposals',
        action: 'Vote',
        path: '/proposals'
      });
    }

    // If user hasn't created proposals
    if (parseInt(userStats.proposalsCreated) < 2) {
      actions.push({
        title: 'Create a Proposal',
        description: 'Suggest a solution to a global challenge',
        action: 'Create',
        path: '/challenges'
      });
    }

    // Always suggest exploring challenges
    actions.push({
      title: 'Explore Challenges',
      description: 'Discover global challenges that need solutions',
      action: 'Explore',
      path: '/challenges'
    });

    return actions.slice(0, 3); // Return top 3 actions
  };
  
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>{isConnected ? 'Your DAO Dashboard' : 'DAO Dashboard'}</h1>
        <p className="page-description">
          {isConnected 
            ? `Welcome back! Track your impact and participation in Humanity DAO.`
            : `Connect your wallet to join Humanity DAO and help address global challenges.`}
        </p>
      </div>
      
      <div className="dashboard-content">
        {!isConnected && (
          <div className="connect-banner">
            <div className="connect-banner-content">
              <h2>Join Humanity DAO</h2>
              <p>Connect your wallet to participate in governance and help address humanity's greatest challenges</p>
              <div className="connect-banner-actions">
                <button className="primary-btn" onClick={() => {}}>Connect Wallet</button>
                <button className="secondary-btn" onClick={() => navigate('/benefits')}>Learn About Benefits</button>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-grid">
          {isConnected && (
            <div className="dashboard-card user-profile-card">
              <div className="user-profile-header">
                <div className="user-avatar">{address ? address.substring(2, 4).toUpperCase() : '??'}</div>
                <div className="user-info">
                  <h2>Your Profile</h2>
                  <p className="user-address">{formatAddress(address)}</p>
                </div>
              </div>
              
              {isLoading ? (
                <div className="loading">Loading your information...</div>
              ) : (
                <div className="user-stats">
                  <div className="user-stats-grid">
                    <div className="user-stat-card">
                      <div className="stat-value">{userStats.balance}</div>
                      <div className="stat-label">Token Balance</div>
                    </div>
                    <div className="user-stat-card">
                      <div className="stat-value">{userStats.stakedBalance}</div>
                      <div className="stat-label">Staked Tokens</div>
                    </div>
                    <div className="user-stat-card">
                      <div className="stat-value">{userStats.votingPower}</div>
                      <div className="stat-label">Voting Power</div>
                    </div>
                    <div className="user-stat-card">
                      <div className="stat-value">{userStats.reputation}</div>
                      <div className="stat-label">Reputation</div>
                    </div>
                  </div>
                  
                  <div className="user-activity">
                    <h3>Your Activity</h3>
                    <div className="activity-stats">
                      <div className="activity-stat">
                        <span className="activity-label">Proposals Created:</span>
                        <span className="activity-value">{userStats.proposalsCreated}</span>
                      </div>
                      <div className="activity-stat">
                        <span className="activity-label">Proposals Voted:</span>
                        <span className="activity-value">{userStats.proposalsVoted}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {isConnected && (
            <div className="dashboard-card impact-card">
              <h2>Your Impact</h2>
              {isLoading ? (
                <div className="loading">Calculating your impact...</div>
              ) : (
                <div className="impact-content">
                  <div className="impact-score">
                    <div className="score-circle">
                      <span className="score-value">{userImpact.impactScore}</span>
                    </div>
                    <div className="score-label">Impact Score</div>
                  </div>
                  
                  <div className="impact-details">
                    <div className="impact-detail">
                      <span className="impact-label">Total Contribution:</span>
                      <span className="impact-value">{userImpact.totalContribution}</span>
                    </div>
                    
                    <div className="impact-challenges">
                      <h4>Challenges Supported:</h4>
                      <div className="challenges-list">
                        {userImpact.challengesSupported.map((challenge, index) => (
                          <div key={index} className="challenge-item">
                            <span className="challenge-name">{challenge.name}</span>
                            <span className="challenge-count">{challenge.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="dashboard-card">
            <h2>DAO Statistics</h2>
            {isLoading ? (
              <div className="loading">Loading DAO statistics...</div>
            ) : (
              <div className="dao-stats">
                <div className="dao-stats-grid">
                  <div className="dao-stat-card">
                    <div className="stat-value">{daoStats.treasuryBalance}</div>
                    <div className="stat-label">Treasury</div>
                  </div>
                  <div className="dao-stat-card">
                    <div className="stat-value">{daoStats.totalProposals}</div>
                    <div className="stat-label">Total Proposals</div>
                  </div>
                  <div className="dao-stat-card">
                    <div className="stat-value">{daoStats.activeProposals}</div>
                    <div className="stat-label">Active Proposals</div>
                  </div>
                  <div className="dao-stat-card">
                    <div className="stat-value">{daoStats.totalMembers}</div>
                    <div className="stat-label">Members</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="dashboard-card suggested-actions-card">
            <h2>Suggested Actions</h2>
            <div className="suggested-actions">
              {getSuggestedActions().map((action, index) => (
                <div key={index} className="action-card">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                  <button 
                    className="action-btn"
                    onClick={() => navigate(action.path)}
                  >
                    {action.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="dashboard-card">
            <h2>Recent Proposals</h2>
            {isLoading ? (
              <div className="loading">Loading recent proposals...</div>
            ) : recentProposals.length === 0 ? (
              <p>No proposals found.</p>
            ) : (
              <div className="recent-proposals">
                {recentProposals.map(proposal => (
                  <Link to={`/proposals?id=${proposal.id}`} key={proposal.id} className="proposal-item">
                    <div className="proposal-header">
                      <h3>{proposal.title}</h3>
                      <span className={`proposal-state ${proposal.state.toLowerCase()}`}>
                        {proposal.state}
                      </span>
                    </div>
                    <div className="proposal-votes">
                      <div className="votes-bar">
                        <div 
                          className="votes-for" 
                          style={{ width: proposal.votesFor }}
                        ></div>
                        <div 
                          className="votes-against" 
                          style={{ width: proposal.votesAgainst }}
                        ></div>
                      </div>
                      <div className="votes-text">
                        <span className="votes-for-text">{proposal.votesFor} For</span>
                        <span className="votes-against-text">{proposal.votesAgainst} Against</span>
                      </div>
                    </div>
                    <div className="proposal-footer">
                      <span className="proposal-time">Ends in: {proposal.endTime}</span>
                    </div>
                  </Link>
                ))}
                <div className="view-all-proposals">
                  <Link to="/proposals" className="view-all-link">View All Proposals</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 