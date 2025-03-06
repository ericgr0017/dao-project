import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    description: '',
    solutions: []
  });

  // Categories of global challenges
  const challengeCategories = [
    {
      id: 'existential',
      title: 'Existential Risks',
      description: 'Addressing threats to human survival including climate change, nuclear war, pandemics, AI misuse, and cosmic risks.',
      icon: '⚠️',
      color: '#FF5252'
    },
    {
      id: 'structural',
      title: 'Structural Failures',
      description: 'Fixing broken education systems, economic inequality, ineffective governance, failing healthcare, and misinformation.',
      icon: '🏛️',
      color: '#FFC107'
    },
    {
      id: 'wellbeing',
      title: 'Human Well-Being',
      description: 'Addressing mental health crisis, loss of meaning and community, decline in trust, and purpose in an AI-driven world.',
      icon: '🧠',
      color: '#2196F3'
    },
    {
      id: 'ethical',
      title: 'Ethical Challenges',
      description: 'Navigating technological ethics, human rights violations, and overconsumption and waste.',
      icon: '⚖️',
      color: '#9C27B0'
    },
    {
      id: 'vision',
      title: 'Unified Vision',
      description: 'Combating short-term thinking, promoting global cooperation, and evolving human consciousness.',
      icon: '🔭',
      color: '#4CAF50'
    }
  ];

  // Detailed information for each topic
  const topicDetails = {
    // Existential Risks
    'climate-change': {
      title: 'Climate Change',
      description: 'Climate change is causing rising temperatures, extreme weather events, and disruptions to ecosystems worldwide. These changes threaten food security, water availability, and habitability of many regions. The increasing frequency of natural disasters displaces communities and strains resources.',
      solutions: [
        'Transition to renewable energy sources like solar, wind, and hydroelectric power',
        'Implement carbon pricing mechanisms to reduce emissions',
        'Develop sustainable agriculture and forestry practices',
        'Invest in climate adaptation infrastructure',
        'Support research into carbon capture and storage technologies'
      ]
    },
    'nuclear-war': {
      title: 'Nuclear War',
      description: 'The threat of nuclear conflict remains one of humanity\'s greatest existential risks. Current geopolitical tensions, proliferation of nuclear weapons, and aging security systems increase the likelihood of catastrophic events, whether intentional or accidental.',
      solutions: [
        'Strengthen international disarmament treaties and verification mechanisms',
        'Implement fail-safe technologies to prevent accidental launches',
        'Promote diplomatic solutions to international conflicts',
        'Reduce nuclear arsenals globally',
        'Develop better early warning systems and crisis communication channels'
      ]
    },
    'pandemics': {
      title: 'Pandemics & Biotech Risks',
      description: 'Natural and engineered pathogens pose significant threats to global health security. Increasing global travel, urbanization, and climate change create conditions for rapid disease spread. Meanwhile, advances in biotechnology could enable the creation of engineered pathogens with unprecedented virulence.',
      solutions: [
        'Strengthen global health surveillance systems',
        'Invest in rapid vaccine development platforms',
        'Establish international governance frameworks for bioresearch',
        'Improve healthcare infrastructure in vulnerable regions',
        'Develop better pandemic preparedness plans and stockpiles'
      ]
    },
    'ai-misuse': {
      title: 'Artificial Intelligence Misuse',
      description: 'Advanced AI systems could pose risks if misaligned with human values or weaponized. Potential harms include mass unemployment through automation, unprecedented surveillance capabilities, autonomous weapons systems, and the possibility of superintelligent systems with goals that conflict with human welfare.',
      solutions: [
        'Develop robust AI alignment techniques and safety protocols',
        'Establish international governance frameworks for AI development',
        'Invest in research on beneficial AI applications',
        'Create economic transition plans for automation-affected workers',
        'Promote transparency and accountability in AI systems'
      ]
    },
    'cosmic-risks': {
      title: 'Space & Cosmic Risks',
      description: 'Humanity faces various cosmic threats, from asteroid impacts to solar storms that could disable electrical grids. Long-term sustainability of life on Earth is also uncertain due to eventual solar expansion and other astronomical phenomena.',
      solutions: [
        'Develop asteroid detection and deflection capabilities',
        'Create resilient infrastructure against solar storms',
        'Research space-based habitats and interplanetary colonization',
        'Establish planetary defense coordination among nations',
        'Invest in sustainable, closed-loop life support systems'
      ]
    },
    
    // Structural Failures
    'education': {
      title: 'Broken Education Systems',
      description: 'Current education models often fail to develop critical thinking, creativity, and adaptability needed for modern challenges. Many systems rely on outdated pedagogical approaches, emphasize memorization over understanding, and fail to address individual learning needs.',
      solutions: [
        'Implement personalized learning approaches using technology',
        'Redesign curricula to emphasize critical thinking and problem-solving',
        'Integrate practical skills and real-world applications',
        'Make education more accessible through online platforms',
        'Develop better teacher training and support systems'
      ]
    },
    'inequality': {
      title: 'Economic Inequality',
      description: 'The growing gap between rich and poor threatens social cohesion and political stability. Wealth concentration limits opportunity for many, while technological change and globalization often benefit those already advantaged. This inequality undermines democratic institutions and social trust.',
      solutions: [
        'Implement progressive taxation systems',
        'Invest in universal basic services (healthcare, education, housing)',
        'Develop more inclusive economic metrics beyond GDP',
        'Support worker ownership and cooperative business models',
        'Create stronger social safety nets and opportunity programs'
      ]
    },
    'governance': {
      title: 'Corrupt or Ineffective Governance',
      description: 'Many governance systems prioritize short-term political gains over long-term public welfare. Corruption, regulatory capture by special interests, and outdated bureaucratic structures prevent effective responses to complex challenges.',
      solutions: [
        'Implement transparency and anti-corruption measures',
        'Develop participatory governance models using technology',
        'Reform campaign finance and lobbying regulations',
        'Create evidence-based policy evaluation frameworks',
        'Experiment with new democratic models like citizens\' assemblies'
      ]
    },
    'healthcare': {
      title: 'Failing Healthcare Systems',
      description: 'Healthcare systems worldwide struggle with rising costs, unequal access, and focus on treatment rather than prevention. Many people lack access to basic care, while others receive expensive interventions with minimal health benefits.',
      solutions: [
        'Shift focus to preventive care and public health',
        'Implement universal healthcare coverage models',
        'Use technology to improve healthcare delivery and reduce costs',
        'Address social determinants of health like housing and nutrition',
        'Reform pharmaceutical development and pricing systems'
      ]
    },
    'misinformation': {
      title: 'Misinformation & Polarization',
      description: 'Social media algorithms and fragmented news ecosystems create filter bubbles that reinforce existing beliefs and drive polarization. This undermines shared understanding of facts and makes collaborative problem-solving increasingly difficult.',
      solutions: [
        'Develop better content moderation systems and standards',
        'Promote media literacy education',
        'Create incentives for accurate, nuanced reporting',
        'Reform social media algorithms to reduce polarization',
        'Support independent fact-checking organizations'
      ]
    },
    
    // Human Well-Being
    'mental-health': {
      title: 'Mental Health Crisis',
      description: 'Rates of depression, anxiety, and other mental health conditions are rising globally. Modern lifestyles, social media use, economic pressures, and declining community connections all contribute to this crisis, which healthcare systems are ill-equipped to address.',
      solutions: [
        'Integrate mental health services into primary healthcare',
        'Reduce stigma through education and awareness campaigns',
        'Develop digital mental health tools and telehealth options',
        'Address social determinants of mental health',
        'Create workplace policies that support psychological wellbeing'
      ]
    },
    'community': {
      title: 'Loss of Meaning & Community',
      description: 'Traditional sources of meaning and community have eroded in many societies. Religious participation has declined, community organizations have weakened, and digital interactions often fail to provide the deep connections humans need for wellbeing.',
      solutions: [
        'Design urban spaces that facilitate community interaction',
        'Support community organizations and civic engagement',
        'Create new rituals and practices for meaning-making',
        'Develop technologies that enhance rather than replace human connection',
        'Promote work-life balance policies'
      ]
    },
    'trust': {
      title: 'Decline in Trust',
      description: 'Trust in institutions, media, experts, and even neighbors has declined significantly. This erosion of social trust makes collective action more difficult and increases vulnerability to manipulation and conspiracy theories.',
      solutions: [
        'Increase transparency in institutions and decision-making',
        'Create accountability mechanisms for public and private organizations',
        'Develop better systems for verifying information',
        'Promote cross-partisan dialogue and understanding',
        'Build local community resilience and mutual aid networks'
      ]
    },
    'ai-work': {
      title: 'Work & Purpose in an AI-Driven World',
      description: 'Automation and AI threaten to displace many jobs without clear pathways to new meaningful work. Beyond economic impacts, this raises profound questions about human purpose and identity in a world where machines can perform many tasks better than humans.',
      solutions: [
        'Implement universal basic income or similar programs',
        'Redesign education for lifelong learning and adaptation',
        'Create new economic models that value care work and creativity',
        'Develop human-AI collaboration frameworks',
        'Explore new sources of meaning beyond traditional employment'
      ]
    },
    
    // Ethical Challenges
    'tech-ethics': {
      title: 'Technological Ethics',
      description: 'Rapid technological development outpaces ethical frameworks and governance. AI, genetic modification, surveillance technologies, and other advances raise profound questions about privacy, autonomy, identity, and human dignity.',
      solutions: [
        'Develop anticipatory governance frameworks for emerging technologies',
        'Incorporate diverse perspectives in technology design',
        'Create ethical review processes for high-risk technologies',
        'Establish international standards and coordination',
        'Promote responsible innovation principles in education and industry'
      ]
    },
    'human-rights': {
      title: 'Human Rights Violations',
      description: 'Despite advances in human rights frameworks, violations persist worldwide. From political oppression to modern slavery, millions suffer from denial of basic rights and dignity. New technologies often enable new forms of rights abuses.',
      solutions: [
        'Strengthen international human rights enforcement mechanisms',
        'Use technology to document and expose abuses',
        'Support grassroots human rights defenders',
        'Implement corporate accountability for supply chain abuses',
        'Develop better early warning systems for mass atrocities'
      ]
    },
    'overconsumption': {
      title: 'Overconsumption & Waste',
      description: 'Current consumption patterns exceed planetary boundaries. Resource extraction, waste generation, and pollution threaten ecosystems and future resource availability. Economic systems that require continuous growth exacerbate these problems.',
      solutions: [
        'Transition to circular economy models',
        'Implement extended producer responsibility policies',
        'Develop alternative economic metrics beyond GDP growth',
        'Promote sustainable consumption through education and incentives',
        'Invest in regenerative agriculture and ecosystem restoration'
      ]
    },
    
    // Unified Vision
    'short-term': {
      title: 'Short-Term Thinking',
      description: 'Political, economic, and social systems incentivize short-term gains over long-term sustainability. Electoral cycles, quarterly profit reports, and immediate gratification bias decision-making against future generations\' interests.',
      solutions: [
        'Create institutional mechanisms to represent future generations',
        'Develop longer-term metrics and incentives in business',
        'Reform political systems to reduce short-termism',
        'Promote cultural values that emphasize intergenerational responsibility',
        'Use scenario planning and futures thinking in decision-making'
      ]
    },
    'cooperation': {
      title: 'Lack of Global Cooperation',
      description: 'Many global challenges require coordinated action, but national interests often prevail. International institutions lack sufficient authority, while geopolitical competition undermines collaborative problem-solving on issues like climate change.',
      solutions: [
        'Reform international institutions for greater effectiveness',
        'Develop new governance models for global commons',
        'Create stronger incentives for international cooperation',
        'Build transnational civil society networks',
        'Use technology to facilitate global coordination and trust-building'
      ]
    },
    'consciousness': {
      title: 'Failure to Evolve Consciousness',
      description: 'While technological capabilities advance rapidly, human moral and philosophical development lags behind. Tribalism, short-sightedness, and materialistic values persist, limiting our collective ability to address complex challenges.',
      solutions: [
        'Integrate contemplative practices in education and workplaces',
        'Develop new narratives and cultural frameworks for global challenges',
        'Support research on consciousness and moral development',
        'Create spaces for deep dialogue across differences',
        'Explore how technology can support rather than hinder consciousness evolution'
      ]
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate('/proposals', { state: { category: categoryId } });
  };

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const openModal = (topicKey) => {
    setModalContent(topicDetails[topicKey]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // Modal component
  const DetailModal = () => {
    if (!modalOpen) return null;
    
    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={closeModal}>×</button>
          <h2>{modalContent.title}</h2>
          <p className="modal-description">{modalContent.description}</p>
          <div className="modal-solutions">
            <h3>Potential Solutions</h3>
            <ul>
              {modalContent.solutions.map((solution, index) => (
                <li key={index}>{solution}</li>
              ))}
            </ul>
          </div>
          <div className="modal-actions">
            <button 
              className="modal-proposal-btn"
              onClick={() => {
                closeModal();
                navigate('/proposals', { state: { category: getCategoryForTopic(modalContent.title) } });
              }}
            >
              View Related Proposals
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to determine which category a topic belongs to
  const getCategoryForTopic = (topicTitle) => {
    const topicToCategory = {
      'Climate Change': 'existential',
      'Nuclear War': 'existential',
      'Pandemics & Biotech Risks': 'existential',
      'Artificial Intelligence Misuse': 'existential',
      'Space & Cosmic Risks': 'existential',
      
      'Broken Education Systems': 'structural',
      'Economic Inequality': 'structural',
      'Corrupt or Ineffective Governance': 'structural',
      'Failing Healthcare Systems': 'structural',
      'Misinformation & Polarization': 'structural',
      
      'Mental Health Crisis': 'wellbeing',
      'Loss of Meaning & Community': 'wellbeing',
      'Decline in Trust': 'wellbeing',
      'Work & Purpose in an AI-Driven World': 'wellbeing',
      
      'Technological Ethics': 'ethical',
      'Human Rights Violations': 'ethical',
      'Overconsumption & Waste': 'ethical',
      
      'Short-Term Thinking': 'vision',
      'Lack of Global Cooperation': 'vision',
      'Failure to Evolve Consciousness': 'vision'
    };
    
    return topicToCategory[topicTitle] || 'other';
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Humanity DAO</h1>
          <h2>Decentralized Solutions for Global Challenges</h2>
          <p className="hero-description">
            A community-driven organization leveraging blockchain technology to fund, develop, and implement 
            solutions to humanity's most pressing challenges.
          </p>
          <div className="hero-buttons">
            <button className="cta-button" onClick={handleGetStarted}>
              Get Started
            </button>
            <button className="secondary-button" onClick={() => navigate('/about')}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      <section className="mission-section">
        <h2>Our Mission</h2>
        <div className="mission-content">
          <div className="mission-text">
            <p>
              Humanity DAO exists to harness the collective intelligence, resources, and passion of a global community 
              to address the world's most urgent problems. We believe that decentralized governance, transparent 
              funding, and collaborative problem-solving can create solutions that traditional institutions cannot.
            </p>
            <p>
              Through our decentralized autonomous organization, we empower individuals from all backgrounds to 
              propose, vote on, and implement projects that make a meaningful impact. Our token-based governance 
              system ensures that decision-making power is distributed among those who are most committed to our mission.
            </p>
            <p>
              Every proposal funded, every project completed, and every life improved brings us one step closer to 
              a more equitable, sustainable, and prosperous world for all.
            </p>
          </div>
          <div className="mission-values">
            <div className="value-item">
              <h3>Decentralization</h3>
              <p>Distributing power and decision-making across our global community</p>
            </div>
            <div className="value-item">
              <h3>Transparency</h3>
              <p>Operating with complete openness in our governance and funding</p>
            </div>
            <div className="value-item">
              <h3>Impact</h3>
              <p>Prioritizing measurable, sustainable change in the world</p>
            </div>
            <div className="value-item">
              <h3>Inclusion</h3>
              <p>Welcoming diverse perspectives and ensuring accessibility</p>
            </div>
          </div>
        </div>
      </section>

      <section className="challenges-section">
        <h2>Humanity's Greatest Challenges</h2>
        <p className="challenges-intro">
          Our DAO focuses on five core interconnected challenges facing humanity. 
          Explore each area to see ongoing initiatives and opportunities to contribute.
        </p>
        <div className="challenge-categories">
          {challengeCategories.map((category) => (
            <div 
              key={category.id} 
              className="category-card"
              onClick={() => handleCategoryClick(category.id)}
              style={{ borderColor: category.color }}
            >
              <div className="category-icon" style={{ backgroundColor: category.color }}>
                <span>{category.icon}</span>
              </div>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
            </div>
          ))}
        </div>
        <div className="challenges-details">
          <div className="challenge-detail">
            <h3>Existential Risks</h3>
            <ul>
              <li>
                <strong>Climate Change</strong> – Rising temperatures, extreme weather, food and water shortages.
                <button className="learn-more-btn" onClick={() => openModal('climate-change')}>Learn More</button>
              </li>
              <li>
                <strong>Nuclear War</strong> – Geopolitical tensions and the risk of catastrophic conflict.
                <button className="learn-more-btn" onClick={() => openModal('nuclear-war')}>Learn More</button>
              </li>
              <li>
                <strong>Pandemics & Biotech Risks</strong> – Natural and engineered pathogens could devastate populations.
                <button className="learn-more-btn" onClick={() => openModal('pandemics')}>Learn More</button>
              </li>
              <li>
                <strong>Artificial Intelligence Misuse</strong> – AI could be misaligned with human values, leading to mass displacement, misinformation, or worse.
                <button className="learn-more-btn" onClick={() => openModal('ai-misuse')}>Learn More</button>
              </li>
              <li>
                <strong>Space & Cosmic Risks</strong> – Asteroid impacts, solar storms, or long-term sustainability of life on Earth.
                <button className="learn-more-btn" onClick={() => openModal('cosmic-risks')}>Learn More</button>
              </li>
            </ul>
          </div>
          <div className="challenge-detail">
            <h3>Structural Failures</h3>
            <ul>
              <li>
                <strong>Broken Education Systems</strong> – Outdated models fail to prepare people for modern challenges.
                <button className="learn-more-btn" onClick={() => openModal('education')}>Learn More</button>
              </li>
              <li>
                <strong>Economic Inequality</strong> – The gap between rich and poor leads to instability and suffering.
                <button className="learn-more-btn" onClick={() => openModal('inequality')}>Learn More</button>
              </li>
              <li>
                <strong>Corrupt or Ineffective Governance</strong> – Many governments prioritize power over people.
                <button className="learn-more-btn" onClick={() => openModal('governance')}>Learn More</button>
              </li>
              <li>
                <strong>Failing Healthcare Systems</strong> – Many people lack access to quality healthcare.
                <button className="learn-more-btn" onClick={() => openModal('healthcare')}>Learn More</button>
              </li>
              <li>
                <strong>Misinformation & Polarization</strong> – Social media and biased news divide societies.
                <button className="learn-more-btn" onClick={() => openModal('misinformation')}>Learn More</button>
              </li>
            </ul>
          </div>
          <div className="challenge-detail">
            <h3>Human Well-Being</h3>
            <ul>
              <li>
                <strong>Mental Health Crisis</strong> – Depression, anxiety, and loneliness are skyrocketing.
                <button className="learn-more-btn" onClick={() => openModal('mental-health')}>Learn More</button>
              </li>
              <li>
                <strong>Loss of Meaning & Community</strong> – Modern life leaves many feeling disconnected.
                <button className="learn-more-btn" onClick={() => openModal('community')}>Learn More</button>
              </li>
              <li>
                <strong>Decline in Trust</strong> – People distrust institutions, media, and even each other.
                <button className="learn-more-btn" onClick={() => openModal('trust')}>Learn More</button>
              </li>
              <li>
                <strong>Work & Purpose in an AI-Driven World</strong> – What happens when jobs are automated?
                <button className="learn-more-btn" onClick={() => openModal('ai-work')}>Learn More</button>
              </li>
            </ul>
          </div>
          <div className="challenge-detail">
            <h3>Ethical Challenges</h3>
            <ul>
              <li>
                <strong>Technological Ethics</strong> – AI, genetic modification, and surveillance raise ethical dilemmas.
                <button className="learn-more-btn" onClick={() => openModal('tech-ethics')}>Learn More</button>
              </li>
              <li>
                <strong>Human Rights Violations</strong> – From oppression to modern slavery, abuses persist.
                <button className="learn-more-btn" onClick={() => openModal('human-rights')}>Learn More</button>
              </li>
              <li>
                <strong>Overconsumption & Waste</strong> – We extract more than the planet can sustain.
                <button className="learn-more-btn" onClick={() => openModal('overconsumption')}>Learn More</button>
              </li>
            </ul>
          </div>
          <div className="challenge-detail">
            <h3>Unified Vision</h3>
            <ul>
              <li>
                <strong>Short-Term Thinking</strong> – Governments, businesses, and individuals focus on immediate gains over long-term sustainability.
                <button className="learn-more-btn" onClick={() => openModal('short-term')}>Learn More</button>
              </li>
              <li>
                <strong>Lack of Global Cooperation</strong> – Solving world problems requires unity, but nations act in self-interest.
                <button className="learn-more-btn" onClick={() => openModal('cooperation')}>Learn More</button>
              </li>
              <li>
                <strong>Failure to Evolve Consciousness</strong> – Humanity advances technologically but struggles morally and philosophically.
                <button className="learn-more-btn" onClick={() => openModal('consciousness')}>Learn More</button>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="join-section">
        <h2>Join Our Community</h2>
        <p>
          Become part of a global movement working to solve humanity's greatest challenges through 
          decentralized collaboration and innovative solutions.
        </p>
        <div className="join-actions">
          <button className="primary-button" onClick={handleGetStarted}>
            Explore Dashboard
          </button>
          <button className="secondary-button" onClick={() => navigate('/proposals')}>
            View Proposals
          </button>
        </div>
      </section>

      {/* Modal for detailed information */}
      <DetailModal />
    </div>
  );
};

export default Home; 