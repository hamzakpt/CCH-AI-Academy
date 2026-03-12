import { useState } from 'react';
import { FileText, Clock, AlertTriangle, X, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Phase1ManualProps {
  onComplete: () => void;
}

export function Phase1Manual({ onComplete }: Phase1ManualProps) {
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [currentReview, setCurrentReview] = useState(0);
  const [highlightedPhrases, setHighlightedPhrases] = useState<string[]>([]);
  const [hasComparedScore, setHasComparedScore] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);

  const reviews = [
    {
      name: 'Sarah Chen',
      manager: 'Robert Martinez',
      score: 2,
      deptAvg: 3.5,
      text: 'Sarah is very supportive and helpful to her team members. However, she needs to smile more during client meetings and can sometimes come across as too emotional when discussing technical challenges.',
      biasedPhrases: ['needs to smile more', 'too emotional']
    },
    {
      name: 'Michael Torres',
      manager: 'Robert Martinez',
      score: 4,
      deptAvg: 3.5,
      text: 'Michael demonstrates strong technical leadership and ambitious career goals. He takes charge in meetings and drives projects forward with confidence.',
      biasedPhrases: ['ambitious career goals', 'takes charge']
    },
    {
      name: 'Jennifer Wu',
      manager: 'Robert Martinez',
      score: 3,
      deptAvg: 3.5,
      text: 'Jennifer is nurturing towards new hires and provides emotional support to the team. She tends to be too agreeable in planning meetings and should work on being more direct.',
      biasedPhrases: ['nurturing', 'too agreeable']
    }
  ];

  const currentReviewData = reviews[currentReview];

  // Helper function to render text with clickable phrases
  const renderTextWithPhrases = () => {
    const text = currentReviewData.text;
    const phrases = currentReviewData.biasedPhrases;
    
    // Find all phrase positions
    const positions: Array<{ start: number; end: number; phrase: string }> = [];
    phrases.forEach(phrase => {
      const index = text.indexOf(phrase);
      if (index !== -1) {
        positions.push({ start: index, end: index + phrase.length, phrase });
      }
    });
    
    // Sort by position
    positions.sort((a, b) => a.start - b.start);
    
    // Build the rendered elements
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    
    positions.forEach((pos, idx) => {
      // Add text before the phrase
      if (pos.start > lastIndex) {
        elements.push(text.substring(lastIndex, pos.start));
      }
      
      // Add the clickable phrase
      elements.push(
        <span
          key={idx}
          onClick={() => handleHighlight(pos.phrase)}
          className={`cursor-pointer transition-all ${
            highlightedPhrases.includes(pos.phrase)
              ? 'bg-yellow-300 font-semibold px-1 rounded'
              : 'hover:bg-yellow-100 px-1'
          }`}
        >
          {pos.phrase}
        </span>
      );
      
      lastIndex = pos.end;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }
    
    return elements;
  };

  const handleHighlight = (phrase: string) => {
    if (!highlightedPhrases.includes(phrase)) {
      setHighlightedPhrases([...highlightedPhrases, phrase]);
      setClickCount(c => c + 1);
    }
  };

  const handleCompareScore = () => {
    setHasComparedScore(true);
    setClickCount(c => c + 1);
  };

  const handleNextReview = () => {
    if (currentReview < reviews.length - 1) {
      setCurrentReview(currentReview + 1);
      setHighlightedPhrases([]);
      setHasComparedScore(false);
    } else {
      // All reviews checked
      setShowCompletionPopup(true);
    }
  };

  const canProceed = highlightedPhrases.length >= 2 && hasComparedScore;
  const totalClicks = clickCount;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className="flex-1 p-6 flex flex-col overflow-hidden">
        <div className="max-w-[1400px] mx-auto flex flex-col h-full">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Manual Performance Review Calibration</h2>
            <p className="text-sm text-gray-600">
              Experience the tedious reality of manual bias detection
            </p>
          </div>

          {/* Progress Steps - Clear Visual Guide */}
          <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-4 mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-3">📋 Your Task for This Review:</h3>
            <div className="grid grid-cols-3 gap-3">
              {/* Step 1 */}
              <div className={`relative p-3 rounded-lg border-2 transition-all ${
                highlightedPhrases.length === 0 
                  ? 'border-[#E41E2B] bg-red-50 shadow-lg scale-105' 
                  : highlightedPhrases.length < 2
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-green-500 bg-green-50'
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    highlightedPhrases.length >= 2 
                      ? 'bg-green-600 text-white' 
                      : 'bg-[#E41E2B] text-white'
                  }`}>
                    {highlightedPhrases.length >= 2 ? '✓' : '1'}
                  </div>
                  <h4 className="font-bold text-xs text-gray-900">Find Biased Phrases</h4>
                </div>
                <p className="text-xs text-gray-700 mb-1.5">
                  Click on subjective or gendered language in the manager's comments
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <div className={`h-1.5 flex-1 rounded-full ${
                    highlightedPhrases.length >= 2 ? 'bg-green-500' : 'bg-gray-200'
                  }`}>
                    <div 
                      className="h-full bg-yellow-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (highlightedPhrases.length / 2) * 100)}%` }}
                    />
                  </div>
                  <span className="font-bold text-gray-700">{highlightedPhrases.length}/2</span>
                </div>
                {highlightedPhrases.length === 0 && (
                  <p className="text-[10px] text-[#E41E2B] font-bold mt-1.5 animate-pulse">
                    👈 Start here! Click phrases below
                  </p>
                )}
              </div>

              {/* Step 2 */}
              <div className={`relative p-3 rounded-lg border-2 transition-all ${
                !hasComparedScore && highlightedPhrases.length >= 2
                  ? 'border-[#E41E2B] bg-red-50 shadow-lg scale-105'
                  : hasComparedScore 
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    hasComparedScore 
                      ? 'bg-green-600 text-white' 
                      : highlightedPhrases.length >= 2
                      ? 'bg-[#E41E2B] text-white'
                      : 'bg-gray-400 text-white'
                  }`}>
                    {hasComparedScore ? '✓' : '2'}
                  </div>
                  <h4 className="font-bold text-xs text-gray-900">Compare Score</h4>
                </div>
                <p className="text-xs text-gray-700 mb-1.5">
                  Check if rating deviates from dept average
                </p>
                <div className="flex items-center gap-2">
                  {hasComparedScore ? (
                    <span className="text-xs text-green-700 font-bold">✓ Complete</span>
                  ) : highlightedPhrases.length >= 2 ? (
                    <span className="text-xs text-[#E41E2B] font-bold animate-pulse">→ Click button below</span>
                  ) : (
                    <span className="text-xs text-gray-500">Complete Step 1 first</span>
                  )}
                </div>
              </div>

              {/* Step 3 */}
              <div className={`relative p-3 rounded-lg border-2 transition-all ${
                canProceed
                  ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                  : 'border-gray-300 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    canProceed ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
                  }`}>
                    {canProceed ? '✓' : '3'}
                  </div>
                  <h4 className="font-bold text-xs text-gray-900">Proceed to Next</h4>
                </div>
                <p className="text-xs text-gray-700 mb-1.5">
                  Complete review and move to next employee
                </p>
                {canProceed && (
                  <p className="text-xs text-green-700 font-bold animate-pulse">
                    ✓ Ready! Click "Next Review" below
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-xs font-bold text-yellow-900">
                    Reviewing Employee {currentReview + 1} of 10
                  </p>
                  <p className="text-[10px] text-yellow-700">
                    Est. time: <strong>{(7 - currentReview * 2.3).toFixed(1)} hours</strong>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-yellow-700">Manual Clicks: <strong>{totalClicks}</strong></p>
                <div className="w-40 h-2 bg-yellow-200 rounded-full mt-1">
                  <div 
                    className="h-full bg-yellow-600 rounded-full transition-all"
                    style={{ width: `${((currentReview + 1) / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Review Display */}
          <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
            {/* Left: Performance Review */}
            <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-xs font-semibold">
                    Performance_Review_{currentReviewData.name.replace(' ', '_')}.pdf
                  </span>
                </div>
              </div>

              <div className="p-4 overflow-y-auto flex-1">
                {/* Employee Info */}
                <div className="mb-3 pb-3 border-b-2 border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Performance Review - Q4 2025</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Employee:</span>
                      <span className="ml-2 font-bold text-gray-900">{currentReviewData.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Manager:</span>
                      <span className="ml-2 font-bold text-gray-900">{currentReviewData.manager}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Department:</span>
                      <span className="ml-2 font-bold text-gray-900">Engineering</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Role:</span>
                      <span className="ml-2 font-bold text-gray-900">Senior Engineer</span>
                    </div>
                  </div>
                </div>

                {/* Performance Score */}
                <div className="mb-3 pb-3 border-b-2 border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">Overall Performance Rating</h3>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 border-2 border-blue-300 px-4 py-2 rounded-lg">
                      <span className="text-2xl font-bold text-blue-900">{currentReviewData.score}/5</span>
                    </div>
                    {!hasComparedScore && highlightedPhrases.length >= 2 && (
                      <button
                        onClick={handleCompareScore}
                        className="bg-[#E41E2B] hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg animate-pulse"
                      >
                        📊 Compare to Dept Avg (Step 2)
                      </button>
                    )}
                    {!hasComparedScore && highlightedPhrases.length < 2 && (
                      <div className="bg-gray-100 border-2 border-gray-300 px-4 py-2 rounded-lg opacity-50">
                        <p className="text-xs text-gray-600">
                          📊 Compare to Dept Avg
                        </p>
                        <p className="text-[10px] text-gray-500">(Complete Step 1 first)</p>
                      </div>
                    )}
                    {hasComparedScore && (
                      <div className="bg-green-50 border-2 border-green-500 px-3 py-2 rounded-lg">
                        <p className="text-xs text-gray-900 font-bold">
                          Dept Average: {currentReviewData.deptAvg}/5
                        </p>
                        <p className="text-[10px] text-gray-700">
                          Deviation: <strong>{(currentReviewData.score - currentReviewData.deptAvg).toFixed(1)}</strong> pts
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Manager Comments */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">Manager Comments</h3>
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                    <p className="text-sm text-gray-800 leading-relaxed mb-2">
                      {renderTextWithPhrases()}
                    </p>
                    {highlightedPhrases.length === 0 && (
                      <div className="mt-2 bg-[#E41E2B] text-white px-3 py-2 rounded-lg">
                        <p className="text-xs font-bold animate-pulse">
                          👆 Click on subjective/gendered phrases above to highlight them
                        </p>
                      </div>
                    )}
                  </div>

                  {highlightedPhrases.length > 0 && (
                    <div className="mt-2 bg-white border-2 border-yellow-400 rounded-lg p-2">
                      <p className="text-xs font-bold text-gray-700 mb-1.5">
                        ✓ Highlighted phrases ({highlightedPhrases.length}/2):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {highlightedPhrases.map((phrase, idx) => (
                          <span
                            key={idx}
                            className="bg-yellow-300 px-2 py-0.5 rounded text-xs font-semibold text-yellow-900"
                          >
                            "{phrase}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Next Button */}
                {canProceed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 pt-3 border-t-2 border-gray-200"
                  >
                    <button
                      onClick={handleNextReview}
                      className={`w-full px-4 py-3 rounded-lg text-sm font-bold transition-all shadow-lg ${
                        currentReview === reviews.length - 1
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {currentReview === reviews.length - 1 
                        ? '✓ Complete All 3 Reviews (7 more in reality)' 
                        : `✓ Next Review → Employee ${currentReview + 2} of 10`}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right: Calibration Spreadsheet */}
            <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden flex flex-col">
              <div className="bg-green-700 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-xs font-semibold">Q4_Calibration_Tracker.xlsx</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 flex-1 overflow-y-auto">
                <table className="w-full text-[10px] border-collapse mb-3">
                  <thead className="bg-gray-200 sticky top-0">
                    <tr>
                      <th className="border border-gray-400 px-2 py-1 text-left">Employee</th>
                      <th className="border border-gray-400 px-2 py-1 text-center">Score</th>
                      <th className="border border-gray-400 px-2 py-1 text-center">Dept Avg</th>
                      <th className="border border-gray-400 px-2 py-1 text-left">Flagged Phrases</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.slice(0, currentReview + 1).map((review, idx) => (
                      <tr
                        key={idx}
                        className={idx === currentReview ? 'bg-yellow-100' : 'bg-white'}
                      >
                        <td className="border border-gray-300 px-2 py-1 font-medium">
                          {review.name}
                        </td>
                        <td className={`border border-gray-300 px-2 py-1 text-center font-bold ${
                          review.score < review.deptAvg ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
                        }`}>
                          {review.score}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          {review.deptAvg}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {idx === currentReview && highlightedPhrases.length > 0 ? (
                            <span className="text-yellow-800">{highlightedPhrases.join(', ')}</span>
                          ) : idx < currentReview ? (
                            <span className="text-gray-500">Manually entered...</span>
                          ) : (
                            <span className="text-gray-400">Pending...</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {Array.from({ length: 10 - (currentReview + 1) }).map((_, idx) => (
                      <tr key={`pending-${idx}`}>
                        <td className="border border-gray-300 px-2 py-1 text-gray-400">
                          Employee {currentReview + idx + 2}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center text-gray-400">-</td>
                        <td className="border border-gray-300 px-2 py-1 text-center text-gray-400">-</td>
                        <td className="border border-gray-300 px-2 py-1 text-gray-400">Not reviewed</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <p className="text-[10px] text-blue-900 font-semibold mb-1">Manual Analysis Notes:</p>
                  <ul className="text-[9px] text-blue-800 space-y-0.5">
                    <li>• Must manually track every biased phrase</li>
                    <li>• Scoring deviations calculated one-by-one</li>
                    <li>• Pattern recognition relies on human memory</li>
                    <li>• Risk of inconsistency across 10 reviews</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Popup */}
      <AnimatePresence>
        {showWelcomePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowWelcomePopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Phase 1: The Manual Calibration Grind
                </h2>
                <p className="text-gray-600">
                  Experience the tedious reality of manual performance review analysis
                </p>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                <h3 className="font-semibold text-red-900 mb-2">Your Role:</h3>
                <p className="text-sm text-red-800 mb-3">
                  You're an <strong>HR Business Partner</strong> responsible for ensuring fair and unbiased performance reviews across the Engineering department (10 employees).
                </p>
                <h3 className="font-semibold text-red-900 mb-2">Your Task:</h3>
                <ol className="text-sm text-red-800 space-y-1 list-decimal list-inside">
                  <li>Read each manager's review comments word-by-word</li>
                  <li>Manually identify and highlight subjective/gendered language</li>
                  <li>Compare individual scores to department averages</li>
                  <li>Track everything in a spreadsheet</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-900">
                  ⚠️ <strong>Reality Check:</strong> You'll review 3 of 10 employees in this demo. 
                  In reality, this manual process takes <strong>8+ hours</strong> and is prone to pattern-blindness from fatigue.
                </p>
              </div>

              <button
                onClick={() => setShowWelcomePopup(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Start Manual Review Process
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Popup */}
      <AnimatePresence>
        {showCompletionPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl shadow-2xl max-w-xl w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-3">
                  💡 Notice the "Spreadsheet Archaeology"?
                </h2>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-5 mb-6">
                <h3 className="font-bold text-xl mb-3">What You Just Did:</h3>
                <ul className="space-y-2 text-white/90">
                  <li className="flex items-start gap-2">
                    <span className="text-white">✓</span>
                    <span>Manually read 3 performance reviews word-by-word</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white">✓</span>
                    <span>Clicked {totalClicks} times to highlight phrases and compare scores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white">✓</span>
                    <span>Tracked everything in a spreadsheet manually</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white">✓</span>
                    <span>Spent ~2 hours with 7 more employees to go</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur border-2 border-white/30 rounded-lg p-4 mb-6">
                <p className="text-lg font-semibold mb-2 text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  The Hidden Cost:
                </p>
                <p className="text-white/90 leading-relaxed">
                  You're wasting your HR expertise on <strong className="text-white">manual data entry and pattern recognition</strong>. This tedious process takes 8+ hours, risks inconsistency due to fatigue, and steals time from strategic talent management.
                </p>
              </div>

              <button
                onClick={onComplete}
                className="w-full bg-white text-red-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                See How AI Does This in 2 Minutes →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}