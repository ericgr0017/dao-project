export interface Contribution {
  id: string;
  type: 'code' | 'funding' | 'content' | 'governance';
  value: number;
  timestamp: number;
  description: string;
  proof: string; // IPFS hash or transaction hash
}

export interface Vote {
  id: string;
  proposalId: string;
  voter: string;
  support: boolean;
  weight: number;
  timestamp: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  impact: number; // 1-10 scale of estimated impact
  completion: number; // 0-1 representing % complete
  fundingReceived: number;
  contributors: string[]; // addresses of contributors
  createdAt: number;
  updatedAt: number;
} 