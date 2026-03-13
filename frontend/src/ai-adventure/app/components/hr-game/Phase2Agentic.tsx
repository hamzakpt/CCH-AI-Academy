import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, BarChart3, AlertTriangle, ArrowRight, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Phase2AgenticProps {
  onComplete: () => void;
}

type Message = {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  buttons?: { label: string; value: string }[];
  data?: any;
};

interface AnomalyData {
  type: 'scoring' | 'bias';
  title: string;
  description: string;
  severity: string;
  details: any;
}

export function Phase2Agentic({ onComplete }: Phase2AgenticProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAnomalies, setShowAnomalies] = useState(false);
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show summary popup 3 seconds after showAnomalies becomes true
  useEffect(() => {
    if (showAnomalies) {
      const timer = setTimeout(() => {
        setShowSummaryPopup(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showAnomalies]);

  // Auto-start conversation
  useEffect(() => {
    const timer = setTimeout(() => {
      addAIMessage(
        "Performance review analysis complete for Engineering department. Scanned 10 reviews from 3 managers. Found 2 critical calibration anomalies.",
        [
          { label: 'Show me the anomalies', value: 'show-anomalies' },
          { label: 'What\'s the priority level?', value: 'priority' },
        ]
      );
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const addAIMessage = (text: string, buttons?: { label: string; value: string }[], data?: any) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        sender: 'ai',
        text,
        timestamp: new Date(),
        buttons,
        data,
      },
    ]);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        sender: 'user',
        text,
        timestamp: new Date(),
      },
    ]);
  };

  const handleButtonClick = (value: string, label: string) => {
    addUserMessage(label);

    setTimeout(() => {
      if (value === 'show-anomalies' || value === 'priority') {
        addAIMessage(
          "Here are the 2 critical anomalies I detected:",
          undefined,
          {
            type: 'all-anomalies',
            anomalies: [
              { 
                title: 'Scoring Inconsistency', 
                manager: 'Robert Martinez',
                severity: 'HIGH',
                impact: '1.2 points below dept average',
                employees: 5
              },
              { 
                title: 'Gender-Biased Language', 
                manager: 'Robert Martinez',
                severity: 'CRITICAL',
                impact: '67% of female reviews vs 20% male',
                reviews: 4
              }
            ]
          }
        );
        setTimeout(() => {
          addAIMessage(
            'Both anomalies involve Manager Robert Martinez. Would you like to review them individually?',
            [
              { label: 'Review Anomaly 1: Scoring Inconsistency', value: 'anomaly-scoring' },
              { label: 'Review Anomaly 2: Bias Language', value: 'anomaly-bias' },
            ]
          );
        }, 1000);
      } else if (value === 'anomaly-scoring') {
        addAIMessage(
          'Here\'s the detailed scoring inconsistency analysis:',
          undefined,
          {
            type: 'scoring',
            title: 'Hard Grader Pattern: Manager Robert Martinez',
            description: 'Systematically grades 1.2 points lower than peers for employees with equivalent performance metrics',
            severity: 'HIGH',
            details: {
              managerAvg: 2.3,
              deptAvg: 3.5,
              deviation: -1.2,
              reviewCount: 5,
              employees: [
                { name: 'Sarah Chen', score: 2, expectedRange: '3-4', role: 'Senior Engineer' },
                { name: 'Jennifer Wu', score: 3, expectedRange: '3.5-4.5', role: 'Senior Engineer' },
                { name: 'David Park', score: 2, expectedRange: '3-4', role: 'Engineer II' },
              ]
            }
          }
        );
        
        setTimeout(() => {
          addAIMessage(
            'When comparing employees with similar roles, output quality, and project complexity, Manager Martinez consistently grades 1.2 points lower than other managers. For example, Sarah Chen (Senior Engineer) received a 2, while peers with comparable performance in other teams averaged 3-4. This suggests a systematic grading bias rather than team performance differences.',
            [
              { label: 'Review Anomaly 2: Bias Language', value: 'anomaly-bias' },
              { label: 'Schedule calibration with Manager Martinez', value: 'action-calibration' },
            ]
          );
        }, 1500);
      } else if (value === 'anomaly-bias') {
        addAIMessage(
          'Here\'s the detailed bias language analysis:',
          undefined,
          {
            type: 'bias',
            title: 'Gendered Language Pattern: Manager Robert Martinez',
            description: 'Systematic use of gender-stereotyped descriptors across female vs. male reports',
            severity: 'CRITICAL',
            details: {
              femaleReviews: {
                percentage: 67,
                commonTerms: ['supportive', 'helpful', 'emotional', 'nurturing', 'agreeable', 'needs to smile'],
                examples: [
                  { employee: 'Sarah Chen', phrase: 'needs to smile more', context: 'client meetings' },
                  { employee: 'Sarah Chen', phrase: 'too emotional', context: 'technical discussions' },
                  { employee: 'Jennifer Wu', phrase: 'too agreeable', context: 'planning meetings' },
                ]
              },
              maleReviews: {
                percentage: 20,
                commonTerms: ['technical leadership', 'ambitious', 'takes charge', 'analytical', 'confident'],
                examples: [
                  { employee: 'Michael Torres', phrase: 'strong technical leadership', context: 'project execution' },
                  { employee: 'Michael Torres', phrase: 'takes charge', context: 'team meetings' },
                ]
              }
            }
          }
        );
        
        setTimeout(() => {
          addAIMessage(
            'Manager Martinez uses subjective and gendered adjectives in 67% of reviews for female employees, compared to 20% for male employees. This language pattern violates company policy on objective performance feedback. Recommended action: Request rewrite of affected reviews.',
            [
              { label: 'Flag reviews for rewrite', value: 'action-rewrite' },
              { label: 'View both anomalies summary', value: 'view-summary' },
            ]
          );
        }, 1500);
      } else if (value === 'action-calibration') {
        addAIMessage('✓ Calendar invitation sent to Robert Martinez for calibration discussion. Meeting scheduled for Tuesday, March 17 at 2:00 PM. Calibration meeting notes template prepared with scoring data.');
        
        setTimeout(() => {
          addAIMessage(
            'Would you like to review the bias language anomaly as well?',
            [
              { label: 'Review Anomaly 2: Bias Language', value: 'anomaly-bias' },
              { label: 'View final summary', value: 'complete' },
            ]
          );
        }, 1000);
      } else if (value === 'action-rewrite') {
        addAIMessage('✓ 4 reviews flagged and returned to Manager Martinez with policy guidelines on objective feedback. Notification sent to HR Business Partner for coaching follow-up.');
        
        setTimeout(() => {
          addAIMessage(
            'All flagged reviews will require resubmission within 5 business days. Would you like to view the final summary?',
            [
              { label: 'View final summary', value: 'complete' },
            ]
          );
        }, 1000);
      } else if (value === 'view-summary') {
        setShowAnomalies(true);
        
        setTimeout(() => {
          addAIMessage(
            '**Complete Analysis Summary:**\n\n✓ 10 reviews processed\n✓ 2 critical anomalies identified\n✓ 4 reviews flagged for rewrite\n✓ 1 manager calibration required\n\nRecommended actions ready for your approval.',
            [
              { label: 'Approve recommended actions', value: 'approve-actions' },
            ]
          );
        }, 800);
      } else if (value === 'approve-actions') {
        addAIMessage('✓ Actions approved and executed:\n\n1. Calendar invite sent to Robert Martinez\n2. 4 reviews returned for rewrite\n3. HR Business Partner notified\n4. Calibration dashboard updated');
        
        setTimeout(() => {
          addAIMessage(
            'Performance calibration process complete. Would you like to see the impact comparison?',
            [
              { label: 'View insights dashboard', value: 'complete' },
            ]
          );
        }, 1200);
      } else if (value === 'complete') {
        setShowAnomalies(true);
      }
    }, 800);
  };

  return (
    <div className="h-full overflow-hidden p-3">
      <div className="max-w-[1600px] mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-2 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900 mb-1">AI-Powered Performance Review Calibration</h2>

          <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded">
            <h3 className="font-semibold text-green-900 text-xs mb-1">The New Reality:</h3>
            <ul className="text-[10px] text-green-800 space-y-0.5 list-disc list-inside">
              <li>AI Agent analyzes all reviews automatically (completed in 2 minutes)</li>
              <li>You only review critical anomalies and make strategic decisions</li>
              <li>Pattern detection and action drafting is automated</li>
            </ul>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          {/* Chat Interface - Centered */}
          <div className="w-full max-w-5xl bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-2xl border-2 border-[#E41E2B] overflow-hidden flex flex-col h-full">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-[#E41E2B] to-red-600 px-4 py-2 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#E41E2B]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-base font-bold">HR Calibration Agent</h3>
                  <div className="flex items-center gap-2 text-red-100 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Active • Real-time Analysis</span>
                  </div>
                </div>
                <div className="text-right text-white text-xs">
                  <p className="font-semibold">Review Scan: Complete</p>
                  <p className="text-red-100">10/10 Reviews</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="bg-white flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      {message.sender === 'ai' && (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 bg-[#E41E2B] rounded-full flex items-center justify-center">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-xs text-gray-500 font-semibold">AI Agent</span>
                        </div>
                      )}
                      
                      <div
                        className={`rounded-lg p-3 ${
                          message.sender === 'ai'
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-[#E41E2B] text-white'
                        }`}
                      >
                        <p className="text-xs leading-relaxed whitespace-pre-line">{message.text}</p>
                        
                        {/* Data Card */}
                        {message.data && (
                          <div className="mt-3 bg-white rounded-lg border-2 border-red-200 p-4">
                            {/* All Anomalies Summary */}
                            {message.data.type === 'all-anomalies' && (
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                                  Critical Anomalies Detected
                                </h4>
                                <div className="space-y-2">
                                  {message.data.anomalies.map((anomaly: any, idx: number) => (
                                    <div key={idx} className="bg-gray-50 rounded p-3 border border-gray-200">
                                      <div className="flex items-start justify-between mb-1">
                                        <h5 className="font-semibold text-gray-900 text-xs">{anomaly.title}</h5>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          anomaly.severity === 'CRITICAL' 
                                            ? 'bg-red-100 text-red-700' 
                                            : 'bg-orange-100 text-orange-700'
                                        }`}>
                                          {anomaly.severity}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-gray-600 mb-1">Manager: {anomaly.manager}</p>
                                      <p className="text-[10px] text-gray-700 font-semibold">Impact: {anomaly.impact}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Scoring Anomaly Details */}
                            {message.data.type === 'scoring' && (
                              <div>
                                <div className="flex items-start gap-3 mb-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    message.data.severity === 'CRITICAL' ? 'bg-red-100' : 'bg-orange-100'
                                  }`}>
                                    <AlertTriangle className={`w-5 h-5 ${
                                      message.data.severity === 'CRITICAL' ? 'text-red-600' : 'text-orange-600'
                                    }`} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-bold text-gray-900">{message.data.title}</h4>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        message.data.severity === 'CRITICAL' 
                                          ? 'bg-red-100 text-red-700' 
                                          : 'bg-orange-100 text-orange-700'
                                      }`}>
                                        {message.data.severity}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600">{message.data.description}</p>
                                  </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                                  <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="bg-white rounded p-2 border border-gray-200">
                                      <p className="text-[10px] text-gray-600 mb-1">Manager Avg</p>
                                      <p className="text-lg font-bold text-red-600">{message.data.details.managerAvg}</p>
                                    </div>
                                    <div className="bg-white rounded p-2 border border-gray-200">
                                      <p className="text-[10px] text-gray-600 mb-1">Peer Managers Avg</p>
                                      <p className="text-lg font-bold text-blue-600">{message.data.details.deptAvg}</p>
                                    </div>
                                    <div className="bg-white rounded p-2 border border-gray-200">
                                      <p className="text-[10px] text-gray-600 mb-1">Deviation</p>
                                      <p className="text-lg font-bold text-orange-600">{message.data.details.deviation}</p>
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-xs font-semibold text-gray-700 mb-2">Affected Employees:</p>
                                    <div className="space-y-1">
                                      {message.data.details.employees.map((emp: any, idx: number) => (
                                        <div key={idx} className="bg-white rounded px-3 py-2 flex items-center justify-between text-xs border border-gray-200">
                                          <span className="font-medium">{emp.name}</span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-red-600 font-bold">Score: {emp.score}</span>
                                            <span className="text-gray-500">→</span>
                                            <span className="text-gray-600">Peer Avg: {emp.expectedRange}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Bias Anomaly Details */}
                            {message.data.type === 'bias' && (
                              <div>
                                <div className="flex items-start gap-3 mb-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    message.data.severity === 'CRITICAL' ? 'bg-red-100' : 'bg-orange-100'
                                  }`}>
                                    <AlertTriangle className={`w-5 h-5 ${
                                      message.data.severity === 'CRITICAL' ? 'text-red-600' : 'text-orange-600'
                                    }`} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-bold text-gray-900">{message.data.title}</h4>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        message.data.severity === 'CRITICAL' 
                                          ? 'bg-red-100 text-red-700' 
                                          : 'bg-orange-100 text-orange-700'
                                      }`}>
                                        {message.data.severity}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600">{message.data.description}</p>
                                  </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-pink-50 border-2 border-pink-300 rounded-lg p-3">
                                      <p className="text-xs font-bold text-pink-900 mb-2">Female Employees</p>
                                      <p className="text-2xl font-bold text-pink-700 mb-2">{message.data.details.femaleReviews.percentage}%</p>
                                      <div className="flex flex-wrap gap-1">
                                        {message.data.details.femaleReviews.commonTerms.map((term: string, idx: number) => (
                                          <span key={idx} className="bg-pink-200 px-2 py-0.5 rounded text-[10px] text-pink-900">
                                            {term}
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                                      <p className="text-xs font-bold text-blue-900 mb-2">Male Employees</p>
                                      <p className="text-2xl font-bold text-blue-700 mb-2">{message.data.details.maleReviews.percentage}%</p>
                                      <div className="flex flex-wrap gap-1">
                                        {message.data.details.maleReviews.commonTerms.map((term: string, idx: number) => (
                                          <span key={idx} className="bg-blue-200 px-2 py-0.5 rounded text-[10px] text-blue-900">
                                            {term}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-xs font-semibold text-gray-700 mb-2">Example Flagged Phrases:</p>
                                    <div className="space-y-1">
                                      {message.data.details.femaleReviews.examples.map((ex: any, idx: number) => (
                                        <div key={idx} className="bg-white rounded px-3 py-2 text-xs border border-pink-200">
                                          <span className="font-medium">{ex.employee}:</span>
                                          <span className="ml-2 text-pink-700 font-semibold">"{ex.phrase}"</span>
                                          <span className="ml-2 text-gray-500">({ex.context})</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {message.buttons && (
                        <div className="flex flex-col gap-2 w-full mt-2">
                          {message.buttons.map((button, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleButtonClick(button.value, button.label)}
                              className="bg-[#E41E2B] hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-between group transition-colors"
                            >
                              <span>{button.label}</span>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Processing Indicator */}
              {isProcessing && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-[#E41E2B] rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#E41E2B] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#E41E2B] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-[#E41E2B] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      <span className="text-sm text-gray-600 ml-2">Analyzing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Summary Popup */}
        <AnimatePresence>
          {showSummaryPopup && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setShowSummaryPopup(false)}
              />
              
              {/* Popup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
              >
                <div 
                  className="bg-white rounded-xl p-8 max-w-2xl shadow-2xl border-4 border-green-500 pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-200">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-9 h-9 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Performance Calibration Complete</h3>
                      <p className="text-sm text-gray-600">AI Agent Analysis Summary</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-800"><span className="font-semibold">10 reviews processed</span> across 3 managers</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-800"><span className="font-semibold">2 critical anomalies identified</span> (scoring pattern + bias language)</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-800"><span className="font-semibold">4 reviews flagged for rewrite</span> due to policy violations</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-800"><span className="font-semibold">1 manager calibration scheduled</span> for March 17</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-blue-700 mt-0.5" />
                        <div>
                          <p className="font-semibold text-blue-900 text-sm mb-1">Impact</p>
                          <p className="text-xs text-blue-800">Automated detection prevented unfair scoring and discriminatory language from affecting 5 employees' career progression.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      setShowSummaryPopup(false);
                      onComplete();
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg"
                  >
                    View Insights Dashboard →
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}