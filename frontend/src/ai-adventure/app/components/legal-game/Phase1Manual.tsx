import { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Phase1ManualProps {
  onComplete: () => void;
}

export function Phase1Manual({ onComplete }: Phase1ManualProps) {
  const [evaluations, setEvaluations] = useState<{ id: number; markedAsRisk: boolean }[]>([]);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [showMindsetPopup, setShowMindsetPopup] = useState(false);

  const contractFragments = [
    {
      id: 1,
      page: 12,
      section: 'Section 4.1: General Provisions',
      text: 'The parties hereto agree that this Agreement shall be governed by the laws of the State of Delaware, without regard to its conflicts of law provisions. Each party represents and warrants that it has the full right, power, and authority to enter into this Agreement...',
      actualRisk: false
    },
    {
      id: 2,
      page: 44,
      section: 'Section 18.3: Indemnification',
      text: 'Company (Coca-Cola) shall indemnify, defend, and hold harmless the Vendor from and against any and all claims, damages, losses, and expenses, including reasonable attorney fees, arising out of or resulting from Company\'s use of Vendor\'s services. COMPANY SHALL BE HELD LIABLE FOR ALL DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES WITHOUT LIMITATION OR CAP...',
      actualRisk: true
    },
    {
      id: 3,
      page: 31,
      section: 'Section 12.5: Confidentiality',
      text: 'Both parties agree to maintain confidentiality of proprietary information disclosed during the term of this Agreement. Confidential information shall not be disclosed to third parties without prior written consent. This obligation shall survive termination for a period of three (3) years...',
      actualRisk: false
    },
    {
      id: 4,
      page: 52,
      section: 'Section 19.4: Insurance Requirements',
      text: 'Vendor shall maintain commercial general liability insurance with minimum coverage of $2,000,000 per occurrence. Vendor agrees to name Company as an additional insured on all policies. Certificates of insurance shall be provided upon request...',
      actualRisk: false
    },
    {
      id: 5,
      page: 58,
      section: 'Section 22.1: Term and Termination',
      text: 'This Agreement shall commence on the Effective Date and shall continue for an initial term of three (3) years. Vendor may terminate this Agreement without cause upon ten (10) days prior written notice. Company may only terminate for material breach, and must provide one hundred twenty (120) days written notice with opportunity to cure...',
      actualRisk: true
    }
  ];

  const handleRiskClick = (id: number) => {
    const existing = evaluations.find(e => e.id === id);
    if (existing) return;
    
    const newEval = { id, markedAsRisk: true };
    const newEvaluations = [...evaluations, newEval];
    setEvaluations(newEvaluations);
    
    // Check if both actual risks are found
    const correctlyIdentified = newEvaluations.filter(e => {
      const frag = contractFragments.find(f => f.id === e.id);
      return e.markedAsRisk && frag?.actualRisk;
    });
    
    if (correctlyIdentified.length === 2) {
      setTimeout(() => setShowMindsetPopup(true), 3000);
    }
  };

  const handleNoRiskClick = (id: number) => {
    const existing = evaluations.find(e => e.id === id);
    if (existing) return;
    
    const newEval = { id, markedAsRisk: false };
    setEvaluations([...evaluations, newEval]);
  };

  const getEvaluation = (id: number) => {
    return evaluations.find(e => e.id === id);
  };

  const getRisksInTracker = () => {
    return evaluations.filter(e => {
      const frag = contractFragments.find(f => f.id === e.id);
      return e.markedAsRisk && frag?.actualRisk;
    }).map(e => contractFragments.find(f => f.id === e.id)!);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Compact Header */}
      <div className="bg-white border-b-2 border-gray-200 px-6 py-2.5 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="inline-flex items-center gap-1 bg-red-50 border border-red-500 rounded px-2 py-0.5">
                <FileText className="w-3.5 h-3.5 text-red-600" />
                <span className="text-red-900 font-bold text-xs">Manual Review</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900">Contract Risk Extraction</h1>
            </div>
            <p className="text-xs text-gray-600">
              Review 5 contract fragments • Identify which 2 contain risk clauses • Manually log to spreadsheet
            </p>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded px-3 py-1">
            <Clock className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-xs text-gray-700 font-semibold">Est: 4.5 hours</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 max-w-[1400px] mx-auto px-6 py-3 w-full">
          {/* Contract Fragments */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-700" />
              <h2 className="text-sm font-bold text-gray-900">Contract Fragments (Page-by-Page Review)</h2>
            </div>
            
            <div className="flex-1 flex flex-col gap-2">
              {contractFragments.map((fragment, index) => {
                const evaluation = getEvaluation(fragment.id);
                const isEvaluated = !!evaluation;
                const isCorrect = isEvaluated && ((evaluation.markedAsRisk && fragment.actualRisk) || (!evaluation.markedAsRisk && !fragment.actualRisk));
                
                return (
                  <motion.div
                    key={fragment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white border-2 rounded-lg p-3 transition-all flex-1 flex flex-col min-h-0 ${
                      isEvaluated
                        ? isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 bg-gray-50 opacity-60'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          Page {fragment.page}
                        </span>
                        <h3 className="font-bold text-sm text-gray-900">{fragment.section}</h3>
                      </div>
                      
                      {isEvaluated && isCorrect && fragment.actualRisk && (
                        <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          RISK
                        </div>
                      )}
                      {isEvaluated && isCorrect && !fragment.actualRisk && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed mb-2.5 flex-shrink-0">
                      {fragment.text}
                    </p>

                    {!isEvaluated && (
                      <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                        <button
                          onClick={() => handleRiskClick(fragment.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Contains Risk</span>
                        </button>
                        <button
                          onClick={() => handleNoRiskClick(fragment.id)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>No Risk</span>
                        </button>
                      </div>
                    )}

                    {isEvaluated && isCorrect && fragment.actualRisk && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-2 border-t border-red-300 mt-auto"
                      >
                        <p className="text-xs text-red-700 font-semibold">
                          ✍️ Manually copy-pasting to Risk Tracker...
                        </p>
                      </motion.div>
                    )}
                    
                    {isEvaluated && !isCorrect && evaluation.markedAsRisk && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-2 border-t border-gray-300 mt-auto"
                      >
                        <p className="text-xs text-gray-600 font-semibold">
                          ✓ This clause is safe for Coca-Cola — Continue reviewing
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Excel Tracker at Bottom */}
        <div className="flex-shrink-0 bg-white border-t-2 border-gray-300 px-6 py-2">
          <div className="max-w-[1400px] mx-auto">
            <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-lg">
              {/* Excel-style Header */}
              <div className="bg-[#217346] px-3 py-1 flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">📊 Risk Tracker.xlsx</h3>
                <span className="text-[10px] text-white opacity-80">
                  Progress: {getRisksInTracker().length} of 10 expected risks logged
                </span>
              </div>
              
              {/* Compact Table */}
              <div className="bg-white">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="text-left px-2 py-1 font-bold text-gray-700 border-r border-gray-300 w-12">Page</th>
                      <th className="text-left px-2 py-1 font-bold text-gray-700 border-r border-gray-300">Section</th>
                      <th className="text-left px-2 py-1 font-bold text-gray-700 border-r border-gray-300">Risk Type</th>
                      <th className="text-left px-2 py-1 font-bold text-gray-700 border-r border-gray-300 w-16">Severity</th>
                      <th className="text-left px-2 py-1 font-bold text-gray-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getRisksInTracker().map((fragment) => (
                      <motion.tr
                        key={fragment.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-b border-gray-200 hover:bg-blue-50"
                      >
                        <td className="px-2 py-1 border-r border-gray-200 text-gray-900">{fragment.page}</td>
                        <td className="px-2 py-1 border-r border-gray-200 text-gray-900">{fragment.section}</td>
                        <td className="px-2 py-1 border-r border-gray-200 text-red-700 font-semibold">
                          {fragment.id === 2 ? 'Unlimited Liability on Coca-Cola' : 'Asymmetric Termination Rights'}
                        </td>
                        <td className="px-2 py-1 border-r border-gray-200">
                          <span className="bg-red-100 text-red-800 text-[9px] px-1.5 py-0.5 rounded font-bold">HIGH</span>
                        </td>
                        <td className="px-2 py-1 text-gray-600 italic">typing...</td>
                      </motion.tr>
                    ))}
                    
                    {/* Show at least one empty row if no risks yet */}
                    {getRisksInTracker().length === 0 && (
                      <tr className="border-b border-gray-200">
                        <td className="px-2 py-1 border-r border-gray-200 text-gray-400">—</td>
                        <td className="px-2 py-1 border-r border-gray-200 text-gray-400">—</td>
                        <td className="px-2 py-1 border-r border-gray-200 text-gray-400">—</td>
                        <td className="px-2 py-1 border-r border-gray-200 text-gray-400">—</td>
                        <td className="px-2 py-1 text-gray-400">—</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mindset Popup */}
      <AnimatePresence>
        {showMindsetPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#E41E2B] to-red-700 text-white rounded-lg p-8 max-w-md shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-4">💡 Notice the "Page-by-Page" Tedium?</h3>
              <p className="text-lg mb-6 leading-relaxed">
                You're wasting your legal expertise on <strong>reading and copy-pasting</strong>. This is data processing work that steals time from strategic counsel and negotiation.
              </p>
              <button
                onClick={() => {
                  setShowMindsetPopup(false);
                  onComplete();
                }}
                className="bg-white text-[#E41E2B] px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors w-full"
              >
                I understand — Show me the better way →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Popup */}
      <AnimatePresence>
        {showWelcomePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-8 max-w-2xl shadow-2xl border-4 border-[#E41E2B]"
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-200">
                <div className="w-16 h-16 bg-[#E41E2B] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-3xl">⚖️</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Phase 1: The Manual Way</h3>
                  <p className="text-sm text-gray-600">Contract Risk Extraction Simulation</p>
                </div>
              </div>

              {/* Role Description */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Your Role:</h4>
                <p className="text-gray-700 leading-relaxed">
                  You're a <strong>Legal Counsel</strong> at Coca-Cola. A critical 60-page vendor agreement 
                  needs to be reviewed before tomorrow's signing. Your job is to identify all <strong>liability</strong> and <strong>indemnity</strong> risk clauses.
                </p>
              </div>

              {/* Today's Task */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
                <h4 className="text-lg font-bold text-blue-900 mb-3">Today's Task:</h4>
                <p className="text-blue-800 mb-3">
                  Review <strong>5 contract fragments</strong> from Vendor Agreement v4.2. Identify which <strong>2 fragments</strong> contain 
                  risky clauses that expose Coca-Cola to liability.
                </p>
                <div className="bg-white rounded p-3 border border-blue-300">
                  <p className="text-sm text-gray-700 mb-2"><strong>Your Process:</strong></p>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Read each contract fragment carefully</li>
                    <li>Click "Contains Risk" or "No Risk" for each fragment</li>
                    <li>Risky clauses are automatically copied to the Excel tracker at bottom</li>
                    <li>Find both risky clauses to proceed</li>
                  </ol>
                </div>
              </div>

              {/* Key Info */}
              <div className="bg-yellow-50 rounded-lg p-4 mb-6 border-2 border-yellow-300">
                <p className="text-sm text-yellow-900">
                  ⏱️ <strong>Reality Check:</strong> This is just 5 fragments from 1 contract. In reality, you'd review 60 pages with 147 clauses. 
                  Your team handles 40+ contracts per month. Experience the tedium before seeing the AI alternative.
                </p>
              </div>

              <button
                onClick={() => setShowWelcomePopup(false)}
                className="bg-[#E41E2B] hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors w-full shadow-lg"
              >
                I Understand — Start Manual Review →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}