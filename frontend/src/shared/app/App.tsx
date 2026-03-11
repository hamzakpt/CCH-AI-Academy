import { useState, useEffect } from 'react';
import { MasterLandingPage } from '@learning-path/app/components/MasterLandingPage';
import { LoginPage } from '@learning-path/app/components/LoginPage';
import { LearningPathsDashboard } from '@learning-path/app/components/LearningPathsDashboard';
import { HybridChatInterface } from '@learning-path/app/components/HybridChatInterface';
import { ResultsScreen } from '@learning-path/app/components/ResultsScreen';
import { GeneratingPathScreen } from '@learning-path/app/components/GeneratingPathScreen';
// Learning path types
import type { JobFunction, ExperienceLevel, InterestArea, UserProfile, SavedLearningPath } from '@learning-path/app/types';
// AI Adventure components
import { WelcomeScreen as AIAdventureWelcome } from '@ai-adventure/app/components/WelcomeScreen';
import { ScenarioSelection } from '@ai-adventure/app/components/ScenarioSelection';
import { ChatBasedExecution } from '@ai-adventure/app/components/ChatBasedExecution';
import { OldVsNewComparison } from '@ai-adventure/app/components/OldVsNewComparison';
import { GameFlow } from '@ai-adventure/app/components/promo-game/GameFlow';
import { GameFlow as SupplyChainGameFlow } from '@ai-adventure/app/components/supply-chain-game/GameFlow';
import { GameFlow as FinanceGameFlow } from '@ai-adventure/app/components/finance-game/GameFlow';
import { Scenario } from '@ai-adventure/app/types/scenario';

// Re-export learning path types for compatibility
export type { JobFunction, ExperienceLevel, InterestArea, UserProfile, SavedLearningPath };

