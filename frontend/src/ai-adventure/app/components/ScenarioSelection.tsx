import { Card, CardContent } from '@ai-adventure/app/components/ui/card';
import { Button } from '@ai-adventure/app/components/ui/button';
import { Badge } from '@ai-adventure/app/components/ui/badge';
import { Scenario } from '@ai-adventure/app/types/scenario';
import { fetchScenarios, fetchAllRatings, submitRating, RatingSummary } from '@ai-adventure/app/services/scenariosApi';
import { Clock, ArrowRight, ArrowLeft, Users, Factory, DollarSign, Scale, Laptop, TrendingUp, Sparkles, Lightbulb, X, CheckCircle, Flame, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import hellenIcon from '/hellen-logo-transparent-background.png';
import { RatingDisplay } from '@ai-adventure/app/components/RatingDisplay';
import { RatingModal } from '@ai-adventure/app/components/RatingModal';
import { CommentsViewModal } from '@ai-adventure/app/components/CommentsViewModal';
import { motion, AnimatePresence } from 'motion/react';

interface ScenarioSelectionProps {
  onScenarioSelect: (scenario: Scenario, mode: 'learn' | 'apply') => void;
  onBackToHome?: () => void;
  userEmail?: string;
}

interface ScenarioRating {
  averageRating: number;
  totalRatings: number;
  userRatings: { rating: number; comment: string; createdAt?: string }[];
}

export function ScenarioSelection({ onScenarioSelect, onBackToHome, userEmail }: ScenarioSelectionProps) {
  const functions = ['Commercial', 'Supply Chain', 'Finance', 'HR', 'Other'] as const;
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFunction, setSelectedFunction] = useState<typeof functions[number]>('Commercial');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratings, setRatings] = useState<Record<string, ScenarioRating>>({});
  const [ratingModalOpen, setRatingModalOpen] = useState<string | null>(null);
  const [commentsModalOpen, setCommentsModalOpen] = useState<string | null>(null);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Fetch scenarios and ratings from API on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch scenarios and ratings in parallel
        const [scenariosData, ratingsData] = await Promise.all([
          fetchScenarios(),
          fetchAllRatings()
        ]);

        setScenarios(scenariosData);

        // Convert API ratings to local format
        const ratingsMap: Record<string, ScenarioRating> = {};
        for (const [scenarioId, summary] of Object.entries(ratingsData.ratings)) {
          ratingsMap[scenarioId] = {
            averageRating: summary.averageRating,
            totalRatings: summary.totalRatings,
            userRatings: summary.ratings.map(r => ({
              rating: r.rating,
              comment: r.comment || '',
              createdAt: r.createdAt
            }))
          };
        }
        setRatings(ratingsMap);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load scenarios. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRatingSubmit = async (scenarioId: string, rating: number, comment: string) => {
    const username = userEmail || 'anonymous';

    try {
      setIsSubmittingRating(true);

      // Submit rating to API
      await submitRating(scenarioId, username, rating, comment);

      // Update local state optimistically
      setRatings(prev => {
        const currentRating = prev[scenarioId] || { averageRating: 0, totalRatings: 0, userRatings: [] };
        const newUserRatings = [...currentRating.userRatings, { rating, comment, createdAt: new Date().toISOString() }];
        const totalRatings = newUserRatings.length;
        const averageRating = newUserRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

        return {
          ...prev,
          [scenarioId]: {
            averageRating: Math.round(averageRating * 10) / 10,
            totalRatings,
            userRatings: newUserRatings
          }
        };
      });
    } catch (err) {
      console.error('Failed to submit rating:', err);
      // Could show an error toast here
    } finally {
      setIsSubmittingRating(false);
    }
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFunctionIcon = (func: string) => {
    switch (func) {
      case 'Commercial': return <TrendingUp className="h-6 w-6" />;
      case 'Supply Chain': return <Factory className="h-6 w-6" />;
      case 'Finance': return <DollarSign className="h-6 w-6" />;
      case 'HR': return <Users className="h-6 w-6" />;
      case 'Other': return <Laptop className="h-6 w-6" />;
      default: return <Scale className="h-6 w-6" />;
    }
  };

  const getFunctionColor = (func: string) => {
    switch (func) {
      case 'Commercial': return 'bg-red-50 text-gray-800 border-red-200';
      case 'Supply Chain': return 'bg-cyan-50 text-gray-800 border-cyan-200';
      case 'Finance': return 'bg-yellow-50 text-gray-800 border-yellow-200';
      case 'HR': return 'bg-purple-50 text-gray-800 border-purple-200';
      case 'Other': return 'bg-orange-50 text-gray-800 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getFunctionIconBg = (func: string) => {
    switch (func) {
      case 'Commercial': return 'bg-red-100';
      case 'Supply Chain': return 'bg-cyan-100';
      case 'Finance': return 'bg-yellow-100';
      case 'HR': return 'bg-purple-100';
      case 'Other': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  };

  const getFunctionAccent = (func: string) => {
    switch (func) {
      case 'Commercial': return 'text-red-700';
      case 'Supply Chain': return 'text-cyan-700';
      case 'Finance': return 'text-yellow-700';
      case 'HR': return 'text-purple-700';
      case 'Other': return 'text-orange-700';
      default: return 'text-gray-600';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-[#E41E2B] animate-spin mb-4" />
        <p className="text-gray-600">Loading scenarios...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#E41E2B] hover:bg-[#DC0008] text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        )}
        <div className="flex-1 text-center">
          <h2 className="text-2xl text-gray-900 mb-1 font-bold">Choose Your First Mission</h2>
        </div>
        <div className="w-20" /> {/* Spacer for alignment */}
      </div>
      <div className="text-center mb-4">
        <p className="text-gray-600 text-sm">
          Select a business scenario to start your AI Adventure
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative max-w-2xl mx-auto">
          <img 
            src={hellenIcon} 
            alt="Search" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6" 
          />
          <input
            type="text"
            placeholder="Search scenarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#E41E2B] text-gray-900 placeholder:text-gray-500"
          />
        </div>
        
        {/* Suggest Scenario Call-to-Action */}
        <div className="text-center mt-3">
          <button
            onClick={() => setShowSuggestModal(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-full hover:border-[#E41E2B] hover:shadow-md transition-all group"
          >
            <div className="w-5 h-5 bg-[#E41E2B] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Lightbulb className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800">
              Can't find what you're looking for?
            </span>
            <span className="text-sm font-bold text-[#E41E2B] underline">
              Suggest a scenario
            </span>
          </button>
        </div>
      </div>

      {/* Function Selector Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {functions.map(func => {
          const funcScenarios = scenarios.filter(s => s.function === func && !s.hidden);
          const isSelected = selectedFunction === func;
          
          return (
            <button
              key={func}
              onClick={() => setSelectedFunction(func)}
              className={`relative p-3 rounded-xl transition-all ${
                isSelected
                  ? 'bg-white shadow-xl scale-105 border-4 border-[#E41E2B]'
                  : 'bg-white shadow-sm hover:shadow-md border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`h-8 w-8 mx-auto rounded-lg ${getFunctionIconBg(func)} flex items-center justify-center mb-2 ${getFunctionAccent(func)}`}>
                {getFunctionIcon(func)}
              </div>
              <div className="text-xs font-semibold text-gray-900 mb-0.5">{func}</div>
              <div className="text-[10px] text-gray-500">
                {funcScenarios.length} {funcScenarios.length === 1 ? 'scenario' : 'scenarios'}
              </div>
              {isSelected && (
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-[#E41E2B] rounded-full flex items-center justify-center shadow-lg">
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Scenarios Grid */}
      {(() => {
        // Filter out hidden scenarios first
        const visibleScenarios = scenarios.filter(s => !s.hidden);

        // If searching, show all matching scenarios across all functions
        // If not searching, show scenarios for the selected function only
        const funcScenarios = searchQuery.trim()
          ? visibleScenarios.filter(s =>
              s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : visibleScenarios.filter(s => s.function === selectedFunction);

        return (
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              {searchQuery.trim()
                ? `Search Results (${funcScenarios.length})`
                : `${selectedFunction} Scenarios`}
            </h3>
            <AnimatePresence mode="wait">
              <motion.div
                key={searchQuery.trim() ? `search-${searchQuery}` : selectedFunction}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {funcScenarios.map(scenario => {
                  const isAvailable = scenario.active === true;

                  return (
                    <Card
                      key={scenario.id}
                      className={`bg-white border-2 border-gray-200 shadow-lg transition-all hover:shadow-xl overflow-visible ${
                        isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'
                      }`}
                      onClick={() => isAvailable && onScenarioSelect(scenario, 'learn')}
                    >
                      <CardContent className="p-0 overflow-visible">
                        {/* Card Header - Subtle color */}
                        <div className={`${getFunctionColor(scenario.function)} border-b-2 p-4 relative overflow-visible`}>
                        {/* Flagship Badge - Top Right */}
                        {scenario.flagship && (
                          <div className="absolute -top-2 -right-2 z-10">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg text-[10px] font-bold uppercase tracking-wide">
                              <Flame className="h-3 w-3" />
                              <span>Best</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Rating Display - Top Right */}
                        <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
                          <RatingDisplay
                            averageRating={ratings[scenario.id]?.averageRating || 0}
                            totalRatings={ratings[scenario.id]?.totalRatings || 0}
                            onRate={() => setRatingModalOpen(scenario.id)}
                            onViewComments={() => setCommentsModalOpen(scenario.id)}
                          />
                        </div>

                        {/* Icon and Title Side-by-Side */}
                        <div className="flex items-center gap-3 mb-2 pr-16">
                          {typeof scenario.icon === 'string' ? (
                            <div className="text-3xl flex-shrink-0">{scenario.icon}</div>
                          ) : (
                            <div className={`h-10 w-10 flex-shrink-0 rounded-lg ${getFunctionIconBg(scenario.function)} flex items-center justify-center ${getFunctionAccent(scenario.function)}`}>
                              <scenario.icon className="h-6 w-6" />
                            </div>
                          )}

                          <h4 className={`text-base font-bold leading-tight ${getFunctionAccent(scenario.function)} flex-1`}>
                            {scenario.title}
                          </h4>
                        </div>

                        {/* Removed time display */}
                      </div>

                      {/* Card Body */}
                      <div className="p-4">
                        <p className="text-xs text-gray-700 mb-3 line-clamp-2">
                          {scenario.description}
                        </p>

                        {/* Problem Statement */}
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-2 mb-3 rounded">
                          <p className="text-[10px] text-amber-900 line-clamp-2">
                            <strong>Challenge:</strong> {scenario.problem}
                          </p>
                        </div>

                        {/* CTA Button */}
                        {isAvailable ? (
                          <Button
                            onClick={() => onScenarioSelect(scenario, 'learn')}
                            className="w-full bg-[#E41E2B] hover:bg-[#DC0008] text-white transition-all font-semibold shadow-lg text-xs py-2"
                          >
                            Start Here
                            <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        ) : (
                          <Button
                            disabled
                            className="w-full bg-gray-300 text-gray-500 cursor-not-allowed font-semibold text-xs py-2"
                          >
                            Coming Soon
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              </motion.div>
            </AnimatePresence>

            {funcScenarios.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No scenarios available for this function yet.</p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Rating Modal */}
      {ratingModalOpen && (
        <RatingModal
          scenarioId={ratingModalOpen}
          scenarioTitle={scenarios.find(s => s.id === ratingModalOpen)?.title}
          existingComments={ratings[ratingModalOpen]?.userRatings || []}
          onSubmit={handleRatingSubmit}
          onClose={() => setRatingModalOpen(null)}
        />
      )}

      {/* Comments Modal */}
      {commentsModalOpen && (
        <CommentsViewModal
          scenarioId={commentsModalOpen}
          scenarioTitle={scenarios.find(s => s.id === commentsModalOpen)?.title}
          comments={ratings[commentsModalOpen]?.userRatings || []}
          averageRating={ratings[commentsModalOpen]?.averageRating || 0}
          onClose={() => setCommentsModalOpen(null)}
          onAddRating={() => setRatingModalOpen(commentsModalOpen)}
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
  );
}