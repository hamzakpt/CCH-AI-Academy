import { useState, useEffect, useRef } from 'react';
import { Bot, AlertCircle, Sparkles, Send, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Message = {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  buttons?: { label: string; value: string }[];
  data?: any;
};

interface Phase2AgenticProps {
  onComplete: () => void;
}

export function Phase2Agentic({ onComplete }: Phase2AgenticProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showMindsetPopup, setShowMindsetPopup] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial greeting
    setTimeout(() => {
      addAIMessage(
        "Daily audit complete across 12 retailers. Found 3 price discrepancies.",
        [
          { label: 'Show me the highest priority leak', value: 'show-priority' },
          { label: 'Show all discrepancies', value: 'show-all' },
        ]
      );
    }, 500);
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
      if (value === 'show-priority') {
        addAIMessage(
          "Here's the highest priority compliance issue:",
          undefined,
          {
            retailer: 'Carrefour',
            product: 'Coca-Cola Zero 4-Pack',
            sku: 'CCZ4PK-GR',
            status: 'Non-Compliant',
            agreedPrice: '€3.99',
            actualPrice: '€4.50',
            loss: '€1,200/day',
          }
        );
        setTimeout(() => {
          addAIMessage(
            'They are charging €4.50; the agreed promo is €3.99. Estimated loss: €1,200/day.',
            [
              { label: 'Draft a correction request', value: 'draft-request' },
              { label: 'Show evidence screenshot', value: 'show-evidence' },
            ]
          );
        }, 1000);
      } else if (value === 'show-all') {
        addAIMessage(
          "Here are all 3 discrepancies found today:",
          undefined,
          {
            type: 'all-issues',
            issues: [
              { retailer: 'Carrefour', product: 'Coca-Cola Zero 4-Pack', agreedPrice: '€3.99', actualPrice: '€4.50', loss: '€1,200/day' },
              { retailer: 'Jumbo', product: 'Fanta Orange 6-Pack', agreedPrice: '€5.49', actualPrice: '€5.99', loss: '€450/day' },
              { retailer: 'AB Vassilopoulos', product: 'Sprite 2L', agreedPrice: '€1.79', actualPrice: '€1.99', loss: '€280/day' }
            ]
          }
        );
        setTimeout(() => {
          addAIMessage(
            'Total estimated daily loss: €1,930. Which would you like to address first?',
            [
              { label: 'Start with highest priority', value: 'show-priority' },
            ]
          );
        }, 1000);
      } else if (value === 'show-evidence') {
        addAIMessage(
          "Here's the timestamped screenshot evidence from Carrefour's website:",
          undefined,
          {
            type: 'screenshot',
            timestamp: '2026-02-18 09:15 AM',
            url: 'carrefour.gr/coca-cola-zero-4pack',
            price: '€4.50',
          }
        );
        setTimeout(() => {
          addAIMessage(
            'Screenshot captured and ready to attach. What would you like to do next?',
            [
              { label: 'Draft a correction request', value: 'draft-request' },
            ]
          );
        }, 1000);
      } else if (value === 'draft-request') {
        addAIMessage(
          "I've drafted this correction request email:",
          undefined,
          {
            type: 'email',
            to: 'dimitris.papadopoulos@carrefour.gr',
            subject: 'Urgent: Promo Compliance Issue - Coca-Cola Zero 4-Pack',
            body: `Dear Dimitris,

I hope this email finds you well. I'm reaching out regarding a pricing discrepancy we've identified on our Joint Business Plan promotion.

**Issue Details:**
• Product: Coca-Cola Zero 4-Pack (SKU: CCZ4PK-GR)
• Agreed Promotional Price: €3.99
• Current Price on Website: €4.50
• Variance: +€0.51 (12.8% above agreed price)

Our monitoring system detected this discrepancy at 09:15 this morning. I've attached a timestamped screenshot from your webshop as evidence.

This pricing gap is impacting our joint promotional performance and estimated to result in approximately €1,200 in daily revenue loss.

Could we please arrange to correct this as soon as possible? I'm happy to discuss any questions or concerns.

Looking forward to your prompt response.

Best regards,
Account Manager - CCH`
          }
        );
        setTimeout(() => {
          addAIMessage(
            "Would you like me to send this to the Category Manager, adjust the tone, or would you prefer to edit it yourself?",
            [
              { label: 'Make it Firmer', value: 'tone-firm' },
              { label: 'Keep it Collaborative', value: 'tone-collaborative' },
              { label: 'Edit Message Myself', value: 'edit-myself' },
              { label: 'Send Now', value: 'send-now' },
            ]
          );
        }, 1000);
      } else if (value === 'edit-myself') {
        addAIMessage(
          "Opening draft in your email client. I'll monitor for responses.",
          [{ label: 'Continue to Summary', value: 'send-now' }]
        );
      } else if (value === 'tone-firm') {
        addAIMessage(
          "Here's the revised email with a firmer tone:",
          undefined,
          {
            type: 'email',
            to: 'dimitris.papadopoulos@carrefour.gr',
            subject: 'Action Required: JBP Price Compliance Issue - Coca-Cola Zero 4-Pack',
            body: `Dimitris,

We have identified a critical pricing discrepancy that requires immediate attention.

**Issue Details:**
• Product: Coca-Cola Zero 4-Pack (SKU: CCZ4PK-GR)
• Contracted Promotional Price: €3.99
• Current Live Price: €4.50
• Variance: +€0.51 (12.8% over agreement)

This was detected at 09:15 today. Screenshot evidence is attached.

**Impact:**
• Estimated daily revenue loss: €1,200
• JBP compliance breach
• Customer trust at risk

We need this corrected by end of business today. Please confirm receipt and expected resolution time.

Best regards,
Account Manager - CCH`
          }
        );
        setTimeout(() => {
          addAIMessage(
            "Firmer tone applied. Ready to send when you approve.",
            [{ label: 'Send Now', value: 'send-now' }]
          );
        }, 1000);
      } else if (value === 'tone-collaborative') {
        addAIMessage(
          "Tone kept collaborative. Ready to send when you approve.",
          [{ label: 'Send Now', value: 'send-now' }]
        );
      } else if (value === 'send-now') {
        addAIMessage('✓ Email sent to the Carrefour Category Manager. I will continue monitoring and alert you to any response or price changes.');
        setTimeout(() => {
          setShowMindsetPopup(true);
        }, 1500);
        setTimeout(() => {
          onComplete();
        }, 6000);
      }
    }, 800);
  };

  return (
    <div className="h-full overflow-hidden p-3">
      <div className="max-w-[1600px] mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-2 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900 mb-1">AI-Powered Promo Compliance Auditing</h2>

          <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded">
            <h3 className="font-semibold text-green-900 text-xs mb-1">The New Reality:</h3>
            <ul className="text-[10px] text-green-800 space-y-0.5 list-disc list-inside">
              <li>AI Agent audits all 150 SKUs automatically (completed in 3 minutes)</li>
              <li>You only review high-priority issues and make decisions</li>
              <li>Evidence collection and email drafting is automated</li>
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
                  <h3 className="text-white text-base font-bold">CCH Compliance Agent</h3>
                  <div className="flex items-center gap-2 text-red-100 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Active • Real-time Monitoring</span>
                  </div>
                </div>
                <div className="text-right text-white text-xs">
                  <p className="font-semibold">Daily Audit: Complete</p>
                  <p className="text-red-100">150/150 SKUs</p>
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
                        <p className="text-xs leading-relaxed">{message.text}</p>
                        
                        {/* Data Card */}
                        {message.data && (
                          <div className="mt-3 bg-white rounded-lg border-2 border-red-200 p-4">
                            {message.data.type === 'email' ? (
                              // Email Draft Display
                              <div>
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                                  <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs">✉</span>
                                  </div>
                                  <h4 className="font-semibold text-gray-900 text-sm">Email Draft</h4>
                                </div>
                                <div className="space-y-2 text-xs mb-3">
                                  <div className="flex gap-2">
                                    <span className="text-gray-600 font-semibold min-w-[60px]">To:</span>
                                    <span className="text-gray-900">{message.data.to}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <span className="text-gray-600 font-semibold min-w-[60px]">Subject:</span>
                                    <span className="text-gray-900 font-semibold">{message.data.subject}</span>
                                  </div>
                                </div>
                                <div className="bg-gray-50 rounded p-3 border border-gray-200">
                                  <pre className="text-xs text-gray-900 whitespace-pre-wrap font-sans leading-relaxed">
                                    {message.data.body}
                                  </pre>
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                  <span>📎 Attachment: price_screenshot_2026-02-18_0915.png</span>
                                </div>
                              </div>
                            ) : message.data.type === 'screenshot' ? (
                              // Screenshot Evidence Display
                              <div>
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                                  <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs">📸</span>
                                  </div>
                                  <h4 className="font-semibold text-gray-900 text-sm">Screenshot Evidence</h4>
                                </div>
                                <div className="bg-gray-100 rounded-lg p-4 mb-3">
                                  <div className="bg-white rounded border-2 border-gray-300 p-4">
                                    <div className="text-xs text-gray-500 mb-2">Timestamp: {message.data.timestamp}</div>
                                    <div className="text-xs text-gray-500 mb-3">Source: {message.data.url}</div>
                                    <div className="bg-red-50 border-2 border-red-300 rounded p-6 text-center">
                                      <div className="text-4xl mb-2">🥤</div>
                                      <div className="text-sm font-semibold text-gray-900 mb-2">Coca-Cola Zero 4-Pack</div>
                                      <div className="text-3xl font-bold text-red-700">{message.data.price}</div>
                                      <div className="text-xs text-gray-500 mt-2">Live on website</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  ✓ Evidence captured and ready to attach to compliance request
                                </div>
                              </div>
                            ) : message.data.type === 'all-issues' ? (
                              // All Issues Display
                              <div>
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                                  <AlertCircle className="w-5 h-5 text-red-600" />
                                  <h4 className="font-semibold text-red-900 text-sm">All Compliance Issues</h4>
                                </div>
                                <div className="space-y-3">
                                  {message.data.issues.map((issue: any, idx: number) => (
                                    <div key={idx} className="bg-gray-50 rounded p-3 border border-gray-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-gray-900 text-sm">{issue.retailer}</span>
                                        <span className="text-xs text-red-600 font-bold">{issue.loss}</span>
                                      </div>
                                      <div className="text-xs text-gray-700 mb-1">{issue.product}</div>
                                      <div className="flex gap-4 text-xs">
                                        <span>Agreed: <strong className="text-green-700">{issue.agreedPrice}</strong></span>
                                        <span>Actual: <strong className="text-red-700">{issue.actualPrice}</strong></span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              // Compliance Issue Display
                              <>
                                <div className="flex items-center gap-2 mb-3">
                                  <AlertCircle className="w-5 h-5 text-red-600" />
                                  <h4 className="font-semibold text-red-900 text-sm">High Priority Issue</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-gray-600 text-xs mb-1">Retailer</p>
                                    <p className="font-semibold text-gray-900">{message.data.retailer}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 text-xs mb-1">Product</p>
                                    <p className="font-semibold text-gray-900">{message.data.product}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 text-xs mb-1">Agreed Price</p>
                                    <p className="font-semibold text-green-700 text-base">{message.data.agreedPrice}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 text-xs mb-1">Actual Price</p>
                                    <p className="font-semibold text-red-700 text-base">{message.data.actualPrice}</p>
                                  </div>
                                  <div className="col-span-2 bg-red-50 rounded p-3 mt-2">
                                    <p className="text-gray-600 text-xs mb-1">Estimated Daily Loss</p>
                                    <p className="font-bold text-red-900 text-xl">{message.data.loss}</p>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        {message.buttons && message.buttons.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.buttons.map((button, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleButtonClick(button.value, button.label)}
                                className="w-full bg-[#E41E2B] hover:bg-red-700 text-white px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                              >
                                {button.label}
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {message.sender === 'user' && (
                        <div className="flex items-center gap-2 mt-1 justify-end">
                          <span className="text-xs text-gray-500">You</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input (Disabled) */}
            <div className="bg-gray-100 px-6 py-4 border-t border-gray-300 flex-shrink-0">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Use the suggested actions above..."
                  disabled
                  className="flex-1 px-4 py-3 bg-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                />
                <button
                  disabled
                  className="bg-gray-300 text-gray-500 p-3 rounded-lg cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Click the suggested actions to continue
              </p>
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
              onClick={() => setShowMindsetPopup(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg p-8 max-w-md shadow-2xl"
              >
                <h3 className="text-2xl font-bold mb-4">🤝 The Agent Handles Evidence Gathering</h3>
                <p className="text-lg mb-6 leading-relaxed">
                  You only step in to manage the <strong>"Human Relationship"</strong> with the retailer. 
                  The AI provides the facts; you provide the partnership.
                </p>
                <button
                  onClick={() => setShowMindsetPopup(false)}
                  className="bg-white text-green-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors w-full"
                >
                  Continue →
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
                className="bg-white rounded-xl p-8 max-w-2xl shadow-2xl border-4 border-green-500"
              >
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-200">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Phase 2: The AI-Assisted Way</h3>
                    <p className="text-sm text-gray-600">Same Task, Smarter Approach</p>
                  </div>
                </div>

                {/* Main Description */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">What's Different:</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You're still the Trade Promotions Manager, but now you have an <strong className="text-green-600">AI assistant</strong> that 
                    handles the repetitive auditing work while you focus on decision-making and relationship management.
                  </p>
                </div>

                {/* What the AI Does */}
                <div className="bg-green-50 rounded-lg p-4 mb-6 border-2 border-green-200">
                  <h4 className="text-lg font-bold text-green-900 mb-3">How It Works:</h4>
                  <div className="space-y-2 text-sm text-green-800">
                    <p>✓ <strong>AI automatically audits</strong> all 150 SKUs across 12 retailers (in 3 minutes)</p>
                    <p>✓ <strong>AI identifies discrepancies</strong> and calculates financial impact</p>
                    <p>✓ <strong>AI captures evidence</strong> with timestamped screenshots</p>
                    <p>✓ <strong>You review priorities</strong> and make strategic decisions</p>
                    <p>✓ <strong>You manage communication</strong> with retail partners</p>
                  </div>
                </div>

                {/* Your Role */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
                  <h4 className="text-base font-bold text-blue-900 mb-2">Your Role in This Phase:</h4>
                  <p className="text-sm text-blue-800">
                    Interact with the AI agent through the chat interface. Click the suggested actions to 
                    review findings, request evidence, and draft communications. You stay in control while 
                    the AI handles the time-consuming tasks.
                  </p>
                </div>

                <button
                  onClick={() => setShowWelcomePopup(false)}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors w-full shadow-lg"
                >
                  Got It — Start AI-Assisted Audit →
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}