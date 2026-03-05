import { TrendingDown, Clock, Zap, DollarSign, CheckCircle, Home, Star, Lightbulb, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

function MetricCard({ label, manual, agentic, icon }: { label: string; manual: string; agentic: string; icon: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-[#E41E2B] transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="text-[#E41E2B] bg-red-50 p-2 rounded-full">{icon}</div>
        <h4 className="font-bold text-xs text-gray-900">{label}</h4>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-600">Manual Process:</span>
          <span className="text-[10px] font-bold text-red-600">{manual}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-600">Agentic Process:</span>
          <span className="text-[10px] font-bold text-green-600">{agentic}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function FinalSummary() {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleRatingSubmit = () => {
    // Handle rating submission
    setSubmitted(true);
    setTimeout(() => {
      setShowRatingModal(false);
      setSubmitted(false);
      setRating(0);
    }, 2000);
  };

  const handleSuggestionSubmit = () => {
    // Handle suggestion submission
    setSubmitted(true);
    setTimeout(() => {
      setShowSuggestModal(false);
      setSubmitted(false);
      setSuggestion('');
    }, 2000);
  };

  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="max-w-[1400px] mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-3"
        >
          <div className="inline-flex items-center gap-2 bg-green-50 border-2 border-green-500 rounded-full px-4 py-1.5 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-green-900 font-bold text-xs">Simulation Complete!</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            The "Aha!" Moment: Impact Metrics
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            You've experienced both the manual struggle and the AI-powered solution. 
            Here's the transformation in numbers.
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <MetricCard
            label="Daily Audit Time"
            manual="120-180 Minutes"
            agentic="0 Minutes (Automated)"
            icon={<Clock className="w-4 h-4" />}
          />
          
          <MetricCard
            label="Audit Frequency"
            manual="Once Daily (Sampled)"
            agentic="Real-time (Continuous)"
            icon={<Zap className="w-4 h-4" />}
          />
          
          <MetricCard
            label="Response Time"
            manual="24+ Hours"
            agentic="< 5 Minutes"
            icon={<TrendingDown className="w-4 h-4" />}
          />
          
          <MetricCard
            label="Financial Impact"
            manual="High Promo Leakage"
            agentic="Optimized Trade Spend"
            icon={<DollarSign className="w-4 h-4" />}
          />
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-xl border-2 border-gray-200 overflow-hidden mb-3"
        >
          <div className="bg-gradient-to-r from-black to-gray-900 px-4 py-2">
            <h3 className="text-base font-bold text-white">Detailed Comparison</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left p-2 font-bold text-gray-900 text-xs">Metric</th>
                  <th className="text-left p-2 font-bold text-red-700 text-xs">The Manual Struggle</th>
                  <th className="text-left p-2 font-bold text-green-700 text-xs">The Agentic Shift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-2 font-semibold text-gray-900 text-xs">Cognitive Load</td>
                  <td className="p-2 text-red-700 text-xs">High (Searching & Typing)</td>
                  <td className="p-2 text-green-700 text-xs">Low (Reviewing & Deciding)</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-2 font-semibold text-gray-900 text-xs">User Role</td>
                  <td className="p-2 text-red-700 text-xs">Data Entry Clerk</td>
                  <td className="p-2 text-green-700 text-xs">Strategic Relationship Manager</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-2 font-semibold text-gray-900 text-xs">Accuracy</td>
                  <td className="p-2 text-red-700 text-xs">Prone to Human Error</td>
                  <td className="p-2 text-green-700 text-xs">100% Evidence-Based</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-2 font-semibold text-gray-900 text-xs">Daily Time Investment</td>
                  <td className="p-2 text-red-700 text-xs">4+ hours</td>
                  <td className="p-2 text-green-700 text-xs">5-10 minutes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Mindset Shift Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-black text-white rounded-xl p-4 mb-3"
        >
          <h3 className="text-base font-bold mb-3 text-center">The Mindset Shift</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-[#E41E2B] font-bold mb-1 text-sm">🕒 Time</h4>
              <p className="text-gray-300 leading-relaxed text-xs">
                You are no longer a <strong>"Data Collector."</strong> You are now a <strong>"Strategic Auditor."</strong> 
                Let the Agent do the window shopping while you do the negotiating.
              </p>
            </div>
            <div>
              <h4 className="text-[#E41E2B] font-bold mb-1 text-sm">🤝 Fear</h4>
              <p className="text-gray-300 leading-relaxed text-xs">
                Removing the friction of confrontation. The AI provides the <strong>"Hard Truth"</strong> (the data), 
                so you can focus on the <strong>"Soft Skill"</strong> (the relationship).
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="grid grid-cols-3 gap-3 max-w-4xl mx-auto">
            <button
              onClick={() => window.location.href = '/'}
              className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 px-4 py-3 rounded-lg font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </button>
            
            <button
              onClick={() => setShowRatingModal(true)}
              className="bg-[#E41E2B] hover:bg-red-700 text-white px-4 py-3 rounded-lg font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Star className="w-4 h-4" />
              Rate Simulation
            </button>
            
            <button
              onClick={() => setShowSuggestModal(true)}
              className="bg-black hover:bg-gray-900 text-white px-4 py-3 rounded-lg font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Suggest Scenario
            </button>
          </div>
        </motion.div>

        {/* Rating Modal */}
        <AnimatePresence>
          {showRatingModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => !submitted && setShowRatingModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl relative"
              >
                {!submitted ? (
                  <>
                    <button
                      onClick={() => setShowRatingModal(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Rate This Simulation</h3>
                    <p className="text-gray-600 mb-6">How valuable was this learning experience?</p>
                    
                    <div className="flex justify-center gap-2 mb-8">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-12 h-12 ${
                              star <= (hoveredStar || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={handleRatingSubmit}
                      disabled={rating === 0}
                      className="w-full bg-[#E41E2B] hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Submit Rating
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h3>
                    <p className="text-gray-600">Your feedback helps us improve.</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggest Scenario Modal */}
        <AnimatePresence>
          {showSuggestModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => !submitted && setShowSuggestModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                {!submitted ? (
                  <>
                    <button
                      onClick={() => setShowSuggestModal(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-[#E41E2B] rounded-full flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Suggest a Scenario</h3>
                    </div>
                    
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      We are continuously expanding our simulation library to cover real-world business challenges where AI agents can drive meaningful impact. 
                      Your input is invaluable in helping us build scenarios that resonate with actual workflows and demonstrate the transformative potential of agentic AI to your colleagues across the organization.
                    </p>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Describe a business scenario where AI agents could help:
                      </label>
                      <textarea
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                        placeholder="Example: Automating monthly contract renewals in procurement, where we spend hours manually tracking expiration dates and emailing vendors..."
                        className="w-full h-40 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-[#E41E2B] focus:outline-none resize-none"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Include details like: department, current manual process, pain points, and estimated time spent
                      </p>
                    </div>
                    
                    <button
                      onClick={handleSuggestionSubmit}
                      disabled={suggestion.trim().length < 20}
                      className="w-full bg-[#E41E2B] hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Submit Suggestion
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Suggestion Received!</h3>
                    <p className="text-gray-600">
                      Thank you for contributing to our simulation library. We'll review your scenario and consider it for future development.
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}