import { Contribution, Vote, Project } from '../types';

export const calculateReputationScore = (
  contributionHistory: Contribution[],
  votingHistory: Vote[],
  projectParticipation: Project[],
  tokenHolding: number
) => {
  // Base influence from token holding (with diminishing returns)
  const tokenInfluence = Math.sqrt(tokenHolding);
  
  // Participation metrics
  const votingScore = votingHistory.length * 2;
  const projectScore = projectParticipation.reduce((acc, project) => 
    acc + project.impact * project.completion, 0);
  
  // Time-based reputation decay
  const contributionScore = contributionHistory.reduce((acc, contribution) => {
    const ageInDays = (Date.now() - contribution.timestamp) / (1000 * 60 * 60 * 24);
    const decayFactor = Math.max(0.5, 1 - (ageInDays / 365));
    return acc + (contribution.value * decayFactor);
  }, 0);
  
  return tokenInfluence + votingScore + projectScore + contributionScore;
}; 