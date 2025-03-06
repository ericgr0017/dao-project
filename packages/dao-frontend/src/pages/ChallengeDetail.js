import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ChallengeDetail.css';

// Import the challenge categories data
import { challengeCategories } from './Challenges';

const ChallengeDetail = () => {
  const { categoryId, challengeId } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [category, setCategory] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [relatedProposals, setRelatedProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for related courses
    const mockCourses = [
      {
        id: 'course-1',
        title: 'Introduction to Climate Science',
        instructor: 'Dr. Jane Smith',
        duration: '6 weeks',
        enrolled: 1245,
        image: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      },
      {
        id: 'course-2',
        title: 'Renewable Energy Technologies',
        instructor: 'Prof. Michael Chen',
        duration: '8 weeks',
        enrolled: 987,
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80'
      },
      {
        id: 'course-3',
        title: 'Climate Policy and Governance',
        instructor: 'Dr. Sarah Johnson',
        duration: '5 weeks',
        enrolled: 756,
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      }
    ];

    // Mock data for related proposals
    const mockProposals = [
      {
        id: 'prop-1',
        title: 'Community Solar Initiative',
        status: 'active',
        votes: { for: 78, against: 12 },
        funding: '$120,000',
        deadline: '3 days'
      },
      {
        id: 'prop-2',
        title: 'Renewable Energy Education Program',
        status: 'pending',
        votes: { for: 0, against: 0 },
        funding: '$85,000',
        deadline: '2 weeks'
      },
      {
        id: 'prop-3',
        title: 'Carbon Capture Research Grant',
        status: 'succeeded',
        votes: { for: 92, against: 8 },
        funding: '$250,000',
        deadline: 'Completed'
      },
      {
        id: 'prop-4',
        title: 'Climate Resilience Infrastructure',
        status: 'active',
        votes: { for: 45, against: 32 },
        funding: '$350,000',
        deadline: '5 days'
      }
    ];

    // Success stories
    const successStories = [
      {
        id: 'story-1',
        title: 'Solar Microgrids in Rural Communities',
        description: 'Implementation of solar microgrids in 50 rural communities, providing clean energy to over 25,000 people.',
        image: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80'
      },
      {
        id: 'story-2',
        title: 'Green Building Initiative',
        description: 'Retrofitting of 200 buildings with energy-efficient systems, reducing carbon emissions by 15,000 tons annually.',
        image: 'https://images.unsplash.com/photo-1481026469463-66327c86e544?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2424&q=80'
      }
    ];

    // Find the challenge from our categories data
    const findChallenge = () => {
      const foundCategory = challengeCategories.find(cat => cat.id === categoryId);
      
      if (foundCategory) {
        setCategory(foundCategory);
        const foundChallenge = foundCategory.challenges.find(ch => ch.id === challengeId);
        
        if (foundChallenge) {
          // Enhance the challenge with additional mock data
          setChallenge({
            ...foundChallenge,
            categoryTitle: foundCategory.title,
            successStories: successStories,
            longDescription: `
              <p>${foundChallenge.description}</p>
              
              <p>This is one of the most critical challenges we face today. Through the Humanity DAO, we're bringing together experts, innovators, and advocates to address this issue comprehensively.</p>
              
              <p>Our community is working on proposals ranging from grassroots initiatives to policy advocacy, from technological innovations to educational campaigns.</p>
              
              <p>By participating in this challenge, you'll join a global network of changemakers committed to creating positive change and building a better future for all.</p>
            `,
            stats: {
              proposals: Math.floor(Math.random() * 30) + 10,
              activeProposals: Math.floor(Math.random() * 10) + 5,
              fundingAllocated: `$${(Math.random() * 2 + 0.5).toFixed(1)}M`,
              contributors: Math.floor(Math.random() * 200) + 50
            },
            keyIssues: [
              'Policy frameworks for accelerating adoption',
              'Community engagement and education',
              'Technological innovation and implementation',
              'Funding and resource allocation',
              'Measuring impact and effectiveness'
            ]
          });
          setLoading(false);
        } else {
          // Challenge not found, redirect to challenges page
          navigate('/challenges');
        }
      } else {
        // Category not found, redirect to challenges page
        navigate('/challenges');
      }
    };

    // Set related courses and proposals
    setRelatedCourses(mockCourses);
    setRelatedProposals(mockProposals);
    
    findChallenge();
  }, [categoryId, challengeId, navigate]);

  // Handle button clicks
  const handleCreateProposal = () => {
    navigate('/proposals');
  };

  const handleJoinWorkingGroup = () => {
    alert('Working group feature coming soon!');
  };

  const handleEnrollCourse = (courseTitle) => {
    alert(`You've enrolled in: ${courseTitle}`);
    navigate('/learning');
  };

  const handleViewProposal = (proposalId) => {
    alert(`Viewing proposal details for: ${proposalId}`);
    navigate('/proposals');
  };

  if (loading) {
    return (
      <div className="challenge-detail-container">
        <div className="loading">Loading challenge details...</div>
      </div>
    );
  }

  return (
    <div className="challenge-detail-container">
      {/* Hero Section */}
      <div className="challenge-hero" style={{ backgroundImage: `url(${challenge.image})` }}>
        <div className="challenge-hero-overlay"></div>
        <div className="challenge-hero-content">
          <span className="challenge-category">{category.title}</span>
          <h1>{challenge.title}</h1>
          <div className="challenge-actions">
            <button className="primary-btn" onClick={handleCreateProposal}>Create Proposal</button>
            <button className="secondary-btn" onClick={handleJoinWorkingGroup}>Join Working Group</button>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="challenge-stats">
        <div className="stat-card">
          <h3>{challenge.stats.proposals}</h3>
          <p>Total Proposals</p>
        </div>
        <div className="stat-card">
          <h3>{challenge.stats.activeProposals}</h3>
          <p>Active Proposals</p>
        </div>
        <div className="stat-card">
          <h3>{challenge.stats.fundingAllocated}</h3>
          <p>Funding Allocated</p>
        </div>
        <div className="stat-card">
          <h3>{challenge.stats.contributors}</h3>
          <p>Contributors</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="challenge-content">
        <div className="challenge-main">
          <section className="challenge-description">
            <h2>About this Challenge</h2>
            <div dangerouslySetInnerHTML={{ __html: challenge.longDescription }}></div>
          </section>

          <section className="key-issues">
            <h2>Key Issues</h2>
            <ul>
              {challenge.keyIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </section>

          <section className="success-stories">
            <h2>Success Stories</h2>
            <div className="stories-grid">
              {challenge.successStories.map(story => (
                <div className="story-card" key={story.id}>
                  <div className="story-image" style={{ backgroundImage: `url(${story.image})` }}></div>
                  <div className="story-content">
                    <h3>{story.title}</h3>
                    <p>{story.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="challenge-sidebar">
          <section className="related-courses">
            <h2>Related Courses</h2>
            {relatedCourses.map(course => (
              <div className="course-card" key={course.id}>
                <div className="course-image" style={{ backgroundImage: `url(${course.image})` }}></div>
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p className="course-instructor">By {course.instructor}</p>
                  <div className="course-meta">
                    <span>{course.duration}</span>
                    <span>{course.enrolled.toLocaleString()} enrolled</span>
                  </div>
                  <button className="course-btn" onClick={() => handleEnrollCourse(course.title)}>Enroll Now</button>
                </div>
              </div>
            ))}
            <a href="/learning" className="view-all">View All Courses</a>
          </section>
        </div>
      </div>

      {/* Proposals Section */}
      <section className="challenge-proposals">
        <h2>Related Proposals</h2>
        <div className="proposals-grid">
          {relatedProposals.map(proposal => (
            <div className={`proposal-card proposal-${proposal.status}`} key={proposal.id}>
              <h3>{proposal.title}</h3>
              <div className="proposal-meta">
                <span className={`proposal-status status-${proposal.status}`}>{proposal.status}</span>
                <span className="proposal-funding">{proposal.funding}</span>
              </div>
              <div className="proposal-votes">
                <div className="vote-bar">
                  <div 
                    className="vote-for" 
                    style={{ width: `${proposal.votes.for / (proposal.votes.for + proposal.votes.against || 1) * 100}%` }}
                  ></div>
                </div>
                <div className="vote-counts">
                  <span>For: {proposal.votes.for}</span>
                  <span>Against: {proposal.votes.against}</span>
                </div>
              </div>
              <div className="proposal-deadline">
                <span>Deadline: {proposal.deadline}</span>
              </div>
              <button className="view-proposal-btn" onClick={() => handleViewProposal(proposal.id)}>View Details</button>
            </div>
          ))}
        </div>
        <div className="view-all-wrapper">
          <a href="/proposals" className="view-all">View All Proposals</a>
        </div>
      </section>

      {/* Call to Action */}
      <section className="challenge-cta">
        <h2>Ready to Make a Difference?</h2>
        <p>Join our community of changemakers addressing this challenge</p>
        <div className="cta-buttons">
          <button className="primary-btn" onClick={handleCreateProposal}>Create a Proposal</button>
          <button className="secondary-btn" onClick={handleJoinWorkingGroup}>Join Working Group</button>
          <button className="tertiary-btn" onClick={() => navigate('/learning')}>Learn More</button>
        </div>
      </section>
    </div>
  );
};

export default ChallengeDetail; 