import { TrendingDown, Clock, Zap, Shield, CheckCircle, Home, Star, Lightbulb, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { RatingModal } from '@ai-adventure/app/components/RatingModal';
import { submitRating, fetchScenarioRatings, submitSuggestion } from '@ai-adventure/app/services/scenariosApi';

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

interface FinalSummaryProps {
  onBack?: () => void;
  scenarioId: string;
  scenarioTitle?: string;
  userEmail: string;
}

export function FinalSummary({ onBack, scenarioId, scenarioTitle = 'Supply Chain Risk Simulation', userEmail }: FinalSummaryProps) {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [existingComments, setExistingComments] = useState<{ rating: number; comment: string; createdAt?: string }[]>([]);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    if (scenarioId) {
      fetchScenarioRatings(scenarioId)
        .then(data => {
          setExistingComments(data.ratings.map(r => ({ rating: r.rating, comment: r.comment || '', createdAt: r.createdAt })));
        })
        .catch(() => setExistingComments([]));
    }
  }, [scenarioId]);

  const handleRatingSubmit = async (_scenarioId: string, rating: number, comment: string) => {
    setIsSubmittingRating(true);
    try {
      await submitRating(scenarioId, userEmail, rating, comment);
      // Refresh comments after submission
      const data = await fetchScenarioRatings(scenarioId);
      setExistingComments(data.ratings.map(r => ({ rating: r.rating, comment: r.comment || '', createdAt: r.createdAt })));
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);

  const handleSuggestionSubmit = async () => {
    if (suggestion.trim().length < 20) return;

    setIsSubmittingSuggestion(true);
    try {
      await submitSuggestion(userEmail, suggestion.trim());
      setSubmitted(true);
      setTimeout(() => {
        setShowSuggestModal(false);
        setSubmitted(false);
        setSuggestion('');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit suggestion:', error);
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="max-w-[1400px] mx-auto">
        {/* Hero Section with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-3"
        >
          {/* Back Button and Completion Badge on same line */}
          <div className="flex items-center justify-between mb-3">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
            )}
            <div className="flex-1" /> {/* Spacer */}
            <div className="inline-flex items-center gap-2 bg-green-50 border-2 border-green-500 rounded-full px-4 py-1.5 flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-900 font-bold text-xs">Simulation Complete!</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            The "Aha!" Moment: Impact Metrics
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            You've experienced both the manual firefighting and the AI-powered solution. 
            Here's the transformation in numbers.
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <MetricCard
            label="Daily Monitoring Time"
            manual="4+ Hours (Manual)"
            agentic="0 Minutes (Automated)"
            icon={<Clock className="w-4 h-4" />}
          />
          
          <MetricCard
            label="Monitoring Frequency"
            manual="Reactive (Ad-hoc)"
            agentic="Real-time (24/7)"
            icon={<Zap className="w-4 h-4" />}
          />
          
          <MetricCard
            label="Risk Detection Speed"
            manual="24-48 Hours"
            agentic="< 2 Minutes"
            icon={<TrendingDown className="w-4 h-4" />}
          />
          
          <MetricCard
            label="Supply Chain Impact"
            manual="High Disruption Risk"
            agentic="Proactive Protection"
            icon={<Shield className="w-4 h-4" />}
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
                  <th className="text-left p-2 font-bold text-red-700 text-xs">The Manual Firefight</th>
                  <th className="text-left p-2 font-bold text-green-700 text-xs">The Agentic Shift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-2 font-semibold text-gray-900 text-xs">Cognitive Load</td>
                  <td className="p-2 text-red-700 text-xs">High (Manual Searching)</td>
                  <td className="p-2 text-green-700 text-xs">Low (Reviewing & Deciding)</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-2 font-semibold text-gray-900 text-xs">User Role</td>
                  <td className="p-2 text-red-700 text-xs">Risk Firefighter</td>
                  <td className="p-2 text-green-700 text-xs">Strategic Supply Chain Manager</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-2 font-semibold text-gray-900 text-xs">Coverage</td>
                  <td className="p-2 text-red-700 text-xs">Sampled (2 of 50 suppliers)</td>
                  <td className="p-2 text-green-700 text-xs">100% Continuous (All 50)</td>
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
                You are no longer a <strong>"Manual Checker."</strong> You are now a <strong>"Strategic Risk Manager."</strong> 
                Let the Agent monitor 24/7 while you focus on high-value decisions.
              </p>
            </div>
            <div>
              <h4 className="text-[#E41E2B] font-bold mb-1 text-sm">🤝 Control</h4>
              <p className="text-gray-300 leading-relaxed text-xs">
                Moving from reactive firefighting to proactive protection. The AI provides <strong>"Early Warning Intelligence"</strong>, 
                so you can focus on <strong>"Strategic Sourcing Decisions."</strong>
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
              type="button"
              onClick={onBack}
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
        {showRatingModal && (
          <RatingModal
            scenarioId={scenarioId}
            scenarioTitle={scenarioTitle}
            existingComments={existingComments}
            onClose={() => setShowRatingModal(false)}
            onSubmit={handleRatingSubmit}
            isSubmitting={isSubmittingRating}
          />
        )}

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
                        placeholder="Example: Automating supplier invoice reconciliation in finance, where we spend hours manually matching POs to invoices and flagging discrepancies..."
                        className="w-full h-40 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-[#E41E2B] focus:outline-none resize-none"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Include details like: department, current manual process, pain points, and estimated time spent
                      </p>
                    </div>
                    
                    <button
                      onClick={handleSuggestionSubmit}
                      disabled={suggestion.trim().length < 20 || isSubmittingSuggestion}
                      className="w-full bg-[#E41E2B] hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isSubmittingSuggestion ? 'Submitting...' : 'Submit Suggestion'}
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
