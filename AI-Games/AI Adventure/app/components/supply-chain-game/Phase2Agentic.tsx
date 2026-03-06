import { useState, useEffect, useRef } from 'react';
import { Bot, AlertCircle, Sparkles, Send, ArrowRight, ArrowLeft } from 'lucide-react';
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
  onBack?: () => void;
}

export function Phase2Agentic({ onComplete, onBack }: Phase2AgenticProps) {
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
        "Daily supplier risk scan complete. 2 critical alerts detected across 50 suppliers.",
        [
          { label: 'Show me the alerts', value: 'show-alerts' },
          { label: 'What\'s the priority level?', value: 'priority' },
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
      if (value === 'show-alerts' || value === 'priority') {
        addAIMessage(
          "Here are the 2 critical supplier risks detected:",
          undefined,
          {
            type: 'all-risks',
            risks: [
              { 
                supplier: 'GlassCo Romania', 
                status: 'At Risk', 
                severity: 'HIGH',
                reason: 'Glass factory explosion detected',
                capacity: '40% at risk',
                backups: '3 Ready'
              },
              { 
                supplier: 'PackTech Poland', 
                status: 'Unknown', 
                severity: 'MEDIUM',
                reason: 'Quality investigation reported',
                capacity: '25% at risk',
                backups: '2 Ready'
              }
            ]
          }
        );
        setTimeout(() => {
          addAIMessage(
            'Total capacity at risk: 65%. I\'ve already mapped backup suppliers. Which issue should we address first?',
            [
              { label: 'Address GlassCo Romania (Highest Risk)', value: 'glassco' },
              { label: 'Show backup supplier options', value: 'backups' },
            ]
          );
        }, 1000);
      } else if (value === 'glassco' || value === 'show-priority') {
        addAIMessage(
          "Focusing on GlassCo Romania - the highest priority risk:",
          undefined,
          {
            type: 'single-risk',
            supplier: 'GlassCo Romania',
            status: 'At Risk',
            severity: 'HIGH',
            reason: 'Reuters: Major explosion at glass factory in Romania',
            capacityAtRisk: '40%',
            impactAnalysis: 'Production halt expected for 2-3 weeks',
            backupSuppliers: '3 Ready',
            responseTime: '72 sec'
          }
        );
        setTimeout(() => {
          addAIMessage(
            'I\'ve identified 3 backup suppliers with capacity. What would you like to do?',
            [
              { label: 'Contact backup supplier now', value: 'contact-backup' },
              { label: 'Show backup supplier details', value: 'backup-details' },
            ]
          );
        }, 1000);
      } else if (value === 'backups' || value === 'backup-details') {
        addAIMessage(
          "Here are the pre-qualified backup suppliers I found:",
          undefined,
          {
            type: 'backup-list',
            backups: [
              { name: 'CrystalGlass Hungary', capacity: '500K units/month', leadTime: '2 weeks', status: 'Available' },
              { name: 'EuroGlass Bulgaria', capacity: '350K units/month', leadTime: '3 weeks', status: 'Available' },
              { name: 'Vidrala Spain', capacity: '800K units/month', leadTime: '4 weeks', status: 'Partial Availability' }
            ]
          }
        );
        setTimeout(() => {
          addAIMessage(
            'CrystalGlass Hungary has the fastest lead time and confirmed availability. Should I proceed?',
            [
              { label: 'Yes, contact CrystalGlass Hungary', value: 'contact-backup' },
            ]
          );
        }, 1000);
      } else if (value === 'contact-backup') {
        addAIMessage(
          "I've drafted this outreach email to CrystalGlass Hungary:",
          undefined,
          {
            type: 'email',
            to: 'procurement@crystalglass.hu',
            subject: 'Urgent: Emergency Glass Bottle Supply Request - Coca-Cola Hellenic',
            body: `Dear CrystalGlass Procurement Team,

I hope this message finds you well. We have an urgent sourcing requirement due to an unexpected production disruption at one of our primary suppliers.

**Requirement Details:**
• Product: 500ml Glass Bottles (Coca-Cola Standard Spec)
• Volume Needed: 400,000 units
• Timeline: Delivery within 2 weeks
• Quality Standards: ISO 9001 certified, food-grade compliance

**Background:**
Our primary supplier (GlassCo Romania) has experienced a production halt due to a facility incident. We need to secure alternative capacity immediately to maintain our production schedule.

CrystalGlass Hungary was identified as a pre-qualified backup supplier in our risk mitigation database based on:
• Capacity availability (500K units/month confirmed)
• 2-week lead time capability
• Previous quality certifications on file

Could you please confirm availability and provide:
1. Pricing quote for 400K units
2. Earliest delivery date
3. Quality certification documentation

We would appreciate a response within 24 hours given the urgency.

Best regards,
Supply Chain Manager - CCH`
          }
        );
        setTimeout(() => {
          addAIMessage(
            "Would you like me to send this now, or would you prefer to adjust the tone or add specific requirements?",
            [
              { label: 'Send Now', value: 'send-now' },
              { label: 'Add pricing negotiation note', value: 'add-pricing' },
              { label: 'Make it more urgent', value: 'make-urgent' },
            ]
          );
        }, 1000);
      } else if (value === 'add-pricing') {
        addAIMessage(
          "I've added a pricing negotiation paragraph:",
          undefined,
          {
            type: 'email',
            to: 'procurement@crystalglass.hu',
            subject: 'Urgent: Emergency Glass Bottle Supply Request - Coca-Cola Hellenic',
            body: `Dear CrystalGlass Procurement Team,

I hope this message finds you well. We have an urgent sourcing requirement due to an unexpected production disruption at one of our primary suppliers.

**Requirement Details:**
• Product: 500ml Glass Bottles (Coca-Cola Standard Spec)
• Volume Needed: 400,000 units
• Timeline: Delivery within 2 weeks
• Quality Standards: ISO 9001 certified, food-grade compliance

**Background:**
Our primary supplier (GlassCo Romania) has experienced a production halt due to a facility incident. We need to secure alternative capacity immediately to maintain our production schedule.

CrystalGlass Hungary was identified as a pre-qualified backup supplier in our risk mitigation database based on:
• Capacity availability (500K units/month confirmed)
• 2-week lead time capability
• Previous quality certifications on file

**Pricing & Partnership:**
Given the urgency and our commitment to establishing a long-term partnership, we're prepared to discuss favorable pricing terms. We view this as an opportunity to build a strategic relationship beyond this immediate need.

Could you please confirm availability and provide:
1. Pricing quote for 400K units (with volume discount consideration)
2. Earliest delivery date
3. Quality certification documentation

We would appreciate a response within 24 hours given the urgency.

Best regards,
Supply Chain Manager - CCH`
          }
        );
        setTimeout(() => {
          addAIMessage(
            "Pricing negotiation added. Ready to send?",
            [{ label: 'Send Now', value: 'send-now' }]
          );
        }, 1000);
      } else if (value === 'make-urgent') {
        addAIMessage(
          "Here's the message with increased urgency:",
          undefined,
          {
            type: 'email',
            to: 'procurement@crystalglass.hu',
            subject: 'URGENT - IMMEDIATE ACTION REQUIRED: Emergency Supply Request - Coca-Cola Hellenic',
            body: `URGENT - CrystalGlass Procurement Team,

We require immediate assistance due to a critical supply chain disruption.

**CRITICAL REQUIREMENT:**
• Product: 500ml Glass Bottles (Coca-Cola Standard Spec)
• Volume: 400,000 units
• Timeline: MUST deliver within 2 weeks
• Quality: ISO 9001 certified, food-grade

**SITUATION:**
GlassCo Romania facility explosion has halted all production. Our manufacturing line faces shutdown risk within 10 days without alternative supply.

**WHY CRYSTALGLASS:**
Your facility was pre-qualified as our priority backup:
• Confirmed 500K units/month capacity
• 2-week lead time capability
• Quality certifications verified

**IMMEDIATE ACTION NEEDED:**
Please respond within 12 hours with:
1. Availability confirmation for 400K units
2. Pricing quote
3. Earliest delivery commitment

This is a high-priority escalation. We're prepared to expedite PO and payment terms.

Regards,
Supply Chain Manager - CCH`
          }
        );
        setTimeout(() => {
          addAIMessage(
            "Urgency level increased. Ready to send?",
            [{ label: 'Send Now', value: 'send-now' }]
          );
        }, 1000);
      } else if (value === 'send-now') {
        addAIMessage('✓ Email sent to CrystalGlass Hungary. I will monitor their response and alert you when they reply. Meanwhile, I\'ll continue monitoring the other 48 suppliers for emerging risks.');
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
        {/* Header with Back Button */}
        <div className="mb-2 flex-shrink-0">
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
            <h2 className="text-lg font-bold text-gray-900 flex-1 text-center">AI-Powered Supplier Risk Monitoring</h2>
            <div className="w-20" /> {/* Spacer for alignment */}
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded">
            <h3 className="font-semibold text-green-900 text-xs mb-1">The New Reality:</h3>
            <ul className="text-[10px] text-green-800 space-y-0.5 list-disc list-inside">
              <li>AI Agent monitors all 50 suppliers 24/7 (real-time news scanning)</li>
              <li>You only review critical alerts and make strategic decisions</li>
              <li>Backup supplier mapping and outreach drafting is automated</li>
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
                  <h3 className="text-white text-base font-bold">Risk Sentinel Agent</h3>
                  <div className="flex items-center gap-2 text-red-100 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Active • 24/7 Monitoring</span>
                  </div>
                </div>
                <div className="text-right text-white text-xs">
                  <p className="font-semibold">Daily Scan: Complete</p>
                  <p className="text-red-100">50/50 Suppliers</p>
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
                              </div>
                            ) : message.data.type === 'backup-list' ? (
                              // Backup Suppliers List
                              <div>
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                                  <AlertCircle className="w-5 h-5 text-green-600" />
                                  <h4 className="font-semibold text-green-900 text-sm">Backup Suppliers Available</h4>
                                </div>
                                <div className="space-y-3">
                                  {message.data.backups.map((backup: any, idx: number) => (
                                    <div key={idx} className="bg-gray-50 rounded p-3 border border-gray-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-gray-900 text-sm">{backup.name}</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                                          backup.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>{backup.status}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <span>Capacity: <strong>{backup.capacity}</strong></span>
                                        <span>Lead Time: <strong>{backup.leadTime}</strong></span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : message.data.type === 'all-risks' ? (
                              // All Risks Display
                              <div>
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                                  <AlertCircle className="w-5 h-5 text-red-600" />
                                  <h4 className="font-semibold text-red-900 text-sm">Critical Supplier Risks</h4>
                                </div>
                                <div className="space-y-3">
                                  {message.data.risks.map((risk: any, idx: number) => (
                                    <div key={idx} className="bg-gray-50 rounded p-3 border border-gray-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-gray-900 text-sm">{risk.supplier}</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                                          risk.severity === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                        }`}>{risk.severity}</span>
                                      </div>
                                      <div className="text-xs text-gray-700 mb-2">{risk.reason}</div>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <span>Capacity at Risk: <strong className="text-red-700">{risk.capacity}</strong></span>
                                        <span>Backups: <strong className="text-green-700">{risk.backups}</strong></span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : message.data.type === 'single-risk' ? (
                              // Single Risk Detail Display
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <AlertCircle className="w-5 h-5 text-red-600" />
                                  <h4 className="font-semibold text-red-900 text-sm">High Priority Risk</h4>
                                </div>
                                <div className="space-y-3">
                                  <div className="bg-red-50 rounded p-3">
                                    <p className="text-xs font-bold text-red-900 mb-1">{message.data.supplier}</p>
                                    <p className="text-xs text-red-800">{message.data.reason}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                      <p className="text-gray-600 mb-1">Capacity at Risk</p>
                                      <p className="font-bold text-red-700 text-base">{message.data.capacityAtRisk}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600 mb-1">Backup Suppliers</p>
                                      <p className="font-bold text-green-700 text-base">{message.data.backupSuppliers}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600 mb-1">Impact Analysis</p>
                                      <p className="font-semibold text-gray-900">{message.data.impactAnalysis}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600 mb-1">Response Time</p>
                                      <p className="font-semibold text-green-700">{message.data.responseTime}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : null}
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
                <h3 className="text-2xl font-bold mb-4">🤖 The Agent Handles Monitoring & Research</h3>
                <p className="text-lg mb-6 leading-relaxed">
                  You only step in to make <strong>strategic sourcing decisions</strong> and manage supplier relationships. 
                  The AI provides real-time intelligence; you provide the business judgment.
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
                    <h3 className="text-2xl font-bold text-gray-900">Phase 2: The AI-Powered Way</h3>
                    <p className="text-sm text-gray-600">Same Task, Intelligent Automation</p>
                  </div>
                </div>

                {/* Main Description */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">What's Different:</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You're still the Supply Chain Manager, but now you have an <strong className="text-green-600">AI Risk Sentinel</strong> that 
                    continuously monitors all suppliers, detects risks instantly, and prepares actionable recommendations.
                  </p>
                </div>

                {/* What the AI Does */}
                <div className="bg-green-50 rounded-lg p-4 mb-6 border-2 border-green-200">
                  <h4 className="text-lg font-bold text-green-900 mb-3">How It Works:</h4>
                  <div className="space-y-2 text-sm text-green-800">
                    <p>✓ <strong>AI monitors 24/7</strong> - scans global news for all 50 suppliers continuously</p>
                    <p>✓ <strong>AI maps risks instantly</strong> - calculates capacity impact in 2 seconds</p>
                    <p>✓ <strong>AI identifies backups</strong> - pre-qualifies alternative suppliers automatically</p>
                    <p>✓ <strong>You make decisions</strong> - review priorities and choose actions</p>
                    <p>✓ <strong>You manage relationships</strong> - oversee supplier communications</p>
                  </div>
                </div>

                {/* Your Role */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
                  <h4 className="text-base font-bold text-blue-900 mb-2">Your Role in This Phase:</h4>
                  <p className="text-sm text-blue-800">
                    Interact with the Risk Sentinel through the chat interface. Click the suggested actions to 
                    review alerts, evaluate backup options, and approve communications. You stay in control while 
                    the AI handles continuous monitoring and analysis.
                  </p>
                </div>

                <button
                  onClick={() => setShowWelcomePopup(false)}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors w-full shadow-lg"
                >
                  Got It — Start AI-Powered Monitoring →
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
