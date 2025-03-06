import React, { useState, useEffect } from 'react';
import './DaoTrivia.css';

const DaoTrivia = ({ onClose, onRewardEarned }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [animation, setAnimation] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Sample questions about DAOs and blockchain
  const questions = [
    {
      question: "What does DAO stand for?",
      options: [
        "Digital Asset Organization",
        "Decentralized Autonomous Organization",
        "Distributed Application Ownership",
        "Digital Authority Organization"
      ],
      correctAnswer: 1,
      explanation: "A DAO (Decentralized Autonomous Organization) is an organization represented by rules encoded as a computer program that is transparent, controlled by the organization members, and not influenced by a central government."
    },
    {
      question: "Which of these is NOT typically a characteristic of a DAO?",
      options: [
        "Decentralized governance",
        "Centralized leadership",
        "Token-based voting",
        "Transparent operations"
      ],
      correctAnswer: 1,
      explanation: "DAOs are characterized by decentralized governance, token-based voting, and transparent operations. Centralized leadership goes against the core principles of a DAO."
    },
    {
      question: "What technology typically underpins most DAOs?",
      options: [
        "Cloud computing",
        "Artificial intelligence",
        "Blockchain",
        "Quantum computing"
      ],
      correctAnswer: 2,
      explanation: "Blockchain technology underpins most DAOs, providing the decentralized, transparent, and immutable infrastructure necessary for their operation."
    },
    {
      question: "What is the primary purpose of governance tokens in a DAO?",
      options: [
        "To pay transaction fees",
        "To vote on proposals",
        "To encrypt messages",
        "To mine new blocks"
      ],
      correctAnswer: 1,
      explanation: "Governance tokens in a DAO primarily allow holders to vote on proposals, giving them a say in the decision-making process proportional to their token holdings."
    },
    {
      question: "Which of these is a common challenge faced by DAOs?",
      options: [
        "Too much centralization",
        "Low transaction costs",
        "Voter apathy",
        "Excessive regulation"
      ],
      correctAnswer: 2,
      explanation: "Voter apathy is a common challenge in DAOs, where members may not participate in governance decisions, leading to low voter turnout and potentially unrepresentative decision-making."
    },
    {
      question: "What is a 'proposal' in the context of a DAO?",
      options: [
        "A marketing document",
        "A suggested change or action for the DAO to consider",
        "A technical whitepaper",
        "A financial statement"
      ],
      correctAnswer: 1,
      explanation: "In a DAO, a proposal is a suggested change or action that members can vote on, potentially affecting the organization's operations, treasury, or governance."
    },
    {
      question: "What is 'quadratic voting' in DAOs?",
      options: [
        "Voting where each member gets exactly 4 votes",
        "Voting where the cost of each additional vote increases quadratically",
        "Voting that requires a quorum of at least 4%",
        "Voting that happens every 4 weeks"
      ],
      correctAnswer: 1,
      explanation: "Quadratic voting is a system where the cost of each additional vote increases quadratically, making it more expensive to cast multiple votes on the same proposal, which helps prevent wealthy members from dominating decisions."
    },
    {
      question: "What is a 'multisig wallet' often used for in DAOs?",
      options: [
        "Mining cryptocurrency",
        "Storing member information",
        "Managing treasury funds securely",
        "Encrypting communications"
      ],
      correctAnswer: 2,
      explanation: "Multisig (multi-signature) wallets are often used in DAOs to manage treasury funds securely, requiring multiple authorized signatures to approve transactions, thus reducing the risk of unauthorized spending."
    },
    {
      question: "What is 'token-weighted voting'?",
      options: [
        "Voting where tokens are physically weighed",
        "Voting where your influence is proportional to your token holdings",
        "Voting where token holders must stake their tokens",
        "Voting where tokens are burned after voting"
      ],
      correctAnswer: 1,
      explanation: "Token-weighted voting is a system where a member's voting power is proportional to the number of tokens they hold, giving those with more tokens greater influence over decisions."
    },
    {
      question: "What is a common criticism of token-weighted voting in DAOs?",
      options: [
        "It's too complicated to implement",
        "It can lead to plutocracy where wealthy members have more influence",
        "It requires too much computational power",
        "It makes voting too frequent"
      ],
      correctAnswer: 1,
      explanation: "A common criticism of token-weighted voting is that it can lead to plutocracy, where members with more tokens (often the wealthy) have disproportionate influence over decisions, potentially undermining the democratic ideals of DAOs."
    }
  ];
  
  // Calculate rewards based on score
  const calculateRewards = () => {
    const baseReward = 10; // Base GT tokens for participation
    const correctAnswerBonus = 5; // Bonus per correct answer
    const streakBonus = streak >= 3 ? 15 : 0; // Bonus for maintaining a streak of 3+
    
    const totalReward = baseReward + (score * correctAnswerBonus) + streakBonus;
    return totalReward;
  };
  
  // Start timer
  useEffect(() => {
    if (showScore || isAnswered) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentQuestion, isAnswered, showScore]);
  
  // Handle timeout (no answer selected)
  const handleTimeout = () => {
    if (!isAnswered) {
      setIsAnswered(true);
      setStreak(0); // Reset streak on timeout
      setAnimation('shake');
      
      // Move to next question after delay
      setTimeout(() => {
        handleNextQuestion();
      }, 3000);
    }
  };
  
  // Handle answer selection
  const handleAnswerClick = (answerIndex) => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    setSelectedAnswer(answerIndex);
    
    // Check if answer is correct
    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
      setStreak(streak + 1);
      if (streak + 1 > highestStreak) {
        setHighestStreak(streak + 1);
      }
      setAnimation('correct');
    } else {
      setStreak(0); // Reset streak on wrong answer
      setAnimation('wrong');
    }
    
    // Show explanation
    setShowExplanation(true);
    
    // Move to next question after delay
    setTimeout(() => {
      handleNextQuestion();
    }, 3000);
  };
  
  // Move to next question or end game
  const handleNextQuestion = () => {
    setAnimation('');
    setShowExplanation(false);
    
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      setShowScore(true);
      if (onRewardEarned) {
        onRewardEarned(calculateRewards());
      }
    }
  };
  
  // Restart the game
  const handleRestartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setTimeLeft(30);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setStreak(0);
    setAnimation('');
    setShowExplanation(false);
  };
  
  return (
    <div className="dao-trivia-container">
      <div className="dao-trivia-header">
        <h2>DAO Trivia Challenge</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      {!showScore ? (
        <div className="dao-trivia-content">
          <div className="trivia-stats">
            <div className="trivia-progress">
              <span>Question {currentQuestion + 1}/{questions.length}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="trivia-score">Score: {score}</div>
            <div className="trivia-streak">Streak: {streak}</div>
          </div>
          
          <div className="trivia-timer">
            <div className="timer-bar">
              <div 
                className="timer-fill" 
                style={{ 
                  width: `${(timeLeft / 30) * 100}%`,
                  backgroundColor: timeLeft < 10 ? '#ff4d4d' : '#4caf50'
                }}
              ></div>
            </div>
            <span className="timer-text">{timeLeft}s</span>
          </div>
          
          <div className={`trivia-question ${animation}`}>
            <h3>{questions[currentQuestion].question}</h3>
          </div>
          
          <div className="trivia-options">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                className={`trivia-option ${
                  isAnswered 
                    ? index === questions[currentQuestion].correctAnswer 
                      ? 'correct' 
                      : selectedAnswer === index && selectedAnswer !== questions[currentQuestion].correctAnswer 
                        ? 'wrong' 
                        : ''
                    : ''
                }`}
                onClick={() => handleAnswerClick(index)}
                disabled={isAnswered}
              >
                {option}
              </button>
            ))}
          </div>
          
          {showExplanation && (
            <div className="trivia-explanation">
              <p>{questions[currentQuestion].explanation}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="trivia-results">
          <h3>Quiz Completed!</h3>
          <div className="results-score">
            <span className="score-value">{score}</span>
            <span className="score-label">/{questions.length} correct</span>
          </div>
          
          <div className="results-stats">
            <div className="stat-item">
              <span className="stat-value">{Math.round((score / questions.length) * 100)}%</span>
              <span className="stat-label">Accuracy</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{highestStreak}</span>
              <span className="stat-label">Best Streak</span>
            </div>
          </div>
          
          <div className="results-reward">
            <h4>Rewards Earned</h4>
            <div className="reward-amount">
              <span className="token-value">{calculateRewards()}</span>
              <span className="token-label">GT</span>
            </div>
            <div className="reward-breakdown">
              <div className="reward-item">
                <span className="reward-label">Participation:</span>
                <span className="reward-value">10 GT</span>
              </div>
              <div className="reward-item">
                <span className="reward-label">Correct Answers:</span>
                <span className="reward-value">{score * 5} GT</span>
              </div>
              {highestStreak >= 3 && (
                <div className="reward-item">
                  <span className="reward-label">Streak Bonus:</span>
                  <span className="reward-value">15 GT</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="results-actions">
            <button className="play-again-btn" onClick={handleRestartGame}>
              Play Again
            </button>
            <button className="close-results-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaoTrivia; 