type AppScreen = 'login' | 'master' | 'learning-dashboard' | 'learning-chat' | 'learning-generating' | 'learning-results' | 'ai-welcome' | 'ai-selection' | 'ai-comparison' | 'ai-execution' | 'ai-promo-game' | 'ai-supply-chain-game' | 'ai-finance-game';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('login');
  const [userEmail, setUserEmail] = useState<string>('');
  const [savedPaths, setSavedPaths] = useState<SavedLearningPath[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    jobFunction: null,
    experienceLevel: null,
    interests: [],
    goals: [],
    responses: [],
    timeCommitment: 0
  });
  const [aiSummary, setAiSummary] = useState<any | null>(null);
  const [learningPathId, setLearningPathId] = useState<number | null>(null);
  const [isNewPath, setIsNewPath] = useState(false);
  // AI Adventure state
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [aiAdventureMode, setAIAdventureMode] = useState<'learn' | 'apply'>('learn');

  const handleSelectLearningPath = () => {
    setCurrentScreen('learning-dashboard');
  };

  const handleSelectAIAdventure = () => {
    setCurrentScreen('ai-welcome');
  };

  const handleStartAIAdventure = () => {
    setCurrentScreen('ai-selection');
  };

  // Use runtime config if available (from config.js), fallback to build-time env var
  const getApiBase = () => {
    const appConfig = (window as any).__APP_CONFIG__;
    if (appConfig?.VITE_API_URL) {
      return appConfig.VITE_API_URL;
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:8000';
  };
  const API_BASE = getApiBase();

  useEffect(() => {
    const handleUnload = () => {
      const sessionId = localStorage.getItem("session_id");

      if (sessionId) {
        navigator.sendBeacon(
          `${API_BASE}/session/end`,
          JSON.stringify({ session_id: Number(sessionId) })
        );
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [API_BASE]);

  useEffect(() => {
    if (!userEmail) return;

    const sessionId = localStorage.getItem("session_id");
    if (!sessionId) return;

    const enterTime = new Date();

    // 🔹 Log entry immediately
    fetch(`${API_BASE}/activity/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: userEmail,
        session_id: Number(sessionId),
        screen_name: currentScreen,
        enter_time: enterTime.toISOString(),
        exit_time: enterTime.toISOString(),
        duration_seconds: 0
      })
    }).catch(err => console.error("Entry log failed:", err));

    return () => {
      const exitTime = new Date();

      const durationSeconds = Math.floor(
        (exitTime.getTime() - enterTime.getTime()) / 1000
      );

      fetch(`${API_BASE}/activity/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userEmail,
          session_id: Number(sessionId),
          screen_name: currentScreen,
          enter_time: enterTime.toISOString(),
          exit_time: exitTime.toISOString(),
          duration_seconds: durationSeconds
        })
      }).catch(err => console.error("Exit log failed:", err));
    };

  }, [currentScreen]);

  const handleLogin = async (email: string) => {
    setUserEmail(email);

    try {
      // 🔹 1️⃣ START SESSION FIRST
      const sessionRes = await fetch(`${API_BASE}/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email })
      });

      if (!sessionRes.ok) {
        throw new Error("Failed to start session");
      }

      const sessionData = await sessionRes.json();

      // Store session info
      localStorage.setItem("username", email);
      localStorage.setItem("session_id", sessionData.session_id);

      // 🔹 2️⃣ Then fetch learning paths (your existing logic)
      const res = await fetch(
        `${API_BASE}/learning-paths/${email}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch learning paths");
      }

      const backendPaths = await res.json();

      const mappedPaths: SavedLearningPath[] = backendPaths.map((path: any) => ({
        id: path.id.toString(),
        name: path.name,
        createdAt: new Date(path.created_at),
        profile: {
          jobFunction: path.job_function,
          experienceLevel: path.experience,
          interests: [],
          goals: [],
          responses: [],
          timeCommitment: path.time_available
            ? parseInt(path.time_available)
            : 0
        },
        recommendedPath: path.recommended_path
      }));

      setSavedPaths(mappedPaths);
      setCurrentScreen('master');

    } catch (err) {
      console.error("Login failed:", err);
      setSavedPaths([]);
      setCurrentScreen('master');
    }
  };

  const handleScenarioSelect = (scenario: Scenario, mode: 'learn' | 'apply') => {
    setSelectedScenario(scenario);
    setAIAdventureMode(mode);

    // Special cases for specific games
    if (scenario.id === 'commercial-4') {
      setCurrentScreen('ai-promo-game');
      return;
    }

    if (scenario.id === 'supply-chain-1') {
      setCurrentScreen('ai-supply-chain-game');
      return;
    }

    if (scenario.id === 'finance-1') {
      setCurrentScreen('ai-finance-game');
      return;
    }

    // Show comparison screen if scenario has old way steps
    if (scenario.oldWaySteps && scenario.oldWaySteps.length > 0) {
      setCurrentScreen('ai-comparison');
    } else {
      setCurrentScreen('ai-execution');
    }
  };

  const handleChooseNewWay = () => {
    setCurrentScreen('ai-execution');
  };

  const handleChooseOldWay = () => {
    setCurrentScreen('ai-execution');
  };

  const handleAIAdventureReset = () => {
    setSelectedScenario(null);
    setCurrentScreen('ai-selection');
  };

  const handleAIAdventureBackToHome = () => {
    setSelectedScenario(null);
    setCurrentScreen('ai-welcome');
  };

  const handleAIAdventureBackToSelection = () => {
    setSelectedScenario(null);
    setCurrentScreen('ai-selection');
  };

  const handleLogout = async () => {
    const sessionId = localStorage.getItem("session_id");

    if (sessionId) {
      await fetch(`${API_BASE}/session/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: Number(sessionId)
        })
      });
    }

    localStorage.removeItem("session_id");
    localStorage.removeItem("username");

    setUserEmail('');
    setSavedPaths([]);
    setUserProfile({
      jobFunction: null,
      experienceLevel: null,
      interests: [],
      goals: [],
      responses: [],
      timeCommitment: 0
    });

    setCurrentScreen('login');
  };

  const handleCreateNew = () => {
    setUserProfile({
      jobFunction: null,
      experienceLevel: null,
      interests: [],
      goals: [],
      responses: [],
      timeCommitment: 0
    });
    setCurrentScreen('learning-chat');
  };

  const handleSelectPath = async (path: SavedLearningPath) => {
    try {
      const res = await fetch(
        `${API_BASE}/learning-path/${path.id}`
      );

      if (!res.ok) {
        throw new Error("Failed to load learning path");
      }

      const fullData = await res.json();

      console.log("LOADED SAVED PATH:", fullData);

      setLearningPathId(fullData.id);

      setUserProfile({
        jobFunction: fullData.job_function,
        experienceLevel: fullData.experience,
        interests: fullData.interests
          ? fullData.interests.split(",")
          : [],
        goals: [],
        responses: [],
        timeCommitment: fullData.time_available
          ? parseInt(fullData.time_available)
          : 0
      });

      setAiSummary(fullData.ai_summary);
      setIsNewPath(false);
      setCurrentScreen('learning-results');

    } catch (err) {
      console.error("Failed to load saved path:", err);
    }
  };

  const handleComplete = async (
    profile: UserProfile,
    pathId: number
  ) => {
    try {
      setUserProfile(profile);
      setLearningPathId(pathId);
      setCurrentScreen('learning-generating');

      // 1️⃣ Complete path
      const completeRes = await fetch(
        `${API_BASE}/learning-path/${pathId}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            job_function: profile.jobFunction,
            experience: profile.experienceLevel,
            interests: profile.interests,
            goals: profile.goals
          })
        }
      );

      if (!completeRes.ok) {
        throw new Error("Completion failed");
      }

      // 2️⃣ Fetch full generated path
      const fullRes = await fetch(
        `${API_BASE}/learning-path/${pathId}`
      );

      const fullData = await fullRes.json();

      console.log("FULL BACKEND RESPONSE:", fullData);

      const backendHours = fullData.time_available
        ? parseInt(fullData.time_available)
        : profile.timeCommitment;

      setUserProfile({
        ...profile,
        timeCommitment: backendHours
      });

      setAiSummary(fullData.ai_summary);

      // ✅ 3️⃣ REFRESH USER'S LEARNING PATHS HERE
      const res = await fetch(
        `${API_BASE}/learning-paths/${userEmail}`
      );

      const backendPaths = await res.json();

      const mappedPaths: SavedLearningPath[] = backendPaths.map((path: any) => ({
        id: path.id.toString(),
        name: path.name,
        createdAt: new Date(path.created_at),
        profile: {
          jobFunction: path.job_function,
          experienceLevel: path.experience,
          interests: path.interests
            ? path.interests.split(",")
            : [],
          goals: [],
          responses: [],
          timeCommitment: path.time_available
            ? parseInt(path.time_available)
            : 0
        },
        recommendedPath: path.recommended_path
      }));

      setSavedPaths(mappedPaths);

      // 4️⃣ Go to results
      setIsNewPath(true);
      setCurrentScreen('learning-results');

    } catch (err) {
      console.error("Generation failed:", err);
      setCurrentScreen('learning-dashboard');
    }
  };

  const handleRestart = () => {
    setCurrentScreen('learning-dashboard');
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {currentScreen === 'login' && <LoginPage onLogin={handleLogin} apiBase={API_BASE} />}
      {currentScreen === 'master' && <MasterLandingPage onSelectLearningPath={handleSelectLearningPath} onSelectAIAdventure={handleSelectAIAdventure} />}

      {/* Learning Path Screens */}
      {currentScreen === 'learning-dashboard' && (
        <LearningPathsDashboard
          userEmail={userEmail}
          savedPaths={savedPaths}
          onSelectPath={handleSelectPath}
          onCreateNew={handleCreateNew}
          onLogout={handleLogout}
        />
      )}
      {currentScreen === 'learning-chat' && <HybridChatInterface username={userEmail} onComplete={handleComplete} />}
      {currentScreen === 'learning-generating' && <GeneratingPathScreen />}
      {currentScreen === 'learning-results' && aiSummary && learningPathId && (
        <ResultsScreen
          profile={userProfile}
          username={userEmail}
          learningPathId={learningPathId}
          aiSummary={aiSummary}
          isNewPath={isNewPath}
          onRestart={handleRestart}
          onGoToDashboard={async () => {
            try {
              const res = await fetch(`${API_BASE}/learning-paths/${userEmail}`);
              const backendPaths = await res.json();
              const mappedPaths: SavedLearningPath[] = backendPaths.map((path: any) => ({
                id: path.id.toString(),
                name: path.name,
                createdAt: new Date(path.created_at),
                profile: {
                  jobFunction: path.job_function,
                  experienceLevel: path.experience,
                  interests: path.interests ? path.interests.split(",") : [],
                  goals: [],
                  responses: [],
                  timeCommitment: path.time_available ? parseInt(path.time_available) : 0
                },
                recommendedPath: path.recommended_path
              }));
              setSavedPaths(mappedPaths);
            } catch (err) {
              console.error("Failed to refresh paths:", err);
            }
            setCurrentScreen('learning-dashboard');
          }}
        />
      )}

      {/* AI Adventure Screens */}
      {currentScreen === 'ai-welcome' && (
        <AIAdventureWelcome onContinue={handleStartAIAdventure} />
      )}
      {currentScreen === 'ai-selection' && (
        <ScenarioSelection onScenarioSelect={handleScenarioSelect} onBackToHome={handleAIAdventureBackToHome} />
      )}
      {currentScreen === 'ai-comparison' && selectedScenario && (
        <OldVsNewComparison
          scenario={selectedScenario}
          onChooseNewWay={handleChooseNewWay}
          onChooseOldWay={handleChooseOldWay}
        />
      )}
      {currentScreen === 'ai-execution' && selectedScenario && (
        <ChatBasedExecution
          scenario={selectedScenario}
          mode={aiAdventureMode}
          onReset={handleAIAdventureReset}
        />
      )}
      {currentScreen === 'ai-promo-game' && (
        <GameFlow onBack={handleAIAdventureBackToSelection} />
      )}
      {currentScreen === 'ai-supply-chain-game' && (
        <SupplyChainGameFlow onBack={handleAIAdventureBackToSelection} />
      )}
      {currentScreen === 'ai-finance-game' && (
        <FinanceGameFlow onBack={handleAIAdventureBackToSelection} />
      )}
    </div>
  );
}