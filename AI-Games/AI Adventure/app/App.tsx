import { useState, useEffect } from 'react';
import { WelcomeScreen } from '@/app/components/WelcomeScreen';
import { ScenarioSelection } from '@/app/components/ScenarioSelection';
import { ChatBasedExecution } from '@/app/components/ChatBasedExecution';
import { OldVsNewComparison } from '@/app/components/OldVsNewComparison';
import { GameFlow } from '@/app/components/promo-game/GameFlow';
import { GameFlow as SupplyChainGameFlow } from '@/app/components/supply-chain-game/GameFlow';
import { GameFlow as FinanceGameFlow } from '@/app/components/finance-game/GameFlow';
import { Footer } from '@/app/components/Footer';
import { Scenario } from '@/app/types/scenario';

type AppState = 'welcome' | 'selection' | 'comparison' | 'execution' | 'promo-game' | 'supply-chain-game' | 'finance-game';

const API_BASE = import.meta.env.VITE_API_URL;

function App() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [mode, setMode] = useState<'learn' | 'apply'>('learn');

  // ── Get username from URL when arriving from Learning Path ────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const usernameFromUrl = params.get("username");

    if (usernameFromUrl) {
      localStorage.setItem("username", usernameFromUrl);
    }
  }, []);

  // ── Session start ──────────────────────────────────────────────────────────
  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username || !API_BASE) return;

    fetch(`${API_BASE}/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem('ai_games_session_id', String(data.session_id));
      })
      .catch((err) => console.error('[AI-Games] Session start failed:', err));
  }, []);

  // ── Session end on tab/window close ───────────────────────────────────────
  useEffect(() => {
    const handleUnload = () => {
      const sessionId = localStorage.getItem('ai_games_session_id');
      if (sessionId && API_BASE) {
        navigator.sendBeacon(
          `${API_BASE}/session/end`,
          new Blob(
            [JSON.stringify({ session_id: Number(sessionId) })],
            { type: 'application/json' }
          )
        );
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // ── Screen activity logger ─────────────────────────────────────────────────
  useEffect(() => {
    const username = localStorage.getItem('username');
    const sessionId = localStorage.getItem('ai_games_session_id');

    if (!username || !sessionId || !API_BASE) return;

    const enterTime = new Date();

    return () => {
      const exitTime = new Date();

      const durationSeconds = Math.max(
        1,
        Math.floor((exitTime.getTime() - enterTime.getTime()) / 1000)
      );

      fetch(`${API_BASE}/activity/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          session_id: Number(sessionId),
          screen_name: selectedScenario
            ? `${appState}:${selectedScenario.id}`
            : appState,
          app_context: 'ai-games',
          enter_time: enterTime.toISOString(),
          exit_time: exitTime.toISOString(),
          duration_seconds: durationSeconds,
        }),
      }).catch((err) =>
        console.error('[AI-Games] Activity log failed:', err)
      );
    };
  }, [appState]);

  // ── Navigation handlers ───────────────────────────────────────────────────

  const handleStartLearning = () => {
    setAppState('selection');
  };

  const handleScenarioSelect = (scenario: Scenario, selectedMode: 'learn' | 'apply') => {
    setSelectedScenario(scenario);
    setMode(selectedMode);

    // Special case: Launch the Promo Compliance game for commercial-4
    if (scenario.id === 'commercial-4') {
      setAppState('promo-game');
      return;
    }

    // Special case: Launch the Supply Chain Risk game for supply-chain-1
    if (scenario.id === 'supply-chain-1') {
      setAppState('supply-chain-game');
      return;
    }

    // Special case: Launch the Finance Risk game for finance-1
    if (scenario.id === 'finance-1') {
      setAppState('finance-game');
      return;
    }

    // Show comparison screen if scenario has old way steps
    if (scenario.oldWaySteps && scenario.oldWaySteps.length > 0) {
      setAppState('comparison');
    } else {
      setAppState('execution');
    }
  };

  const handleChooseNewWay = () => {
    setAppState('execution');
  };

  const handleChooseOldWay = () => {
    // For now, just show the new way with a message
    // In future could show a simulated old way flow
    setAppState('execution');
  };

  const handleReset = () => {
    setSelectedScenario(null);
    setAppState('selection');
  };

  const handleBackToHome = () => {
    setSelectedScenario(null);
    setAppState('welcome');
  };

  const handleBackToSelection = () => {
    setSelectedScenario(null);
    setAppState('selection');
  };

  if (appState === 'welcome') {
    return <WelcomeScreen onContinue={handleStartLearning} />;
  }

  if (appState === 'promo-game') {
    return <GameFlow onBack={handleBackToSelection} />;
  }

  if (appState === 'supply-chain-game') {
    return <SupplyChainGameFlow onBack={handleBackToSelection} />;
  }

  if (appState === 'finance-game') {
    return <FinanceGameFlow onBack={handleBackToSelection} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 h-full">
          {appState === 'selection' && (
            <ScenarioSelection onScenarioSelect={handleScenarioSelect} onBackToHome={handleBackToHome} />
          )}

          {appState === 'comparison' && selectedScenario && (
            <OldVsNewComparison
              scenario={selectedScenario}
              onChooseNewWay={handleChooseNewWay}
              onChooseOldWay={handleChooseOldWay}
            />
          )}

          {appState === 'execution' && selectedScenario && (
            <ChatBasedExecution
              scenario={selectedScenario}
              mode={mode}
              onReset={handleReset}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;