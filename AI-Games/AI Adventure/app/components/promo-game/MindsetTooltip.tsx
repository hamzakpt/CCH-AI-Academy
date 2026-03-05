import { Info } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface MindsetTooltipProps {
  title: string;
  description: string;
}

export function MindsetTooltip({ title, description }: MindsetTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-[#E41E2B] hover:text-red-700 transition-colors"
      >
        <Info className="w-5 h-5" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-80"
          >
            <div className="bg-black text-white rounded-lg p-4 shadow-xl">
              <div className="font-semibold text-sm mb-2 text-[#E41E2B]">
                {title}
              </div>
              <p className="text-xs leading-relaxed">{description}</p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-black rotate-45"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
