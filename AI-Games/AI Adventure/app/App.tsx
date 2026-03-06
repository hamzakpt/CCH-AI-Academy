import { useState } from 'react';
import { WelcomeScreen } from '@/app/components/WelcomeScreen';
import { ScenarioSelection } from '@/app/components/ScenarioSelection';
import { ChatBasedExecution } from '@/app/components/ChatBasedExecution';
import { OldVsNewComparison } from '@/app/components/OldVsNewComparison';
import { GameFlow } from '@/app/components/promo-game/GameFlow';
import { GameFlow as SupplyChainGameFlow } from '@/app/components/supply-chain-game/GameFlow';
import { GameFlow as FinanceGameFlow } from '@/app/components/finance-game/GameFlow';
import { Footer } from '@/app/components/Footer';
import { Scenario } from '@/app/types/scenario';
import { LoginPage } from '@/app/components/LoginPage';
import { MasterLandingPage } from '@/app/components/MasterLandingPage';

type AppState = 'login' | 'master-landing' | 'welcome' | 'selection' | 'comparison' | 'execution' | 'promo-game' | 'supply-chain-game' | 'finance-game';

function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [mode, setMode] = useState<'learn' | 'apply'>('learn');

  const handleLogin = (email: string) => {
    setAppState('master-landing');
  };

  const handleSelectAIAdventure = () => {
    setAppState('welcome');
  };

  const handleSelectLearningPath = () => {
    window.open('https://learning-path-tau.vercel.app/', '_blank');
  };

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

  if (appState === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (appState === 'master-landing') {
    return <MasterLandingPage onSelectAIAdventure={handleSelectAIAdventure} onSelectLearningPath={handleSelectLearningPath} />;
  }

  if (appState === 'welcome') {
    return <WelcomeScreen onContinue={handleStartLearning} />;
  }

  // Special full-screen experience for Promo Compliance game
  if (appState === 'promo-game') {
    return <GameFlow onBack={handleBackToSelection} />;
  }

  // Special full-screen experience for Supply Chain Risk game
  if (appState === 'supply-chain-game') {
    return <SupplyChainGameFlow onBack={handleBackToSelection} />;
  }

  // Special full-screen experience for Finance Risk game
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