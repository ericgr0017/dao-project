import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import './Learning.css';

const Learning = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { isConnected } = useWeb3();
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [discussionPosts, setDiscussionPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  // Mock data for courses
  const courses = [
    {
      id: 'climate-change',
      title: 'Climate Change: Understanding and Solutions',
      category: 'Climate Change',
      description: 'Learn about the science of climate change, its impacts, and innovative solutions being developed worldwide.',
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      duration: '6 weeks',
      modules: [
        { id: 1, title: 'The Science of Climate Change', completed: false },
        { id: 2, title: 'Global Impacts and Vulnerabilities', completed: false },
        { id: 3, title: 'Mitigation Strategies', completed: false },
        { id: 4, title: 'Adaptation Approaches', completed: false },
        { id: 5, title: 'Policy and Governance', completed: false },
        { id: 6, title: 'Capstone Project: Design a Climate Solution', completed: false }
      ],
      instructors: [
        { name: 'Dr. Sarah Johnson', title: 'Climate Scientist', organization: 'Global Climate Institute' }
      ],
      enrolledCount: 1245,
      completionRate: 68,
      certificateAvailable: true
    },
    {
      id: 'food-security',
      title: 'Food Security in a Changing World',
      category: 'Food Security',
      description: 'Explore the challenges of feeding a growing population sustainably and equitably in the face of climate change and resource constraints.',
      image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      duration: '5 weeks',
      modules: [
        { id: 1, title: 'Global Food Systems Overview', completed: false },
        { id: 2, title: 'Challenges to Food Security', completed: false },
        { id: 3, title: 'Sustainable Agriculture Practices', completed: false },
        { id: 4, title: 'Food Distribution and Access', completed: false },
        { id: 5, title: 'Capstone Project: Design a Food Security Initiative', completed: false }
      ],
      instructors: [
        { name: 'Prof. Miguel Rodriguez', title: 'Agricultural Economist', organization: 'World Food Institute' }
      ],
      enrolledCount: 876,
      completionRate: 72,
      certificateAvailable: true
    },
    {
      id: 'education-access',
      title: 'Education Access: Bridging the Global Gap',
      category: 'Education',
      description: 'Understand the barriers to education worldwide and explore innovative approaches to increase access and quality for all.',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      duration: '4 weeks',
      modules: [
        { id: 1, title: 'Global Education Landscape', completed: false },
        { id: 2, title: 'Barriers to Education Access', completed: false },
        { id: 3, title: 'Technology and Education', completed: false },
        { id: 4, title: 'Capstone Project: Design an Education Access Solution', completed: false }
      ],
      instructors: [
        { name: 'Dr. Amina Patel', title: 'Education Policy Expert', organization: 'Global Education Alliance' }
      ],
      enrolledCount: 1032,
      completionRate: 65,
      certificateAvailable: true
    },
    {
      id: 'healthcare-innovation',
      title: 'Healthcare Innovation for Global Challenges',
      category: 'Healthcare',
      description: 'Explore innovative approaches to healthcare delivery, focusing on accessibility, affordability, and quality in diverse global contexts.',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      duration: '6 weeks',
      modules: [
        { id: 1, title: 'Global Health Challenges', completed: false },
        { id: 2, title: 'Healthcare Systems and Access', completed: false },
        { id: 3, title: 'Digital Health Solutions', completed: false },
        { id: 4, title: 'Community-Based Healthcare', completed: false },
        { id: 5, title: 'Health Policy and Financing', completed: false },
        { id: 6, title: 'Capstone Project: Design a Healthcare Innovation', completed: false }
      ],
      instructors: [
        { name: 'Dr. Thomas Chen', title: 'Global Health Specialist', organization: 'Health Innovation Lab' }
      ],
      enrolledCount: 945,
      completionRate: 70,
      certificateAvailable: true
    },
    {
      id: 'clean-water',
      title: 'Clean Water Solutions for Communities',
      category: 'Water Access',
      description: 'Learn about water scarcity, contamination issues, and innovative solutions for providing clean water to communities worldwide.',
      image: 'https://images.unsplash.com/photo-1581022295087-35e593704911?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      duration: '5 weeks',
      modules: [
        { id: 1, title: 'Global Water Crisis Overview', completed: false },
        { id: 2, title: 'Water Quality and Contamination', completed: false },
        { id: 3, title: 'Water Treatment Technologies', completed: false },
        { id: 4, title: 'Community Water Management', completed: false },
        { id: 5, title: 'Capstone Project: Design a Water Access Solution', completed: false }
      ],
      instructors: [
        { name: 'Prof. Elena Morales', title: 'Water Resources Engineer', organization: 'Clean Water Institute' }
      ],
      enrolledCount: 789,
      completionRate: 75,
      certificateAvailable: true
    }
  ];

  // Mock discussion data
  const mockDiscussions = [
    {
      id: 1,
      courseId: 'climate-change',
      author: 'Maria S.',
      avatar: 'MS',
      date: '2 days ago',
      content: 'I found the section on carbon capture technologies particularly interesting. Has anyone implemented any of these solutions in their local communities?',
      likes: 12,
      replies: 5
    },
    {
      id: 2,
      courseId: 'climate-change',
      author: 'James T.',
      avatar: 'JT',
      date: '3 days ago',
      content: 'For my capstone project, I\'m thinking of designing a community-based renewable energy initiative. Would love to connect with others who have experience in this area.',
      likes: 8,
      replies: 3
    },
    {
      id: 3,
      courseId: 'food-security',
      author: 'Aisha L.',
      avatar: 'AL',
      date: '1 day ago',
      content: 'The vertical farming module was eye-opening. I\'m researching how to implement a small-scale version for urban communities with limited space.',
      likes: 15,
      replies: 7
    }
  ];

  // Load course if courseId is provided in URL
  useEffect(() => {
    if (courseId) {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        setSelectedCourse(course);
        setActiveTab('course-details');
        
        // Load discussions for this course
        const relevantDiscussions = mockDiscussions.filter(d => d.courseId === courseId);
        setDiscussionPosts(relevantDiscussions);
      }
    }
  }, [courseId]);

  // Mock function to handle enrollment
  const handleEnroll = (course) => {
    if (!isConnected) {
      navigate('/dashboard');
      return;
    }
    
    // In a real app, this would call an API to enroll the user
    setUserProgress(prev => ({
      ...prev,
      [course.id]: { enrolled: true, completedModules: [], certificateEarned: false }
    }));
    
    setSelectedCourse(course);
    setActiveTab('course-details');
    navigate(`/learning/course/${course.id}`);
  };

  // Handle posting to discussion
  const handlePostDiscussion = () => {
    if (!newPost.trim() || !selectedCourse) return;
    
    const newDiscussion = {
      id: discussionPosts.length + 1,
      courseId: selectedCourse.id,
      author: 'You',
      avatar: 'YO',
      date: 'Just now',
      content: newPost,
      likes: 0,
      replies: 0
    };
    
    setDiscussionPosts([newDiscussion, ...discussionPosts]);
    setNewPost('');
  };

  // Render course catalog
  const renderCourseCatalog = () => (
    <div className="course-catalog">
      <div className="catalog-header">
        <h2>Certificate Courses</h2>
        <p>Learn about global challenges and earn certificates by completing courses and capstone projects</p>
      </div>
      
      <div className="course-filters">
        <div className="filter-group">
          <label>Filter by Category:</label>
          <select>
            <option value="">All Categories</option>
            <option value="climate-change">Climate Change</option>
            <option value="food-security">Food Security</option>
            <option value="education">Education</option>
            <option value="healthcare">Healthcare</option>
            <option value="water-access">Water Access</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Sort by:</label>
          <select>
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="completion">Highest Completion Rate</option>
          </select>
        </div>
      </div>
      
      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-image" style={{ backgroundImage: `url(${course.image})` }}>
              <div className="course-category">{course.category}</div>
            </div>
            <div className="course-content">
              <h3>{course.title}</h3>
              <p className="course-description">{course.description}</p>
              <div className="course-meta">
                <span className="course-duration"><i className="icon-clock"></i> {course.duration}</span>
                <span className="course-students"><i className="icon-users"></i> {course.enrolledCount} enrolled</span>
              </div>
              <div className="course-instructors">
                {course.instructors.map((instructor, idx) => (
                  <div key={idx} className="instructor">
                    <span className="instructor-name">{instructor.name}</span>
                    <span className="instructor-title">{instructor.title}</span>
                  </div>
                ))}
              </div>
              <button 
                className="enroll-button"
                onClick={() => handleEnroll(course)}
              >
                {userProgress[course.id]?.enrolled ? 'Continue Learning' : 'Enroll Now'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render course details
  const renderCourseDetails = () => {
    if (!selectedCourse) return null;
    
    return (
      <div className="course-details">
        <div className="course-header" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${selectedCourse.image})` }}>
          <div className="course-header-content">
            <div className="course-category">{selectedCourse.category}</div>
            <h1>{selectedCourse.title}</h1>
            <p>{selectedCourse.description}</p>
            <div className="course-meta">
              <span className="course-duration"><i className="icon-clock"></i> {selectedCourse.duration}</span>
              <span className="course-students"><i className="icon-users"></i> {selectedCourse.enrolledCount} enrolled</span>
              <span className="course-completion"><i className="icon-chart"></i> {selectedCourse.completionRate}% completion rate</span>
            </div>
          </div>
        </div>
        
        <div className="course-navigation">
          <button 
            className={`nav-button ${activeTab === 'course-details' ? 'active' : ''}`}
            onClick={() => setActiveTab('course-details')}
          >
            Course Content
          </button>
          <button 
            className={`nav-button ${activeTab === 'discussion' ? 'active' : ''}`}
            onClick={() => setActiveTab('discussion')}
          >
            Discussion Forum
          </button>
          <button 
            className={`nav-button ${activeTab === 'capstone' ? 'active' : ''}`}
            onClick={() => setActiveTab('capstone')}
          >
            Capstone Project
          </button>
          <button 
            className={`nav-button ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </button>
        </div>
        
        <div className="course-content-container">
          {activeTab === 'course-details' && (
            <div className="modules-list">
              <h2>Course Modules</h2>
              {selectedCourse.modules.map(module => (
                <div key={module.id} className={`module-item ${module.completed ? 'completed' : ''}`}>
                  <div className="module-status">
                    {module.completed ? (
                      <div className="status-icon completed">✓</div>
                    ) : (
                      <div className="status-icon">○</div>
                    )}
                  </div>
                  <div className="module-content">
                    <h3>{module.title}</h3>
                    {module.id === selectedCourse.modules.length ? (
                      <span className="module-tag capstone">Capstone Project</span>
                    ) : (
                      <span className="module-tag">Module {module.id}</span>
                    )}
                  </div>
                  <button className="start-module-btn">
                    {module.completed ? 'Review' : 'Start'}
                  </button>
                </div>
              ))}
              
              <div className="course-progress">
                <h3>Your Progress</h3>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${userProgress[selectedCourse.id]?.completedModules?.length / selectedCourse.modules.length * 100 || 0}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {userProgress[selectedCourse.id]?.completedModules?.length || 0} of {selectedCourse.modules.length} modules completed
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'discussion' && (
            <div className="discussion-forum">
              <h2>Discussion Forum</h2>
              <p className="forum-description">
                Connect with fellow learners, share insights, and discuss course topics.
              </p>
              
              <div className="post-form">
                <textarea 
                  placeholder="Share your thoughts or questions with the community..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                ></textarea>
                <button 
                  className="post-button"
                  onClick={handlePostDiscussion}
                  disabled={!newPost.trim()}
                >
                  Post to Forum
                </button>
              </div>
              
              <div className="discussion-posts">
                {discussionPosts.length > 0 ? (
                  discussionPosts.map(post => (
                    <div key={post.id} className="discussion-post">
                      <div className="post-author">
                        <div className="author-avatar">{post.avatar}</div>
                        <div className="author-info">
                          <div className="author-name">{post.author}</div>
                          <div className="post-date">{post.date}</div>
                        </div>
                      </div>
                      <div className="post-content">
                        {post.content}
                      </div>
                      <div className="post-actions">
                        <button className="action-button">
                          <i className="icon-heart"></i> Like ({post.likes})
                        </button>
                        <button className="action-button">
                          <i className="icon-reply"></i> Reply ({post.replies})
                        </button>
                        <button className="action-button">
                          <i className="icon-share"></i> Share
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-posts">
                    <p>Be the first to start a discussion about this course!</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'capstone' && (
            <div className="capstone-project">
              <h2>Capstone Project</h2>
              <div className="capstone-info">
                <p>
                  The capstone project is your opportunity to apply what you've learned in this course to create a real-world solution. 
                  Your completed project can be submitted as a proposal to the DAO for potential funding and implementation.
                </p>
                
                <div className="capstone-steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h3>Define the Problem</h3>
                      <p>Clearly articulate a specific problem related to {selectedCourse.category} that your solution will address.</p>
                    </div>
                  </div>
                  
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3>Research Existing Solutions</h3>
                      <p>Analyze what's already being done and identify gaps or opportunities for improvement.</p>
                    </div>
                  </div>
                  
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h3>Design Your Solution</h3>
                      <p>Create a detailed plan for your solution, including implementation steps, resources needed, and expected outcomes.</p>
                    </div>
                  </div>
                  
                  <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h3>Submit as a DAO Proposal</h3>
                      <p>Transform your project into a formal proposal that can be voted on by DAO members for potential funding.</p>
                    </div>
                  </div>
                </div>
                
                <div className="capstone-templates">
                  <h3>Project Templates and Resources</h3>
                  <ul className="template-list">
                    <li>
                      <i className="icon-document"></i>
                      <span>Capstone Project Template</span>
                      <button className="download-btn">Download</button>
                    </li>
                    <li>
                      <i className="icon-document"></i>
                      <span>DAO Proposal Format Guide</span>
                      <button className="download-btn">Download</button>
                    </li>
                    <li>
                      <i className="icon-document"></i>
                      <span>Impact Assessment Framework</span>
                      <button className="download-btn">Download</button>
                    </li>
                  </ul>
                </div>
                
                <div className="submit-capstone">
                  <h3>Ready to Submit Your Project?</h3>
                  <p>Once you've completed your capstone project, you can submit it directly as a proposal to the DAO.</p>
                  <button 
                    className="submit-project-btn"
                    onClick={() => navigate('/proposals/create')}
                  >
                    Submit as DAO Proposal
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'resources' && (
            <div className="course-resources">
              <h2>Additional Resources</h2>
              <p>Expand your knowledge with these carefully selected resources.</p>
              
              <div className="resources-grid">
                <div className="resource-card">
                  <div className="resource-icon"><i className="icon-book"></i></div>
                  <div className="resource-content">
                    <h3>Recommended Reading</h3>
                    <ul>
                      <li><a href="https://example.com" target="_blank" rel="noopener noreferrer">The Future of Global Challenges</a></li>
                      <li><a href="https://example.com" target="_blank" rel="noopener noreferrer">Solutions for a Changing World</a></li>
                      <li><a href="https://example.com" target="_blank" rel="noopener noreferrer">Community-Based Approaches to Global Problems</a></li>
                    </ul>
                  </div>
                </div>
                
                <div className="resource-card">
                  <div className="resource-icon"><i className="icon-video"></i></div>
                  <div className="resource-content">
                    <h3>Video Lectures</h3>
                    <ul>
                      <li><a href="https://example.com" target="_blank" rel="noopener noreferrer">Expert Panel: Future Trends in {selectedCourse.category}</a></li>
                      <li><a href="https://example.com" target="_blank" rel="noopener noreferrer">Case Studies: Successful Implementations</a></li>
                      <li><a href="https://example.com" target="_blank" rel="noopener noreferrer">Field Research Insights</a></li>
                    </ul>
                  </div>
                </div>
                
                <div className="resource-card">
                  <div className="resource-icon"><i className="icon-tools"></i></div>
                  <div className="resource-content">
                    <h3>Tools & Templates</h3>
                    <ul>
                      <li><a href="https://example.com" target="_blank" rel="noopener noreferrer">Solution Design Framework</a></li>
                      <li><a href="https://example.com" target="_blank" rel="noopener noreferrer">Impact Assessment Tool</a></li>
                      <li><a href="https://example.com" target="_blank" rel="noopener noreferrer">Implementation Planning Template</a></li>
                    </ul>
                  </div>
                </div>
                
                <div className="resource-card">
                  <div className="resource-icon"><i className="icon-globe"></i></div>
                  <div className="resource-content">
                    <h3>Organizations & Communities</h3>
                    <ul>
                      <li><a href="https://example.com" target="_blank" rel="noopener noreferrer">Global {selectedCourse.category} Network</a></li>
                      <li><a href="https://example.com" target="_blank" rel="noopener noreferrer">Innovators Community</a></li>
                      <li><a href="https://example.com" target="_blank" rel="noopener noreferrer">Practitioners Forum</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render my learning dashboard
  const renderMyLearning = () => (
    <div className="my-learning">
      <h2>My Learning Dashboard</h2>
      
      {Object.keys(userProgress).length > 0 ? (
        <div className="enrolled-courses">
          <h3>Enrolled Courses</h3>
          <div className="courses-grid">
            {courses
              .filter(course => userProgress[course.id]?.enrolled)
              .map(course => {
                const progress = userProgress[course.id];
                const completedCount = progress?.completedModules?.length || 0;
                const progressPercent = (completedCount / course.modules.length) * 100;
                
                return (
                  <div key={course.id} className="enrolled-course-card">
                    <div className="course-image" style={{ backgroundImage: `url(${course.image})` }}>
                      <div className="course-category">{course.category}</div>
                    </div>
                    <div className="course-content">
                      <h3>{course.title}</h3>
                      <div className="progress-indicator">
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                        <div className="progress-text">
                          {completedCount} of {course.modules.length} modules completed
                        </div>
                      </div>
                      <button 
                        className="continue-button"
                        onClick={() => {
                          setSelectedCourse(course);
                          setActiveTab('course-details');
                          navigate(`/learning/course/${course.id}`);
                        }}
                      >
                        Continue Learning
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <div className="no-courses">
          <p>You haven't enrolled in any courses yet.</p>
          <button 
            className="browse-courses-btn"
            onClick={() => setActiveTab('courses')}
          >
            Browse Courses
          </button>
        </div>
      )}
      
      <div className="certificates-section">
        <h3>My Certificates</h3>
        {Object.values(userProgress).some(p => p.certificateEarned) ? (
          <div className="certificates-grid">
            {courses
              .filter(course => userProgress[course.id]?.certificateEarned)
              .map(course => (
                <div key={course.id} className="certificate-card">
                  <div className="certificate-icon"><i className="icon-certificate"></i></div>
                  <div className="certificate-content">
                    <h4>{course.title}</h4>
                    <p>Completed on: January 15, 2023</p>
                    <button className="view-certificate-btn">View Certificate</button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="no-certificates">
            Complete a course and its capstone project to earn a certificate.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="learning-container">
      <div className="learning-header">
        <h1>Learning Hub</h1>
        <p>Deepen your understanding of global challenges and develop skills to create impactful solutions</p>
      </div>
      
      <div className="learning-tabs">
        <button 
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('courses');
            if (courseId) navigate('/learning');
          }}
        >
          Course Catalog
        </button>
        <button 
          className={`tab-button ${activeTab === 'my-learning' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('my-learning');
            if (courseId) navigate('/learning');
          }}
        >
          My Learning
        </button>
        {selectedCourse && (
          <button 
            className={`tab-button ${['course-details', 'discussion', 'capstone', 'resources'].includes(activeTab) ? 'active' : ''}`}
          >
            {selectedCourse.title}
          </button>
        )}
      </div>
      
      <div className="learning-content">
        {activeTab === 'courses' && renderCourseCatalog()}
        {activeTab === 'my-learning' && renderMyLearning()}
        {['course-details', 'discussion', 'capstone', 'resources'].includes(activeTab) && renderCourseDetails()}
      </div>
    </div>
  );
};

export default Learning; 