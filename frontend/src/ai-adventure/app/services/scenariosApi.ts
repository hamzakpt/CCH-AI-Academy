import { API_BASE } from '@shared/config/api';
import { Scenario, ScenarioAPI } from '@ai-adventure/app/types/scenario';
import {
  ShieldCheck,
  Camera,
  Target,
  Search,
  AlertTriangle,
  DollarSign,
  Users,
  Scale,
  Factory,
  Laptop,
  TrendingUp,
  HelpCircle,
  LucideIcon
} from 'lucide-react';

// Map icon names to Lucide React components
const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  Camera,
  Target,
  Search,
  AlertTriangle,
  DollarSign,
  Users,
  Scale,
  Factory,
  Laptop,
  TrendingUp,
  HelpCircle
};

// Convert API response to frontend Scenario with React component icons
function mapApiScenarioToScenario(apiScenario: ScenarioAPI): Scenario {
  const IconComponent = iconMap[apiScenario.icon] || HelpCircle;

  return {
    ...apiScenario,
    icon: IconComponent
  };
}

// Fetch all scenarios from the API
export async function fetchScenarios(): Promise<Scenario[]> {
  const response = await fetch(`${API_BASE}/scenarios`);

  if (!response.ok) {
    throw new Error(`Failed to fetch scenarios: ${response.statusText}`);
  }

  const apiScenarios: ScenarioAPI[] = await response.json();
  return apiScenarios.map(mapApiScenarioToScenario);
}

// Fetch a single scenario by ID
export async function fetchScenarioById(scenarioId: string): Promise<Scenario> {
  const response = await fetch(`${API_BASE}/scenarios/${scenarioId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch scenario: ${response.statusText}`);
  }

  const apiScenario: ScenarioAPI = await response.json();
  return mapApiScenarioToScenario(apiScenario);
}

// Seed scenarios (admin only)
export async function seedScenarios(username: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/scenarios/seed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Username': username
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to seed scenarios: ${response.statusText}`);
  }

  return response.json();
}


// ----------------------------
// Rating Types
// ----------------------------

export interface RatingOut {
  id: number;
  scenarioId: string;
  username: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface RatingSummary {
  scenarioId: string;
  averageRating: number;
  totalRatings: number;
  ratings: RatingOut[];
}

export interface AllRatings {
  ratings: Record<string, RatingSummary>;
}


// ----------------------------
// Rating API Functions
// ----------------------------

// Submit a rating for a scenario
export async function submitRating(
  scenarioId: string,
  username: string,
  rating: number,
  comment?: string
): Promise<RatingOut> {
  const response = await fetch(`${API_BASE}/scenarios/ratings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      scenarioId,
      username,
      rating,
      comment: comment || null
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to submit rating: ${response.statusText}`);
  }

  return response.json();
}

// Get ratings for a specific scenario
export async function fetchScenarioRatings(scenarioId: string): Promise<RatingSummary> {
  const response = await fetch(`${API_BASE}/scenarios/ratings/${scenarioId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ratings: ${response.statusText}`);
  }

  return response.json();
}

// Get all ratings for all scenarios
export async function fetchAllRatings(): Promise<AllRatings> {
  const response = await fetch(`${API_BASE}/scenarios/ratings`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ratings: ${response.statusText}`);
  }

  return response.json();
}


// ----------------------------
// Suggestion Types
// ----------------------------

export interface SuggestionOut {
  id: number;
  username: string;
  suggestion: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuggestionListOut {
  suggestions: SuggestionOut[];
  total: number;
}


// ----------------------------
// Suggestion API Functions
// ----------------------------

// Submit a new scenario suggestion
export async function submitSuggestion(
  username: string,
  suggestion: string
): Promise<SuggestionOut> {
  const response = await fetch(`${API_BASE}/scenarios/suggestions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, suggestion })
  });

  if (!response.ok) {
    throw new Error(`Failed to submit suggestion: ${response.statusText}`);
  }

  return response.json();
}

// Get all suggestions (admin only)
export async function fetchSuggestions(status?: string): Promise<SuggestionListOut> {
  const url = status
    ? `${API_BASE}/scenarios/suggestions?status=${status}`
    : `${API_BASE}/scenarios/suggestions`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch suggestions: ${response.statusText}`);
  }

  return response.json();
}

// Update a suggestion (admin only)
export async function updateSuggestion(
  suggestionId: number,
  data: { status?: string; adminNotes?: string }
): Promise<SuggestionOut> {
  const response = await fetch(`${API_BASE}/scenarios/suggestions/${suggestionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`Failed to update suggestion: ${response.statusText}`);
  }

  return response.json();
}

// Delete a suggestion (admin only)
export async function deleteSuggestion(suggestionId: number): Promise<void> {
  const response = await fetch(`${API_BASE}/scenarios/suggestions/${suggestionId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error(`Failed to delete suggestion: ${response.statusText}`);
  }
}
