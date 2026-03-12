import { useState, useRef, useEffect } from 'react';
import { Bot, User, Shield, ArrowRight, Sparkles, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';
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

export function Phase2Agentic({ onComplete }: Phase2AgenticProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMindsetPopup, setShowMindsetPopup] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [showRiskReviewModal, setShowRiskReviewModal] = useState(false);
  const [riskConfirmations, setRiskConfirmations] = useState({
    risk1: false,
    risk2: false,
    risk3: false
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-start conversation
  useEffect(() => {
    if (!showWelcomePopup) {
      setTimeout(() => {
        addAIMessage(
          'Contract analysis complete for Vendor Agreement v4.2. Scanned 60 pages, extracted 147 clauses, and compared against Standard Global Indemnity Playbook. Found 3 critical clauses that expose Coca-Cola to excessive risk.',
          [
            { label: 'Show me the risk details', value: 'show-risks' },
            { label: 'Draft counter-clauses immediately', value: 'generate-counter' }
          ]
        );
      }, 500);
    }
  }, [showWelcomePopup]);

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

    // Trigger AI response
    setIsProcessing(true);
    
    if (text.includes('analyze this 60-page')) {
      setTimeout(() => {
        setIsProcessing(false);
        addAIMessage(
          'Scanning document...\nReading 60 pages • Extracting clauses • Parsing legal language...',
          undefined,
          { type: 'scanning' }
        );
        
        setTimeout(() => {
          addAIMessage(
            'Analysis complete for Vendor Agreement v4.2. Found 3 critical clauses that expose Coca-Cola to excessive risk.',
            undefined,
            {
              type: 'analysis-complete',
              document: 'Vendor Agreement v4.2 • 60 pages • 147 clauses extracted',
              playbook: 'Analyzed against Standard Global Indemnity Playbook',
              risks: [
                { section: 'Section 18.3 Indemnification', issue: 'Unlimited liability on Coca-Cola', standard: 'Standard: $50K mutual cap' },
                { section: 'Section 22.1 Termination', issue: 'Asymmetric rights - Vendor: 10 days, Coca-Cola: 120 days', standard: 'Standard: 30-day mutual' },
                { section: 'Section 9.4 Data Rights', issue: 'Perpetual vendor access', standard: 'Standard: Term-limited' }
              ]
            }
          );
          
          setTimeout(() => {
            addAIMessage(
              "I've identified 3 critical clauses that expose Coca-Cola to excessive risk. Would you like me to draft the standard counter-language for your review?",
              [
                { label: 'Yes, generate the recommended counter-clauses', value: 'generate-counter' },
                { label: 'Show me the risk details first', value: 'show-details' }
              ]
            );
          }, 1500);
        }, 2500);
      }, 800);
    } else if (text.includes('generate the recommended counter-clauses') || text.includes('Yes, generate')) {
      setTimeout(() => {
        setIsProcessing(false);
        
        // Generate counter-clauses only for confirmed risks
        const confirmedRisks = [];
        if (riskConfirmations.risk1) {
          confirmedRisks.push({
            section: 'Section 18.3 Indemnification',
            original: 'Unlimited liability on Coca-Cola',
            corrected: '"Each party shall indemnify the other from claims arising from its breach of this Agreement, <strong>with liability capped at $50,000 per incident</strong> and mutual defense obligations."'
          });
        }
        if (riskConfirmations.risk2) {
          confirmedRisks.push({
            section: 'Section 22.1 Termination',
            original: 'Vendor: 10 days, Coca-Cola: 120 days',
            corrected: '"Either party may terminate this Agreement for convenience upon <strong>30 days\' written notice to the other party</strong>, with equal termination rights."'
          });
        }
        if (riskConfirmations.risk3) {
          confirmedRisks.push({
            section: 'Section 9.4 Data Rights',
            original: 'Perpetual vendor access',
            corrected: '"Vendor may access Company data <strong>solely during the contract term</strong> for service delivery purposes. Upon termination, Vendor shall <strong>delete all Company data within 30 days</strong>."'
          });
        }
        
        // If no risks confirmed, use all 3
        if (confirmedRisks.length === 0) {
          confirmedRisks.push(
            {
              section: 'Section 18.3 Indemnification',
              original: 'Unlimited liability on Coca-Cola',
              corrected: '"Each party shall indemnify the other from claims arising from its breach of this Agreement, <strong>with liability capped at $50,000 per incident</strong> and mutual defense obligations."'
            },
            {
              section: 'Section 22.1 Termination',
              original: 'Vendor: 10 days, Coca-Cola: 120 days',
              corrected: '"Either party may terminate this Agreement for convenience upon <strong>30 days\' written notice to the other party</strong>, with equal termination rights."'
            },
            {
              section: 'Section 9.4 Data Rights',
              original: 'Perpetual vendor access',
              corrected: '"Vendor may access Company data <strong>solely during the contract term</strong> for service delivery purposes. Upon termination, Vendor shall <strong>delete all Company data within 30 days</strong>."'
            }
          );
        }
        
        addAIMessage(
          `Drafted ${confirmedRisks.length} counter-clause${confirmedRisks.length === 1 ? '' : 's'} based on playbook standards:`,
          undefined,
          { 
            type: 'counter-clauses',
            clauses: confirmedRisks
          }
        );
        // Email question now appears only when user clicks "Confirm & Use These Corrections"
      }, 800);
    } else if (text.includes('draft-email')) {
      setTimeout(() => {
        setIsProcessing(false);
        
        const confirmedCount = Object.values(riskConfirmations).filter(Boolean).length || 3;
        
        addAIMessage(
          'Email drafted and ready for your review:',
          undefined,
          {
            type: 'email-draft',
            subject: 'Vendor Agreement v4.2 - Requested Contract Modifications',
            to: 'legal@vendor.com',
            from: 'legal@coca-cola.com',
            body: `Dear Vendor Legal Team,

Thank you for providing the Vendor Agreement v4.2 for our review. Our legal team has completed the contract analysis and identified ${confirmedCount} clause${confirmedCount === 1 ? '' : 's'} that require modification to align with Coca-Cola's standard business terms.

We request the following changes be incorporated into the next revision:

${riskConfirmations.risk1 || (!riskConfirmations.risk1 && !riskConfirmations.risk2 && !riskConfirmations.risk3) ? '• Section 18.3 Indemnification: Mutual liability cap of $50,000 per incident\n' : ''}${riskConfirmations.risk2 || (!riskConfirmations.risk1 && !riskConfirmations.risk2 && !riskConfirmations.risk3) ? '• Section 22.1 Termination: Equal 30-day termination notice for both parties\n' : ''}${riskConfirmations.risk3 || (!riskConfirmations.risk1 && !riskConfirmations.risk2 && !riskConfirmations.risk3) ? '• Section 9.4 Data Rights: Data access limited to contract term with 30-day deletion upon termination\n' : ''}
Detailed redline markup is attached for your review. We believe these modifications create balanced terms that benefit both parties while protecting our respective business interests.

Please let us know if you have any questions or would like to schedule a call to discuss these requested changes.

Best regards,
Coca-Cola Legal Department`
          }
        );
        
        setTimeout(() => {
          addAIMessage(
            'Email is ready. Would you like to send it now or save as draft?',
            [
              { label: '✉️ Send Email Now', value: 'send-email' },
              { label: '💾 Save as Draft & Finish', value: 'complete' }
            ]
          );
        }, 1000);
      }, 800);
    } else if (text.includes('send-email')) {
      setTimeout(() => {
        setIsProcessing(false);
        setShowMindsetPopup(true);
      }, 800);
    }
  };

  const handleButtonClick = (value: string, label: string) => {
    addUserMessage(label);

    // Trigger AI response
    setIsProcessing(true);

    if (value === 'show-risks') {
      setTimeout(() => {
        setIsProcessing(false);
        // Open the interactive risk review modal instead of just showing summary
        setShowRiskReviewModal(true);
      }, 800);
    } else if (value === 'generate-counter') {
      setTimeout(() => {
        setIsProcessing(false);
        
        // Generate counter-clauses only for confirmed risks
        const confirmedRisks = [];
        if (riskConfirmations.risk1) {
          confirmedRisks.push({
            section: 'Section 18.3 Indemnification',
            original: 'Unlimited liability on Coca-Cola',
            corrected: '"Each party shall indemnify the other from claims arising from its breach of this Agreement, <strong>with liability capped at $50,000 per incident</strong> and mutual defense obligations."'
          });
        }
        if (riskConfirmations.risk2) {
          confirmedRisks.push({
            section: 'Section 22.1 Termination',
            original: 'Vendor: 10 days, Coca-Cola: 120 days',
            corrected: '"Either party may terminate this Agreement for convenience upon <strong>30 days\' written notice to the other party</strong>, with equal termination rights."'
          });
        }
        if (riskConfirmations.risk3) {
          confirmedRisks.push({
            section: 'Section 9.4 Data Rights',
            original: 'Perpetual vendor access',
            corrected: '"Vendor may access Company data <strong>solely during the contract term</strong> for service delivery purposes. Upon termination, Vendor shall <strong>delete all Company data within 30 days</strong>."'
          });
        }
        
        // If no risks confirmed, use all 3
        if (confirmedRisks.length === 0) {
          confirmedRisks.push(
            {
              section: 'Section 18.3 Indemnification',
              original: 'Unlimited liability on Coca-Cola',
              corrected: '"Each party shall indemnify the other from claims arising from its breach of this Agreement, <strong>with liability capped at $50,000 per incident</strong> and mutual defense obligations."'
            },
            {
              section: 'Section 22.1 Termination',
              original: 'Vendor: 10 days, Coca-Cola: 120 days',
              corrected: '"Either party may terminate this Agreement for convenience upon <strong>30 days\' written notice to the other party</strong>, with equal termination rights."'
            },
            {
              section: 'Section 9.4 Data Rights',
              original: 'Perpetual vendor access',
              corrected: '"Vendor may access Company data <strong>solely during the contract term</strong> for service delivery purposes. Upon termination, Vendor shall <strong>delete all Company data within 30 days</strong>."'
            }
          );
        }
        
        addAIMessage(
          `Drafted ${confirmedRisks.length} counter-clause${confirmedRisks.length === 1 ? '' : 's'} based on playbook standards:`,
          undefined,
          { 
            type: 'counter-clauses',
            clauses: confirmedRisks
          }
        );
        // Email question now appears only when user clicks "Confirm & Use These Corrections"
      }, 800);
    } else if (value === 'draft-email') {
      setTimeout(() => {
        setIsProcessing(false);
        
        const confirmedCount = Object.values(riskConfirmations).filter(Boolean).length || 3;
        
        addAIMessage(
          'Email drafted and ready for your review:',
          undefined,
          {
            type: 'email-draft',
            subject: 'Vendor Agreement v4.2 - Requested Contract Modifications',
            to: 'legal@vendor.com',
            from: 'legal@coca-cola.com',
            body: `Dear Vendor Legal Team,

Thank you for providing the Vendor Agreement v4.2 for our review. Our legal team has completed the contract analysis and identified ${confirmedCount} clause${confirmedCount === 1 ? '' : 's'} that require modification to align with Coca-Cola's standard business terms.

We request the following changes be incorporated into the next revision:

${riskConfirmations.risk1 || (!riskConfirmations.risk1 && !riskConfirmations.risk2 && !riskConfirmations.risk3) ? '• Section 18.3 Indemnification: Mutual liability cap of $50,000 per incident\n' : ''}${riskConfirmations.risk2 || (!riskConfirmations.risk1 && !riskConfirmations.risk2 && !riskConfirmations.risk3) ? '• Section 22.1 Termination: Equal 30-day termination notice for both parties\n' : ''}${riskConfirmations.risk3 || (!riskConfirmations.risk1 && !riskConfirmations.risk2 && !riskConfirmations.risk3) ? '• Section 9.4 Data Rights: Data access limited to contract term with 30-day deletion upon termination\n' : ''}
Detailed redline markup is attached for your review. We believe these modifications create balanced terms that benefit both parties while protecting our respective business interests.

Please let us know if you have any questions or would like to schedule a call to discuss these requested changes.

Best regards,
Coca-Cola Legal Department`
          }
        );
        
        setTimeout(() => {
          addAIMessage(
            'Email is ready. Would you like to send it now or save as draft?',
            [
              { label: '✉️ Send Email Now', value: 'send-email' },
              { label: '💾 Save as Draft & Finish', value: 'complete' }
            ]
          );
        }, 1000);
      }, 800);
    } else if (value === 'send-email') {
      setTimeout(() => {
        setIsProcessing(false);
        setShowMindsetPopup(true);
      }, 800);
    } else if (value === 'review-later') {
      setTimeout(() => {
        setIsProcessing(false);
        addAIMessage(
          'Understood. The risk analysis and recommended counter-clauses are saved for your review. You can proceed whenever you\'re ready, or I can help with other contract sections.',
          [
            { label: 'Actually, let\'s proceed with counter-clauses', value: 'generate-counter' },
            { label: 'Show me the risk details again', value: 'show-risks' }
          ]
        );
      }, 800);
    }
  };

  const handleMindsetClose = () => {
    setShowMindsetPopup(false);
    // Skip intermediate message and go directly to completion
    setTimeout(() => onComplete(), 300);
  };

  const handleComplete = () => {
    setShowMindsetPopup(true);
  };

  return (
    <div className="h-full overflow-hidden p-3">
      <div className="max-w-[1600px] mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-2 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900 mb-1">AI-Powered Contract Intelligence</h2>

          <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded">
            <h3 className="font-semibold text-green-900 text-xs mb-1">The New Reality:</h3>
            <ul className="text-[10px] text-green-800 space-y-0.5 list-disc list-inside">
              <li>AI Agent analyzes entire contract automatically (completed in 45 seconds)</li>
              <li>You only review critical risk clauses and approve counter-language</li>
              <li>Clause extraction and playbook comparison is automated</li>
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
                  <h3 className="text-white text-base font-bold">Contract Review Agent</h3>
                  <div className="flex items-center gap-2 text-red-100 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Active • Real-time Analysis</span>
                  </div>
                </div>
                <div className="text-right text-white text-xs">
                  <p className="font-semibold">Document Scan</p>
                  <p className="text-red-100">Vendor Agreement v4.2</p>
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
                            {/* Scanning Status */}
                            {message.data.type === 'scanning' && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E41E2B]"></div>
                                <span className="text-xs">Processing contract...</span>
                              </div>
                            )}

                            {/* Analysis Complete */}
                            {message.data.type === 'analysis-complete' && (
                              <div>
                                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-3 mb-3">
                                  <p className="text-xs text-gray-900 mb-1">
                                    <strong>Document:</strong> {message.data.document}
                                  </p>
                                  <p className="text-xs text-gray-900">
                                    <strong>Playbook Comparison:</strong> {message.data.playbook}
                                  </p>
                                </div>
                                
                                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3">
                                  <p className="text-xs font-bold text-red-900 mb-2 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    High-Risk Exposure Found for Coca-Cola
                                  </p>
                                  <ul className="text-xs text-gray-900 space-y-1">
                                    {message.data.risks.map((risk: any, idx: number) => (
                                      <li key={idx}>
                                        • <strong>{risk.section}:</strong> {risk.issue} <span className="text-gray-600">({risk.standard})</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}

                            {/* Drafting Status */}
                            {message.data.type === 'drafting' && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E41E2B]"></div>
                                <span className="text-xs">Generating counter-language...</span>
                              </div>
                            )}

                            {/* Success */}
                            {message.data.type === 'success' && (
                              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-green-700 mb-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="text-xs font-bold">Counter-Clauses Applied Successfully</span>
                                </div>
                                <p className="text-xs text-gray-700">
                                  Redline document ready for Legal Counsel review
                                </p>
                              </div>
                            )}

                            {/* Counter-Clauses */}
                            {message.data.type === 'counter-clauses' && (
                              <div className="space-y-3">
                                {message.data.clauses.map((clause: any, idx: number) => (
                                  <div key={idx} className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-xs font-bold text-green-900">{clause.section}</p>
                                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">✓ Corrected</span>
                                    </div>
                                    <div className="bg-white rounded p-2 mb-2 border border-gray-300">
                                      <p className="text-xs text-gray-500 font-semibold mb-1">Original Issue:</p>
                                      <p className="text-xs text-gray-700 line-through">{clause.original}</p>
                                    </div>
                                    <div className="bg-white rounded p-2 border border-green-400">
                                      <p className="text-xs text-green-700 font-semibold mb-1">Corrected Language:</p>
                                      <p className="text-xs text-gray-900" dangerouslySetInnerHTML={{ __html: clause.corrected }}></p>
                                    </div>
                                  </div>
                                ))}
                                
                                {/* Action Buttons for Counter-Clauses */}
                                <div className="pt-4 space-y-3 border-t-2 border-gray-300">
                                  <p className="text-xs font-semibold text-gray-700 mb-2">How would you like to proceed?</p>
                                  <div className="grid grid-cols-2 gap-3">
                                    <button
                                      onClick={() => {
                                        addUserMessage('Confirm and use these corrections');
                                        setIsProcessing(true);
                                        setTimeout(() => {
                                          setIsProcessing(false);
                                          addAIMessage(
                                            'Counter-clauses ready for vendor negotiation. Would you like me to draft a notification email to the vendor\'s legal counsel?',
                                            [
                                              { label: 'Yes, draft the email', value: 'draft-email' },
                                              { label: 'Skip email and finish', value: 'complete' }
                                            ]
                                          );
                                        }, 800);
                                      }}
                                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      Confirm & Use These Corrections
                                    </button>
                                    <button
                                      onClick={() => {
                                        addUserMessage('Save to OneDrive for manual editing');
                                        setIsProcessing(true);
                                        setTimeout(() => {
                                          setIsProcessing(false);
                                          addAIMessage(
                                            'Creating redline document in OneDrive...',
                                            undefined,
                                            { type: 'onedrive-creation' }
                                          );
                                          setTimeout(() => {
                                            addAIMessage(
                                              'Draft document created and saved to your OneDrive. You can now manually review and adjust the counter-clauses at your convenience.',
                                              undefined,
                                              { 
                                                type: 'onedrive-complete',
                                                filename: 'Vendor_Agreement_v4.2_Redline_Draft.docx',
                                                location: 'OneDrive > Legal > Contract Reviews',
                                                url: 'https://coca-cola.sharepoint.com/legal/contracts/...'
                                              }
                                            );
                                            setTimeout(() => {
                                              setShowMindsetPopup(true);
                                            }, 2000);
                                          }, 1500);
                                        }, 800);
                                      }}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                      <FileText className="w-4 h-4" />
                                      Save to OneDrive for Manual Editing
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Email Draft */}
                            {message.data.type === 'email-draft' && (
                              <div className="bg-white border-2 border-blue-400 rounded-lg overflow-hidden">
                                <div className="bg-blue-50 px-4 py-2 border-b-2 border-blue-200">
                                  <p className="text-xs font-bold text-blue-900">✉️ Draft Email</p>
                                </div>
                                <div className="p-4 space-y-3">
                                  <div>
                                    <p className="text-xs text-gray-500 font-semibold">To:</p>
                                    <p className="text-xs text-gray-900">{message.data.to}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-semibold">From:</p>
                                    <p className="text-xs text-gray-900">{message.data.from}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-semibold">Subject:</p>
                                    <p className="text-xs text-gray-900 font-semibold">{message.data.subject}</p>
                                  </div>
                                  <div className="border-t-2 border-gray-200 pt-3">
                                    <p className="text-xs text-gray-900 whitespace-pre-line leading-relaxed">{message.data.body}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* OneDrive Creation */}
                            {message.data.type === 'onedrive-creation' && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-xs">Creating document in OneDrive...</span>
                              </div>
                            )}

                            {/* OneDrive Complete */}
                            {message.data.type === 'onedrive-complete' && (
                              <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-blue-700 mb-3">
                                  <FileText className="w-5 h-5" />
                                  <span className="text-sm font-bold">Document Created Successfully</span>
                                </div>
                                <div className="space-y-2 mb-3">
                                  <div>
                                    <p className="text-xs text-gray-600 font-semibold">File Name:</p>
                                    <p className="text-xs text-gray-900">{message.data.filename}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600 font-semibold">Location:</p>
                                    <p className="text-xs text-gray-900">{message.data.location}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600 font-semibold">Access:</p>
                                    <p className="text-xs text-blue-600 underline">{message.data.url}</p>
                                  </div>
                                </div>
                                <div className="bg-white rounded p-3 border border-blue-300">
                                  <p className="text-xs text-gray-700">
                                    <strong>Next Steps:</strong> Open the document in Word to manually review and adjust the counter-clauses. The AI has highlighted all suggested changes for your approval.
                                  </p>
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
                              onClick={() => {
                                if (button.value === 'complete') {
                                  handleComplete();
                                } else {
                                  handleButtonClick(button.value, button.label);
                                }
                              }}
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

        {/* Mindset Popup */}
        <AnimatePresence>
          {showMindsetPopup && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
              
              {/* Popup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
              >
                <div 
                  className="bg-gradient-to-br from-[#E41E2B] to-red-700 text-white rounded-xl p-8 max-w-md shadow-2xl pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-2xl font-bold mb-4">💡 The Human-in-the-Loop Gate</h3>
                  <p className="text-lg mb-6 leading-relaxed">
                    Notice how the <strong>AI handled the tedious extraction work</strong>, but you made the strategic call on which clauses were actually risky? That's the power of Agentic AI with <strong>Human-in-the-Loop</strong> control at critical moments.
                  </p>
                  <button
                    onClick={handleMindsetClose}
                    className="bg-white text-[#E41E2B] px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors w-full"
                  >
                    Continue to see the results →
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Risk Review Modal */}
        <AnimatePresence>
          {showRiskReviewModal && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
              
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
              >
                <div 
                  className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-[#E41E2B] pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="mb-6 pb-6 border-b-2 border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Review Risk Clauses</h3>
                    <p className="text-sm text-gray-600">Verify the AI's findings by reviewing the actual contract language</p>
                  </div>

                  {/* Risks */}
                  <div className="space-y-4 mb-6">
                    {/* Risk 1: Indemnification */}
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900">Section 18.3 Indemnification</h4>
                            <span className="text-xs bg-red-600 text-white px-2 py-1 rounded font-semibold">96% Confidence</span>
                          </div>
                          <span className="text-xs text-orange-600 font-semibold">Potential Risk to Coca-Cola</span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer flex-shrink-0 ml-3">
                          <input
                            type="checkbox"
                            checked={riskConfirmations.risk1}
                            onChange={(e) => setRiskConfirmations(prev => ({ ...prev, risk1: e.target.checked }))}
                            className="w-5 h-5 text-[#E41E2B] rounded focus:ring-[#E41E2B]"
                          />
                          <span className="text-sm font-semibold text-gray-700">Confirm as Risk</span>
                        </label>
                      </div>

                      <div className="bg-white rounded p-3 mb-3 border border-gray-300">
                        <p className="text-xs font-semibold text-gray-500 mb-1">CONTRACT LANGUAGE:</p>
                        <p className="text-sm text-gray-900 italic">
                          "The Company <strong>(Coca-Cola)</strong> shall indemnify, defend, and hold harmless Vendor from and against any and all claims, damages, losses, and expenses, including attorney fees, arising out of or relating to the Company's use of the Services, <strong>without limitation as to amount or duration</strong>."
                        </p>
                      </div>

                      <div className="bg-red-50 rounded p-3 border-l-4 border-red-500">
                        <p className="text-xs font-semibold text-red-900 mb-1">WHY THIS IS RISKY:</p>
                        <p className="text-xs text-red-800 mb-2">
                          This clause creates <strong>unlimited liability</strong> for Coca-Cola with no cap on financial exposure. If any claim arises, Coca-Cola could be responsible for millions in damages, attorney fees, and costs.
                        </p>
                        <p className="text-xs text-gray-700">
                          <strong>Playbook Standard:</strong> Mutual indemnification with $50,000 liability cap per incident
                        </p>
                      </div>
                    </div>

                    {/* Risk 2: Termination */}
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900">Section 22.1 Termination Rights</h4>
                            <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded font-semibold">88% Confidence</span>
                          </div>
                          <span className="text-xs text-orange-600 font-semibold">Potential Risk to Coca-Cola</span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer flex-shrink-0 ml-3">
                          <input
                            type="checkbox"
                            checked={riskConfirmations.risk2}
                            onChange={(e) => setRiskConfirmations(prev => ({ ...prev, risk2: e.target.checked }))}
                            className="w-5 h-5 text-[#E41E2B] rounded focus:ring-[#E41E2B]"
                          />
                          <span className="text-sm font-semibold text-gray-700">Confirm as Risk</span>
                        </label>
                      </div>

                      <div className="bg-white rounded p-3 mb-3 border border-gray-300">
                        <p className="text-xs font-semibold text-gray-500 mb-1">CONTRACT LANGUAGE:</p>
                        <p className="text-sm text-gray-900 italic">
                          "Either party may terminate this Agreement for convenience with written notice. <strong>Vendor may terminate with 10 days' notice. Company (Coca-Cola) must provide 120 days' notice</strong> to terminate."
                        </p>
                      </div>

                      <div className="bg-red-50 rounded p-3 border-l-4 border-red-500">
                        <p className="text-xs font-semibold text-red-900 mb-1">WHY THIS IS RISKY:</p>
                        <p className="text-xs text-red-800 mb-2">
                          <strong>Asymmetric termination rights</strong> heavily favor the vendor. Vendor can exit in 10 days while Coca-Cola is locked in for 120 days. This creates business continuity risk and reduces negotiating leverage.
                        </p>
                        <p className="text-xs text-gray-700">
                          <strong>Playbook Standard:</strong> Mutual 30-day termination notice for both parties
                        </p>
                      </div>
                    </div>

                    {/* Risk 3: Data Rights */}
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900">Section 9.4 Data Access Rights</h4>
                            <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded font-semibold">72% Confidence</span>
                          </div>
                          <span className="text-xs text-orange-600 font-semibold">Potential Risk to Coca-Cola</span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer flex-shrink-0 ml-3">
                          <input
                            type="checkbox"
                            checked={riskConfirmations.risk3}
                            onChange={(e) => setRiskConfirmations(prev => ({ ...prev, risk3: e.target.checked }))}
                            className="w-5 h-5 text-[#E41E2B] rounded focus:ring-[#E41E2B]"
                          />
                          <span className="text-sm font-semibold text-gray-700">Confirm as Risk</span>
                        </label>
                      </div>

                      <div className="bg-white rounded p-3 mb-3 border border-gray-300">
                        <p className="text-xs font-semibold text-gray-500 mb-1">CONTRACT LANGUAGE:</p>
                        <p className="text-sm text-gray-900 italic">
                          "Vendor may access Company data <strong>solely for performing the Services</strong> under this Agreement during the term. Upon termination or expiration of this Agreement, Vendor shall <strong>delete all Company data within 30 days</strong> and provide written certification of deletion."
                        </p>
                      </div>

                      <div className="bg-red-50 rounded p-3 border-l-4 border-red-500">
                        <p className="text-xs font-semibold text-red-900 mb-1">WHY THIS IS RISKY:</p>
                        <p className="text-xs text-red-800 mb-2">
                          <strong>Perpetual vendor access</strong> to Coca-Cola's proprietary data creates IP theft risk, competitive intelligence exposure, and violates data privacy best practices. Vendor retains access even after contract ends.
                        </p>
                        <p className="text-xs text-gray-700">
                          <strong>Playbook Standard:</strong> Data access limited to contract term only, with full deletion upon termination
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary of Confirmations */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 border-2 border-blue-300">
                    <p className="text-sm text-blue-900 font-semibold mb-2">
                      ✓ You have confirmed {Object.values(riskConfirmations).filter(Boolean).length} of 3 risks
                    </p>
                    <p className="text-xs text-blue-800">
                      The AI will only draft counter-clauses for risks you confirm. Review the contract language carefully before proceeding.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowRiskReviewModal(false);
                        // Add AI message about review completion
                        setTimeout(() => {
                          const confirmedCount = Object.values(riskConfirmations).filter(Boolean).length;
                          addAIMessage(
                            `You've confirmed ${confirmedCount} of 3 risks. I can draft standard counter-language based on our playbook to mitigate ${confirmedCount === 0 ? 'the risks' : confirmedCount === 1 ? 'this risk' : 'these risks'}. Proceed?`,
                            [
                              { label: 'Yes, draft counter-clauses now', value: 'generate-counter' },
                              { label: 'Hold off for now', value: 'review-later' }
                            ]
                          );
                        }, 500);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors"
                    >
                      ✓ Complete Review & Continue
                    </button>
                    <button
                      onClick={() => setShowRiskReviewModal(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Welcome Popup */}
        <AnimatePresence>
          {showWelcomePopup && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
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
                      <Sparkles className="w-9 h-9 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Phase 2: The AI-Powered Way</h3>
                      <p className="text-sm text-gray-600">Same Task, Intelligent Automation</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">What's Different:</h4>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Instead of manually reading 60 pages clause-by-clause, you'll instruct an <strong>AI Agent</strong> to do the extraction, comparison, and drafting for you. You focus on the strategic decisions only.
                    </p>
                  </div>

                  {/* How It Works */}
                  <div className="bg-green-50 rounded-lg p-4 mb-6 border-2 border-green-200">
                    <h4 className="text-lg font-bold text-green-900 mb-3">How It Works:</h4>
                    <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                      <li>You give the AI Agent a single instruction in natural language</li>
                      <li>AI scans 60 pages, extracts 147 clauses, and compares them to your legal playbook</li>
                      <li>AI identifies 3 high-risk clauses and drafts counter-language</li>
                      <li><strong>Human-in-the-Loop:</strong> You review findings and approve recommended actions</li>
                      <li>AI executes the approved changes (45 seconds vs 4.5 hours)</li>
                    </ol>
                  </div>

                  {/* Key Point */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 border-2 border-blue-300">
                    <p className="text-sm text-blue-900">
                      💡 <strong>Key Point:</strong> This is a simulated conversation to demonstrate the agentic workflow. In reality, you'd interact with the AI through a similar chat interface, giving it instructions and reviewing its findings.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowWelcomePopup(false)}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors w-full shadow-lg"
                  >
                    I Understand — Start AI-Powered Review →
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