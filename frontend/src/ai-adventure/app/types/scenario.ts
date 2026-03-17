export interface AgentStep {
  id: string;
  title: string;
  description: string;
  tools: string[];
  dataUsed: string[];
  successCriteria: string;
  requiresHITL: boolean;
  hitlMessage?: string;
  hitlActionContent?: {
    title: string;
    sections: Array<{
      heading: string;
      content?: string;
      bullets?: string[];
    }>;
  };
  duration: number; // seconds
}

export interface Scenario {
  id: string;
  title: string;
  function: 'Commercial' | 'Supply Chain' | 'Finance' | 'HR' | 'Legal' | 'IT & Marketing' | 'Other';
  description: string;
  problem: string;
  icon: string | React.ComponentType<{ className?: string }>;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  steps: AgentStep[];
  benefits: {
    timeSaved: string;
    impactMetric: string;
  };
  learningModules: string[];
  oldWaySteps?: string[]; // Manual process steps for comparison
  oldWayTime?: string; // Time taken with manual process
  flagship?: boolean; // Highlight as flagship scenario
  active?: boolean; // Mark as an active/available scenario
  hidden?: boolean; // Hidden scenarios are not displayed in the frontend
}

// API response type (icon is always a string from the backend)
export interface ScenarioAPI {
  id: string;
  title: string;
  function: 'Commercial' | 'Supply Chain' | 'Finance' | 'HR' | 'Legal' | 'IT & Marketing' | 'Other';
  description: string;
  problem: string;
  icon: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  steps: AgentStep[];
  benefits: {
    timeSaved: string;
    impactMetric: string;
  };
  learningModules: string[];
  oldWaySteps?: string[];
  oldWayTime?: string;
  flagship?: boolean;
  active?: boolean;
  hidden?: boolean;
}