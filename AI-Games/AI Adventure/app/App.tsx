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
import cokeLogoImage from 'figma:asset/b7c663aaaffd2123e1f119dd74e53b5eadefff3c.png';

type AppState = 'welcome' | 'selection' | 'comparison' | 'execution' | 'promo-game' | 'supply-chain-game' | 'finance-game';

function App() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [mode, setMode] = useState<'learn' | 'apply'>('learn');

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

  if (appState === 'welcome') {
    return <WelcomeScreen onContinue={handleStartLearning} />;
  }

  // Special full-screen experience for Promo Compliance game
  if (appState === 'promo-game') {
    return <GameFlow />;
  }

  // Special full-screen experience for Supply Chain Risk game
  if (appState === 'supply-chain-game') {
    return <SupplyChainGameFlow />;
  }

  // Special full-screen experience for Finance Risk game
  if (appState === 'finance-game') {
    return <FinanceGameFlow />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 h-full">
          {appState === 'selection' && (
            <ScenarioSelection onScenarioSelect={handleScenarioSelect} />
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