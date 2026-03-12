import { useState } from 'react';
import { Phase1Manual } from './Phase1Manual';
import { Phase2Agentic } from './Phase2Agentic';
import { FinalSummary } from './FinalSummary';
import { Footer } from '@ai-adventure/app/components/Footer';
import { motion, AnimatePresence } from 'motion/react';

type GamePhase = 'manual' | 'agentic' | 'summary';

interface GameFlowProps {
  onBack?: () => void;
}

export function GameFlow({ onBack }: GameFlowProps) {
  const [phase, setPhase] = useState<GamePhase>('manual');

  const handleManualComplete = () => {
    setPhase('agentic');
  };

  const handleAgenticComplete = () => {
    setPhase('summary');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {phase === 'manual' && (
            <motion.div
              key="manual"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <Phase1Manual onComplete={handleManualComplete} />
            </motion.div>
          )}

          {phase === 'agentic' && (
            <motion.div
              key="agentic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <Phase2Agentic onComplete={handleAgenticComplete} />
            </motion.div>
          )}

          {phase === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <FinalSummary />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <Footer />
    </div>
  );
}
