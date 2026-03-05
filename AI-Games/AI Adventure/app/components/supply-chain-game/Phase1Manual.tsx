import { useState } from 'react';
import { Search, Clock, AlertTriangle, X, MousePointerClick } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Phase1ManualProps {
  onComplete: () => void;
}

export function Phase1Manual({ onComplete }: Phase1ManualProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [checkedSuppliers, setCheckedSuppliers] = useState<number[]>([]);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const [decisionStep, setDecisionStep] = useState<'initial' | 'glassco' | 'packtech' | 'complete'>('initial');
  const [showIncorrectPopup, setShowIncorrectPopup] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [glasscoDecision, setGlasscoDecision] = useState<string | null>(null);
  const [packtechDecision, setPacktechDecision] = useState<string | null>(null);

  const suppliers = [
    { id: 1, name: 'GlassCo Romania', status: 'At Risk', highlighted: true },
    { id: 2, name: 'PackTech Poland', status: 'Unknown', highlighted: true },
    ...Array.from({ length: 48 }, (_, i) => ({
      id: i + 3,
      name: `Supplier ${i + 3}`,
      status: 'Unknown',
      highlighted: false
    }))
  ];

  const handleSearch = () => {
    setHasSearched(true);
    setClickCount(c => c + 1);
  };

  const handleCheckSupplier = (id: number) => {
    if (!checkedSuppliers.includes(id)) {
      setCheckedSuppliers([...checkedSuppliers, id]);
      setClickCount(c => c + 1);
    }
  };

  const handleDecisionClick = (decision: string) => {
    if (decisionStep === 'glassco') {
      setGlasscoDecision(decision);
    } else if (decisionStep === 'packtech') {
      setPacktechDecision(decision);
    }
    setClickCount(c => c + 1);
  };

  const handleSubmit = () => {
    onComplete();
  };

  const isComplete = checkedSuppliers.length >= 2;

  // Get dynamic search results based on query
  const getSearchResults = () => {
    const query = searchQuery.toLowerCase();

    if (query.includes('glass') || query.includes('romania')) {
      return [
        'Reuters: Major explosion at glass factory in Romania',
        'BBC News: Industrial accident in Eastern Europe',
        'Bloomberg: Supply chain disruptions in glass sector',
        'Industry Weekly: Romania factory incident report'
      ];
    } else if (query.includes('pack') || query.includes('poland')) {
      return [
        'Reuters: PackTech Poland facilities under investigation',
        'BBC News: Polish packaging supplier faces quality concerns',
        'Bloomberg: Eastern European packaging industry updates',
        'Industry Weekly: PackTech Poland production delays reported'
      ];
    } else if (query.length > 0) {
      return [
        'Reuters: Global supply chain news',
        'BBC News: International manufacturing updates',
        'Bloomberg: Supplier network analysis',
        'Industry Weekly: Supply chain risk report'
      ];
    }
    return [];
  };

  const searchResults = getSearchResults();

  return (
    <div className="flex h-full">
      {/* Welcome Popup */}
      <AnimatePresence>
        {showWelcomePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowWelcomePopup(false)}
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
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Phase 1: The Manual Risk Firefight
                </h2>
                <p className="text-gray-600">
                  Experience the tedious reality of manual supplier risk monitoring
                </p>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                <h3 className="font-semibold text-red-900 mb-2">Your Task:</h3>
                <ol className="text-sm text-red-800 space-y-1 list-decimal list-inside">
                  <li>Search global news for supplier disruptions</li>
                  <li>Manually verify supplier status in the database</li>
                  <li>Check at least 2 suppliers to experience the tedium</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-900">
                  ⚠️ <strong>Notice:</strong> You're checking just 2 of 50 suppliers. In reality, this process takes 4+ hours and 150+ clicks.
                </p>
              </div>

              <button
                onClick={() => setShowWelcomePopup(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Start Manual Process
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incorrect Answer Popup */}
      <AnimatePresence>
        {showIncorrectPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowIncorrectPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowIncorrectPopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-red-900 mb-2">Incorrect!</h2>
                <p className="text-gray-700">
                  You found risks in your supplier verification. Go back and check again.
                </p>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                <p className="text-sm text-red-800">
                  <strong>Reminder:</strong> You verified that GlassCo Romania is "At Risk" and PackTech Poland has "Unknown" status. There ARE risks that need to be addressed.
                </p>
              </div>

              <button
                onClick={() => setShowIncorrectPopup(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Try Again
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCompletionPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowCompletionPopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  4 Hours. 150+ Clicks. 2 Suppliers.
                </h2>
                <p className="text-lg text-gray-700 font-medium">
                  And you still have 48 more to go...
                </p>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                <p className="text-sm text-red-900 font-semibold mb-2">💥 THE REALITY:</p>
                <ul className="text-sm text-red-800 space-y-1.5">
                  <li>• Manually searching news across 50+ suppliers</li>
                  <li>• Verifying status one-by-one in fragmented systems</li>
                  <li>• By the time you act, competitors have secured backup capacity</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setShowCompletionPopup(false);
                  handleSubmit();
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                See the AI Agent Way →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 p-4 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Manual Supplier Risk Monitoring
                </h2>
                <p className="text-gray-600 text-sm">
                  The tedious reality of reactive risk firefighting
                </p>
              </div>
            </div>

            {/* Status Bar - Red/Gray theme for friction */}
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">
                      Checking {checkedSuppliers.length} of 50 Suppliers
                    </p>
                    <p className="text-xs text-red-700">
                      Estimated time: <strong>4 hours</strong> • Effort: <strong>{clickCount} clicks</strong> (150+ total needed)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-red-600 mb-1">Status</p>
                  <div className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded">
                    REACTIVE
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Fragmented UI */}
          <div className="space-y-4">
            {/* Component 1: News Search */}
            <div className="bg-white rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 flex items-center justify-between">
                <span className="text-white text-sm font-semibold">Global News Monitor</span>
                <div className="flex items-center gap-2 bg-red-500 px-2 py-1 rounded text-xs font-bold text-white">
                  <MousePointerClick className="w-3 h-3" />
                  +1 CLICK
                </div>
              </div>

              <div className="p-4">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search global news for supplier incidents..."
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm"
                  />
                </div>

                <button
                  onClick={handleSearch}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  SEARCH NEWS
                </button>

                {hasSearched && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 space-y-2"
                  >
                    <div className="text-xs text-gray-600 mb-2">Search Results :</div>
                    {searchResults.map((result, i) => (
                      <div
                        key={i}
                        className="p-2 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer text-xs text-blue-600 hover:text-blue-800 flex items-center justify-between"
                      >
                        <span>{result}</span>
                        <span className="text-red-500 text-[10px] font-bold">+1 CLICK</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Annotation */}
              <div className="bg-red-100 border-t-2 border-red-300 px-4 py-2">
                <p className="text-xs text-red-800 font-semibold">
                  ⚠️ TEDIOUS MANUAL PROCESS - Multiple clicks required to find relevant information
                </p>
              </div>
            </div>

            {/* Component 2: Supplier Database Checkbox List */}
            <div className="bg-white rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden">
              <div className="bg-gray-700 px-4 py-2">
                <span className="text-white text-sm font-semibold">Supplier Database - Status Verification</span>
              </div>

              <div className="p-4">
                <div className="mb-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                  <p className="text-xs text-yellow-900">
                    <strong>Instructions:</strong> Check at least the first 2 suppliers marked in red. In reality, you'd need to check all 50 suppliers (48+ more clicks remaining).
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto border-2 border-gray-300 rounded-lg">
                  {suppliers.slice(0, 10).map((supplier) => (
                    <div
                      key={supplier.id}
                      className={`p-3 border-b border-gray-200 flex items-center justify-between ${
                        supplier.highlighted && !checkedSuppliers.includes(supplier.id)
                          ? 'bg-red-50'
                          : checkedSuppliers.includes(supplier.id)
                          ? 'bg-green-50'
                          : 'bg-white opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checkedSuppliers.includes(supplier.id)}
                          onChange={() => handleCheckSupplier(supplier.id)}
                          disabled={!supplier.highlighted && checkedSuppliers.length < 2}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{supplier.name}</p>
                          <p className="text-xs text-gray-500">Status: {supplier.status}</p>
                        </div>
                      </div>
                      {supplier.highlighted && !checkedSuppliers.includes(supplier.id) && (
                        <div className="text-red-500 text-xs font-bold">VERIFY</div>
                      )}
                      {checkedSuppliers.includes(supplier.id) && (
                        <div className="text-green-600 text-xs font-bold">✓ CHECKED</div>
                      )}
                    </div>
                  ))}

                  {/* Grayed out remaining suppliers */}
                  <div className="p-4 bg-gray-100 text-center relative">
                    <p className="text-sm text-gray-600">... 40 more suppliers</p>
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      +48 CLICKS REMAINING
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Component 3: Decision Flowchart (disabled until checks complete) */}
            <div
              className={`bg-white rounded-lg shadow-lg border-2 overflow-hidden ${
                isComplete ? 'border-green-500' : 'border-gray-300 opacity-50'
              }`}
            >
              <div className="bg-gray-700 px-4 py-2">
                <span className="text-white text-sm font-semibold">Manual Decision Tree</span>
              </div>

              <div className="p-6">
                {!isComplete ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Complete supplier verification above to unlock decision options</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Clear Instructions */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                      <p className="text-xs text-blue-900">
                        <strong>Next Step:</strong> Work through the decision tree to determine your next actions.
                      </p>
                    </div>

                    {/* Step 1: Initial Risk Question */}
                    {decisionStep === 'initial' && (
                      <div className="p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                        <p className="text-sm font-medium text-gray-900 mb-3">Is there any risk in the supply network?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setDecisionStep('glassco');
                              setClickCount(c => c + 1);
                            }}
                            className="flex-1 px-4 py-3 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 border-2 border-gray-300 transition-all"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setShowIncorrectPopup(true)}
                            className="flex-1 px-4 py-3 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 border-2 border-gray-300 transition-all"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: GlassCo Decision */}
                    {decisionStep === 'glassco' && (
                      <div className="p-4 border-2 border-blue-400 rounded-lg bg-blue-50">
                        <div className="mb-4">
                          <p className="text-sm font-bold text-gray-900 mb-1">Risk Detected: GlassCo Romania</p>
                          <p className="text-xs text-gray-600">Select your action for this supplier:</p>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={() => handleDecisionClick('Contact Backup A')}
                            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                              glasscoDecision === 'Contact Backup A'
                                ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                            }`}
                          >
                            <div className="font-medium text-sm mb-1">Contact Backup Supplier A</div>
                            <div className={`text-xs ${glasscoDecision === 'Contact Backup A' ? 'text-blue-100' : 'text-gray-500'}`}>
                              • Write email to backup supplier
                              <br />
                              • Prepare purchase order
                              <br />
                              • Negotiate pricing and delivery terms
                            </div>
                          </button>

                          <button
                            onClick={() => handleDecisionClick('Search Alternatives')}
                            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                              glasscoDecision === 'Search Alternatives'
                                ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                            }`}
                          >
                            <div className="font-medium text-sm mb-1">Search for New Alternatives</div>
                            <div className={`text-xs ${glasscoDecision === 'Search Alternatives' ? 'text-blue-100' : 'text-gray-500'}`}>
                              • Research potential suppliers online
                              <br />
                              • Request quotes from multiple vendors
                              <br />
                              • Conduct supplier qualification process
                            </div>
                          </button>
                        </div>

                        {glasscoDecision && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <button
                              onClick={() => {
                                setDecisionStep('packtech');
                                setClickCount(c => c + 1);
                              }}
                              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                              CONTINUE TO NEXT SUPPLIER →
                            </button>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Step 3: PackTech Decision */}
                    {decisionStep === 'packtech' && (
                      <div className="space-y-3">
                        {/* Show completed GlassCo decision */}
                        <div className="p-3 border-2 border-green-400 rounded-lg bg-green-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-green-900">✓ GlassCo Romania</p>
                              <p className="text-xs text-green-700">{glasscoDecision}</p>
                            </div>
                          </div>
                        </div>

                        {/* PackTech decision */}
                        <div className="p-4 border-2 border-blue-400 rounded-lg bg-blue-50">
                          <div className="mb-4">
                            <p className="text-sm font-bold text-gray-900 mb-1">Risk Detected: PackTech Poland</p>
                            <p className="text-xs text-gray-600">Select your action for this supplier:</p>
                          </div>

                          <div className="space-y-2">
                            <button
                              onClick={() => handleDecisionClick('Contact Backup B')}
                              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                                packtechDecision === 'Contact Backup B'
                                  ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                              }`}
                            >
                              <div className="font-medium text-sm mb-1">Contact Backup Supplier B</div>
                              <div className={`text-xs ${packtechDecision === 'Contact Backup B' ? 'text-blue-100' : 'text-gray-500'}`}>
                                • Write email to backup supplier
                                <br />
                                • Prepare purchase order
                                <br />
                                • Negotiate pricing and delivery terms
                              </div>
                            </button>

                            <button
                              onClick={() => handleDecisionClick('Escalate to Management')}
                              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                                packtechDecision === 'Escalate to Management'
                                  ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                              }`}
                            >
                              <div className="font-medium text-sm mb-1">Escalate to Management</div>
                              <div className={`text-xs ${packtechDecision === 'Escalate to Management' ? 'text-blue-100' : 'text-gray-500'}`}>
                                • Prepare executive summary report
                                <br />
                                • Schedule emergency meeting
                                <br />
                                • Wait for management decision
                              </div>
                            </button>
                          </div>

                          {packtechDecision && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <button
                                onClick={() => setShowCompletionPopup(true)}
                                className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                              >
                                SUBMIT ALL DECISIONS & COMPLETE
                              </button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
