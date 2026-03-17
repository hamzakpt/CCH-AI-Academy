import { useState } from 'react';
import { Phase1Manual } from './Phase1Manual';
import { Phase2Agentic } from './Phase2Agentic';
import { FinalSummary } from './FinalSummary';

interface GameFlowProps {
  onBack?: () => void;
  userEmail: string;
}

export function GameFlow({ onBack, userEmail }: GameFlowProps) {
  const [currentPhase, setCurrentPhase] = useState<'phase1' | 'phase2' | 'summary'>('phase1');

  const handlePhase1Complete = () => {
    setCurrentPhase('phase2');
  };

  const handlePhase2Complete = () => {
    setCurrentPhase('summary');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {currentPhase === 'phase1' && <Phase1Manual onComplete={handlePhase1Complete} onBack={onBack} />}
      {currentPhase === 'phase2' && <Phase2Agentic onComplete={handlePhase2Complete} onBack={onBack} />}
      {currentPhase === 'summary' && <FinalSummary onBack={onBack} scenarioId="finance-1" scenarioTitle="Finance Close Simulation" userEmail={userEmail} />}
    </div>
  );
}
