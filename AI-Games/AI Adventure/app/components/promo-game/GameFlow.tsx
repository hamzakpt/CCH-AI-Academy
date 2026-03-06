import { useState } from 'react';
import { Phase1Manual } from './Phase1Manual';
import { Phase2Agentic } from './Phase2Agentic';
import { FinalSummary } from './FinalSummary';
import { Footer } from '@/app/components/Footer';
import { motion, AnimatePresence } from 'motion/react';

type GamePhase = 'phase1' | 'phase2' | 'summary';

interface GameFlowProps {
  onBack?: () => void;
}

export function GameFlow({ onBack }: GameFlowProps) {
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('phase1');

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Main Content - Single Screen */}
      <main className="flex-1 max-w-[1800px] mx-auto w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {currentPhase === 'phase1' && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <Phase1Manual onComplete={() => setCurrentPhase('phase2')} onBack={onBack} />
            </motion.div>
          )}

          {currentPhase === 'phase2' && (
            <motion.div
              key="phase2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <Phase2Agentic onComplete={() => setCurrentPhase('summary')} onBack={onBack} />
            </motion.div>
          )}

          {currentPhase === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <FinalSummary onBack={onBack} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}