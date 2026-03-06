import { useState, useEffect, useRef } from 'react';
import { Bot, DollarSign, Sparkles, Send, ArrowRight, FileText, Edit2, Check, X, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Message = {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  buttons?: { label: string; value: string }[];
  data?: any;
  requiresApproval?: boolean;
};

interface Phase2AgenticProps {
  onComplete: () => void;
  onBack?: () => void;
}

export function Phase2Agentic({ onComplete, onBack }: Phase2AgenticProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showMindsetPopup, setShowMindsetPopup] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [currentApproval, setCurrentApproval] = useState<any>(null);
  const [editingJE, setEditingJE] = useState(false);
  const [editedAmount, setEditedAmount] = useState('');
  const [userNote, setUserNote] = useState('');
  const [approvedCount, setApprovedCount] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0); // Track which entry we're on
  const [lowConfidenceReviewCount, setLowConfidenceReviewCount] = useState(0); // Track low-confidence reviews
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track which high-value entries have been reviewed
  const highValueEntries = [
    {
      type: 'logistics',
      department: 'Logistics Q1',
      amount: '€45,000',
      poNumber: 'PO-2026-04521',
      supplier: 'TransEurope Logistics',
      confidence: '98%',
      evidence: 'GPS delivery logs, Warehouse receipts',
      debitAccount: '6100 - Transportation Expense',
      creditAccount: '2200 - Accrued Expenses'
    },
    {
      type: 'marketing',
      department: 'Marketing - Digital Campaign',
      amount: '€23,500',
      poNumber: 'PO-2026-04892',
      supplier: 'CreativeEdge Digital Agency',
      confidence: '95%',
      evidence: 'Project milestone tracking, 80% completion',
      debitAccount: '6300 - Marketing Expense',
      creditAccount: '2200 - Accrued Expenses'
    },
    {
      type: 'it',
      department: 'IT Infrastructure',
      amount: '€67,200',
      poNumber: 'PO-2026-04156',
      supplier: 'CloudTech Solutions',
      confidence: '99%',
      evidence: 'Active SaaS licenses, Usage logs',
      debitAccount: '6500 - IT & Software Expense',
      creditAccount: '2200 - Accrued Expenses'
    }
  ];

  // Low-confidence entries that require approval
  const lowConfidenceEntries = [
    {
      type: 'consulting',
      department: 'Legal Consulting',
      amount: '€4,500',
      poNumber: 'PO-2026-03987',
      supplier: 'Norton Legal Partners',
      confidence: '71%',
      evidence: 'Partial email confirmation, incomplete hours log',
      debitAccount: '6800 - Professional Services',
      creditAccount: '2200 - Accrued Expenses',
      reason: 'Hours log incomplete - only 60% of expected hours documented'
    },
    {
      type: 'training',
      department: 'HR Training Services',
      amount: '€3,200',
      poNumber: 'PO-2026-04201',
      supplier: 'SkillBridge Academy',
      confidence: '68%',
      evidence: 'Training sessions scheduled, attendance incomplete',
      debitAccount: '6700 - HR & Training',
      creditAccount: '2200 - Accrued Expenses',
      reason: 'Attendance records show only 75% completion vs. scheduled sessions'
    }
  ];

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
        "Month-end scan complete. I have analyzed 120 Open Purchase Orders and 15 Project Timelines. I have identified 18 potential accrual entries totaling €248,300.",
        [
          { label: 'Show me the high-value entries', value: 'show-drafts' },
          { label: 'Explain your methodology', value: 'view-logic' },
        ]
      );
    }, 500);
  }, []);

  const addAIMessage = (text: string, buttons?: { label: string; value: string }[], data?: any, requiresApproval?: boolean) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        sender: 'ai',
        text,
        timestamp: new Date(),
        buttons,
        data,
        requiresApproval,
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

  const handleApprovalRequest = (approvalData: any) => {
    setCurrentApproval(approvalData);
    setEditedAmount(approvalData.amount.replace(/[€,]/g, ''));
    setUserNote('');
    setEditingJE(false); // Reset editing state
    setShowApprovalModal(true);
  };

  const handleApprove = (modified: boolean = false) => {
    setShowApprovalModal(false);
    setApprovedCount(prev => prev + 1);
    
    const isLowConfidenceReview = lowConfidenceReviewCount > 0;
    const hasMoreLowConfidence = lowConfidenceReviewCount < 2;
    const hasMoreHighValue = reviewedCount < 3;
    
    if (modified) {
      addUserMessage(`Approved with modifications: €${editedAmount} accrual${userNote ? ` (Note: ${userNote})` : ''}`);
      setTimeout(() => {
        addAIMessage(
          `✓ Journal entry updated with your modifications. Accrual amount adjusted to €${editedAmount}. ${userNote ? 'Your note has been attached to the entry.' : ''}`,
          isLowConfidenceReview
            ? (hasMoreLowConfidence ? [{ label: 'Review next low-confidence entry', value: 'next-low-confidence' }] : undefined)
            : (hasMoreHighValue ? [
                { label: 'Review next entry', value: 'next-entry' },
                { label: 'Process all remaining', value: 'process-remaining' },
              ] : undefined)
        );
        
        // Auto-advance if no more entries to review
        if (isLowConfidenceReview && !hasMoreLowConfidence) {
          setTimeout(() => {
            addAIMessage(
              '✓ All 18 accrual entries processed with your approvals. Total accrued expenses: €248,300.',
              [
                { label: 'Export to SAP ERP', value: 'export-erp' },
                { label: 'Email summary to team', value: 'email-team' },
              ]
            );
          }, 1000);
        } else if (!isLowConfidenceReview && !hasMoreHighValue) {
          setTimeout(() => {
            addAIMessage(
              `✓ All 3 high-value entries reviewed. Would you like to review the full summary or process the remaining 15 lower-value entries?`,
              [
                { label: 'Process remaining entries', value: 'process-all-remaining' },
                { label: 'Show me the full summary', value: 'review-all' },
              ]
            );
          }, 1000);
        }
      }, 800);
    } else {
      addUserMessage('Approved as recommended');
      setTimeout(() => {
        addAIMessage(
          '✓ Journal entry approved. Ready for posting.',
          isLowConfidenceReview
            ? (hasMoreLowConfidence ? [{ label: 'Review next low-confidence entry', value: 'next-low-confidence' }] : undefined)
            : (hasMoreHighValue ? [
                { label: 'Review next entry', value: 'next-entry' },
                { label: 'Process all remaining', value: 'process-remaining' },
              ] : undefined)
        );
        
        // Auto-advance if no more entries to review
        if (isLowConfidenceReview && !hasMoreLowConfidence) {
          setTimeout(() => {
            addAIMessage(
              '✓ All 18 accrual entries processed with your approvals. Total accrued expenses: €248,300.',
              [
                { label: 'Export to SAP ERP', value: 'export-erp' },
                { label: 'Email summary to team', value: 'email-team' },
              ]
            );
          }, 1000);
        } else if (!isLowConfidenceReview && !hasMoreHighValue) {
          setTimeout(() => {
            addAIMessage(
              `✓ All 3 high-value entries reviewed. Would you like to review the full summary or process the remaining 15 lower-value entries?`,
              [
                { label: 'Process remaining entries', value: 'process-all-remaining' },
                { label: 'Show me the full summary', value: 'review-all' },
              ]
            );
          }, 1000);
        }
      }, 800);
    }
  };

  const handleReject = () => {
    setShowApprovalModal(false);
    const isLowConfidenceReview = lowConfidenceReviewCount > 0;
    const hasMoreLowConfidence = lowConfidenceReviewCount < 2;
    const hasMoreHighValue = reviewedCount < 3;
    
    addUserMessage('Rejected - needs more investigation');
    setTimeout(() => {
      addAIMessage(
        'Entry flagged for investigation. I\'ll exclude this from the batch posting and notify the department head for clarification.',
        isLowConfidenceReview
          ? (hasMoreLowConfidence ? [{ label: 'Review next low-confidence entry', value: 'next-low-confidence' }] : undefined)
          : (hasMoreHighValue ? [{ label: 'Review next entry', value: 'next-entry' }] : undefined)
      );
      
      // Auto-advance if no more entries to review
      if (isLowConfidenceReview && !hasMoreLowConfidence) {
        setTimeout(() => {
          addAIMessage(
            '✓ All 18 accrual entries processed with your approvals. Total accrued expenses: €248,300.',
            [
              { label: 'Export to SAP ERP', value: 'export-erp' },
              { label: 'Email summary to team', value: 'email-team' },
            ]
          );
        }, 1000);
      } else if (!isLowConfidenceReview && !hasMoreHighValue) {
        setTimeout(() => {
          addAIMessage(
            `✓ All 3 high-value entries reviewed. Would you like to review the full summary or process the remaining 15 lower-value entries?`,
            [
              { label: 'Process remaining entries', value: 'process-all-remaining' },
              { label: 'Show me the full summary', value: 'review-all' },
            ]
          );
        }, 1000);
      }
    }, 800);
  };

  const handleButtonClick = (value: string, label: string) => {
    addUserMessage(label);

    setTimeout(() => {
      if (value === 'show-drafts') {
        addAIMessage(
          "Here are the top 3 high-value accrual entries I've identified:",
          undefined,
          {
            type: 'accrual-list',
            accruals: [
              { 
                dept: 'Logistics Q1', 
                amount: '€45,000', 
                basis: 'GPS delivery logs vs. No Invoice',
                severity: 'HIGH',
                confidence: '98%'
              },
              { 
                dept: 'Marketing - Digital Campaign', 
                amount: '€23,500', 
                basis: 'Agency PO opened, work 80% complete',
                severity: 'MEDIUM',
                confidence: '95%'
              },
              { 
                dept: 'IT Infrastructure', 
                amount: '€67,200', 
                basis: 'SaaS licenses active, no Feb invoice',
                severity: 'HIGH',
                confidence: '99%'
              }
            ]
          }
        );
        setTimeout(() => {
          addAIMessage(
            'These represent the highest-value and highest-confidence entries. Would you like to review and approve each one individually?',
            [
              { label: 'Yes, review each entry', value: 'review-individually' },
              { label: 'Show calculation details first', value: 'show-logistics-calc' },
            ]
          );
        }, 1000);
      } else if (value === 'view-logic') {
        addAIMessage(
          "Here's my analysis methodology:",
          undefined,
          {
            type: 'logic-explanation',
            steps: [
              '1. Scanned all 120 open POs in ERP system',
              '2. Cross-referenced with delivery confirmations and project milestones',
              '3. Identified POs with confirmed delivery/progress but no matching invoices',
              '4. Calculated accrual amounts based on PO value and completion percentage',
              '5. Flagged high-value items (>€20k) for your priority review',
              '6. Auto-drafted journal entries with supporting documentation'
            ]
          }
        );
        setTimeout(() => {
          addAIMessage(
            'This analysis runs automatically every day. You maintain final approval on all entries.',
            [
              { label: 'Show me the entries', value: 'show-drafts' },
            ]
          );
        }, 1000);
      } else if (value === 'review-individually' || value === 'next-entry') {
        // Show approval request for the next high-value entry based on reviewedCount
        setTimeout(() => {
          if (reviewedCount < 3) {
            const entryToReview = highValueEntries[reviewedCount];
            setReviewedCount(prev => prev + 1); // Increment review counter
            handleApprovalRequest(entryToReview);
          } else {
            // All 3 high-value entries have been reviewed, move to next phase
            addAIMessage(
              `✓ All 3 high-value entries reviewed. Total approved: €${approvedCount > 0 ? '135,700' : '0'}. Would you like to review the full summary or process the remaining 15 lower-value entries?`,
              [
                { label: 'Process remaining entries', value: 'process-all-remaining' },
                { label: 'Show me the full summary', value: 'review-all' },
              ]
            );
          }
        }, 500);
      } else if (value === 'show-logistics-calc') {
        addAIMessage(
          "Here's the detailed calculation for Logistics Q1 accrual:",
          undefined,
          {
            type: 'detailed-calc',
            accrual: 'Logistics Q1',
            amount: '€45,000',
            details: {
              po_number: 'PO-2026-04521',
              po_date: '2026-01-15',
              po_amount: '€45,000',
              supplier: 'TransEurope Logistics',
              evidence: [
                'GPS delivery logs show 2,400 pallets delivered (Feb 18-28)',
                'Warehouse receipt confirmations: 100% received',
                'No invoice received as of Mar 1',
                'Standard payment terms: Net 30'
              ],
              calculation: 'Full PO amount (€45,000) × 100% delivery = €45,000 accrual'
            }
          }
        );
        setTimeout(() => {
          addAIMessage(
            'Supporting documents are attached. Would you like to review and approve this entry?',
            [
              { label: 'Review and approve this entry', value: 'review-individually' },
            ]
          );
        }, 1000);
      } else if (value === 'process-remaining') {
        addAIMessage(
          `✓ Processing remaining ${3 - approvedCount} high-value entries with your standard approval settings.`,
        );
        setTimeout(() => {
          addAIMessage(
            'All high-value entries processed. Total approved: €135,700. Would you like to review the full summary or process the remaining 15 lower-value entries?',
            [
              { label: 'Process remaining entries', value: 'process-all-remaining' },
              { label: 'Show me the full summary', value: 'review-all' },
            ]
          );
        }, 1500);
      } else if (value === 'process-all-remaining') {
        // Show single consolidated summary for remaining 15 lower-value entries
        addAIMessage(
          '✓ Processing remaining 15 lower-value entries. Here\'s the complete summary:',
          undefined,
          {
            type: 'lower-value-summary',
            entries: [
              { dept: 'Warehouse Utilities', amount: '€2,100', supplier: 'EnergyPlus', confidence: '92%', status: 'Auto-approved' },
              { dept: 'Facilities Maintenance', amount: '€5,100', supplier: 'BuildCare Services', confidence: '97%', status: 'Auto-approved' },
              { dept: 'Shipping - Last Mile', amount: '€8,400', supplier: 'FastTrack Couriers', confidence: '98%', status: 'Auto-approved' },
              { dept: 'Print Marketing Materials', amount: '€6,300', supplier: 'Graphix Pro', confidence: '95%', status: 'Auto-approved' },
              { dept: 'Office Equipment Lease', amount: '€1,800', supplier: 'OfficeMax Rentals', confidence: '99%', status: 'Auto-approved' },
              { dept: 'Network Infrastructure', amount: '€7,600', supplier: 'NetSecure Systems', confidence: '93%', status: 'Auto-approved' },
              { dept: 'Quality Assurance Testing', amount: '€9,200', supplier: 'QA Solutions Ltd', confidence: '91%', status: 'Auto-approved' },
              { dept: 'Packaging Materials', amount: '€12,300', supplier: 'PackPro Industries', confidence: '97%', status: 'Auto-approved' },
              { dept: 'Market Research', amount: '€8,900', supplier: 'Insights Analytics', confidence: '94%', status: 'Auto-approved' },
              { dept: 'Customer Service Software', amount: '€5,400', supplier: 'HelpDesk Cloud', confidence: '96%', status: 'Auto-approved' },
              { dept: 'Freight Forwarding', amount: '€14,100', supplier: 'GlobalShip Logistics', confidence: '98%', status: 'Auto-approved' },
              { dept: 'Product Photography', amount: '€3,700', supplier: 'Studio Capture', confidence: '92%', status: 'Auto-approved' },
              { dept: 'Social Media Management', amount: '€7,100', supplier: 'SocialBoost Agency', confidence: '95%', status: 'Auto-approved' },
              { dept: 'Legal Consulting', amount: '€4,500', supplier: 'Norton Legal Partners', confidence: '71%', status: 'NEEDS REVIEW' },
              { dept: 'HR Training Services', amount: '€3,200', supplier: 'SkillBridge Academy', confidence: '68%', status: 'NEEDS REVIEW' },
            ],
            total: '€99,600',
            autoApproved: 13,
            needsReview: 2
          }
        );
        
        setTimeout(() => {
          addAIMessage(
            '⚠️ 2 entries flagged for review - AI confidence below 85% threshold. These require your approval before posting.',
            [
              { label: 'Review low-confidence entries', value: 'review-low-confidence' },
            ]
          );
        }, 1500);
      } else if (value === 'review-low-confidence' || value === 'next-low-confidence') {
        // Show approval request for low-confidence entries
        setTimeout(() => {
          if (lowConfidenceReviewCount < 2) {
            const entryToReview = lowConfidenceEntries[lowConfidenceReviewCount];
            setLowConfidenceReviewCount(prev => prev + 1);
            handleApprovalRequest(entryToReview);
          } else {
            // All low-confidence entries reviewed
            addAIMessage(
              ' All 18 accrual entries processed with your approvals. Total accrued expenses: €248,300.',
              [
                { label: 'Export to SAP ERP', value: 'export-erp' },
                { label: 'Email summary to team', value: 'email-team' },
              ]
            );
          }
        }, 500);
      } else if (value === 'review-all') {
        addAIMessage(
          "Here's a summary of all 18 accrual entries:",
          undefined,
          {
            type: 'full-summary',
            totalAmount: '€248,300',
            categories: [
              { category: 'Logistics & Transportation', count: 5, amount: '€89,400' },
              { category: 'Marketing & Advertising', count: 4, amount: '€56,700' },
              { category: 'IT & Software', count: 3, amount: '€71,200' },
              { category: 'Professional Services', count: 4, amount: '€23,800' },
              { category: 'Facilities & Utilities', count: 2, amount: '€7,200' }
            ]
          }
        );
        setTimeout(() => {
          addAIMessage(
            'All entries ready for your final approval. Export to ERP when ready.',
            [
              { label: 'Export to ERP', value: 'export-erp' },
            ]
          );
        }, 1000);
      } else if (value === 'export-erp' || value === 'email-team') {
        if (value === 'export-erp') {
          addAIMessage('✓ All approved accrual entries exported to ERP system. Journal entries queued for your final posting approval in the ERP workflow.');
        } else {
          addAIMessage('✓ Month-end accrual summary emailed to finance team. Includes detailed breakdown, supporting documentation, and approval workflow link.');
        }
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
            <h2 className="text-lg font-bold text-gray-900 flex-1 text-center">AI-Powered Accrual Detection</h2>
            <div className="w-20" /> {/* Spacer for alignment */}
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded mb-2">
            <h3 className="font-semibold text-green-900 text-xs mb-1">The New Reality:</h3>
            <ul className="text-[10px] text-green-800 space-y-0.5 list-disc list-inside">
              <li>AI Agent scans all 120 POs and 15 projects automatically (completed in 2 minutes)</li>
              <li><strong>You review, modify, and approve each entry</strong> - AI provides analysis, you make final decisions</li>
              <li>Evidence gathering and calculation logic is fully automated</li>
            </ul>
          </div>

          {/* AI Approval Thresholds */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded">
            <h3 className="font-semibold text-blue-900 text-xs mb-1">⚙️ Your AI Approval Settings:</h3>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-white rounded p-1.5 border border-blue-200">
                <div className="text-blue-600 font-semibold">High-Value Threshold</div>
                <div className="text-blue-900 font-bold">€20,000+</div>
                <div className="text-blue-700">Always requires your review</div>
              </div>
              <div className="bg-white rounded p-1.5 border border-blue-200">
                <div className="text-blue-600 font-semibold">AI Confidence Threshold</div>
                <div className="text-blue-900 font-bold">85%+</div>
                <div className="text-blue-700">Auto-approve if below €20k</div>
              </div>
            </div>
            <p className="text-[9px] text-blue-700 mt-1">
              💡 Entries below 85% confidence always flagged for your review, regardless of amount
            </p>
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
                  <h3 className="text-white text-base font-bold">Accrual Sentinel Agent</h3>
                  <div className="flex items-center gap-2 text-red-100 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Active • Daily Monitoring</span>
                  </div>
                </div>
                <div className="text-right text-white text-xs">
                  <p className="font-semibold">Month-End Scan: Complete</p>
                  <p className="text-red-100">120 POs Analyzed • {approvedCount}/3 Approved</p>
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
                            {message.data.type === 'accrual-list' ? (
                              // Accrual List Display
                              <div>
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                                  <DollarSign className="w-5 h-5 text-green-600" />
                                  <h4 className="font-semibold text-gray-900 text-sm">High-Value Accrual Entries</h4>
                                </div>
                                <div className="space-y-3">
                                  {message.data.accruals.map((accrual: any, idx: number) => (
                                    <div key={idx} className="bg-gray-50 rounded p-3 border border-gray-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-gray-900 text-sm">{accrual.dept}</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                                          accrual.severity === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                        }`}>{accrual.severity}</span>
                                      </div>
                                      <div className="text-xl font-bold text-green-700 mb-2">{accrual.amount}</div>
                                      <div className="text-xs text-gray-700 mb-2">{accrual.basis}</div>
                                      <div className="text-xs text-gray-500">
                                        AI Confidence: <strong className="text-green-700">{accrual.confidence}</strong>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : message.data.type === 'logic-explanation' ? (
                              // Logic Explanation
                              <div>
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                                  <FileText className="w-5 h-5 text-blue-600" />
                                  <h4 className="font-semibold text-gray-900 text-sm">Analysis Methodology</h4>
                                </div>
                                <div className="space-y-2">
                                  {message.data.steps.map((step: string, idx: number) => (
                                    <div key={idx} className="flex gap-2 text-xs text-gray-700">
                                      <span className="text-green-600 font-bold">✓</span>
                                      <span>{step}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : message.data.type === 'detailed-calc' ? (
                              // Detailed Calculation
                              <div>
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                                  <DollarSign className="w-5 h-5 text-green-600" />
                                  <h4 className="font-semibold text-gray-900 text-sm">{message.data.accrual} - Detailed Analysis</h4>
                                </div>
                                <div className="bg-green-50 rounded p-3 mb-3">
                                  <p className="text-2xl font-bold text-green-700 mb-1">{message.data.amount}</p>
                                  <p className="text-xs text-gray-600">AI Recommended Accrual Amount</p>
                                </div>
                                <div className="space-y-2 text-xs mb-3">
                                  <div className="flex gap-2">
                                    <span className="text-gray-600 font-semibold min-w-[80px]">PO Number:</span>
                                    <span className="text-gray-900">{message.data.details.po_number}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <span className="text-gray-600 font-semibold min-w-[80px]">PO Date:</span>
                                    <span className="text-gray-900">{message.data.details.po_date}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <span className="text-gray-600 font-semibold min-w-[80px]">Supplier:</span>
                                    <span className="text-gray-900">{message.data.details.supplier}</span>
                                  </div>
                                </div>
                                <div className="bg-gray-50 rounded p-3 mb-3">
                                  <h5 className="font-semibold text-gray-900 text-xs mb-2">Evidence:</h5>
                                  <ul className="space-y-1">
                                    {message.data.details.evidence.map((item: string, idx: number) => (
                                      <li key={idx} className="text-xs text-gray-700 flex gap-2">
                                        <span className="text-green-600">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="bg-blue-50 rounded p-3">
                                  <h5 className="font-semibold text-blue-900 text-xs mb-1">Calculation:</h5>
                                  <p className="text-xs text-blue-800">{message.data.details.calculation}</p>
                                </div>
                              </div>
                            ) : message.data.type === 'full-summary' ? (
                              // Full Summary
                              <div>
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                                  <DollarSign className="w-5 h-5 text-green-600" />
                                  <h4 className="font-semibold text-gray-900 text-sm">All Accrual Entries (18 Total)</h4>
                                </div>
                                <div className="bg-green-50 rounded p-3 mb-3">
                                  <p className="text-xs text-green-700 mb-1">Total Unbilled Work</p>
                                  <p className="text-3xl font-bold text-green-800">{message.data.totalAmount}</p>
                                </div>
                                <div className="space-y-2">
                                  {message.data.categories.map((cat: any, idx: number) => (
                                    <div key={idx} className="bg-gray-50 rounded p-3 border border-gray-200">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-gray-900 text-xs">{cat.category}</span>
                                        <span className="text-xs text-gray-600">{cat.count} entries</span>
                                      </div>
                                      <div className="text-lg font-bold text-green-700">{cat.amount}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : message.data.type === 'lower-value-summary' ? (
                              // Lower-Value Summary
                              <div>
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                                  <DollarSign className="w-5 h-5 text-green-600" />
                                  <h4 className="font-semibold text-gray-900 text-sm">Lower-Value Accrual Entries (15 Total)</h4>
                                </div>
                                <div className="bg-green-50 rounded p-3 mb-3">
                                  <p className="text-xs text-green-700 mb-1">Total Unbilled Work</p>
                                  <p className="text-3xl font-bold text-green-800">{message.data.total}</p>
                                </div>
                                <div className="space-y-2">
                                  {message.data.entries.map((entry: any, idx: number) => (
                                    <div key={idx} className="bg-gray-50 rounded p-3 border border-gray-200">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-gray-900 text-xs">{entry.dept}</span>
                                        <span className="text-xs text-gray-600">{entry.amount}</span>
                                      </div>
                                      <div className="text-sm font-bold text-gray-900">{entry.supplier}</div>
                                      <div className="text-xs text-gray-500">
                                        AI Confidence: <strong className="text-green-700">{entry.confidence}</strong>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Status: <strong className="text-green-700">{entry.status}</strong>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-3">
                                  <p className="text-sm text-gray-500">Auto-approved entries: {message.data.autoApproved}</p>
                                  <p className="text-sm text-gray-500">Entries needing review: {message.data.needsReview}</p>
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

        {/* Approval Modal - HITL Gate */}
        <AnimatePresence>
          {showApprovalModal && currentApproval && (
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
                className="bg-white rounded-xl p-6 max-w-3xl w-full shadow-2xl border-4 border-[#E41E2B]"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-gray-200">
                  <div className="w-12 h-12 bg-[#E41E2B] rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">Review & Approve Accrual Entry</h3>
                    <p className="text-sm text-gray-600">You have full control to modify or reject</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">AI Confidence</span>
                    <p className={`text-lg font-bold ${
                      parseInt(currentApproval.confidence) >= 85 ? 'text-green-600' : 'text-orange-600'
                    }`}>{currentApproval.confidence}</p>
                    {parseInt(currentApproval.confidence) < 85 && (
                      <span className="text-xs text-orange-600 font-semibold">Below 85% threshold</span>
                    )}
                  </div>
                </div>

                {/* Low Confidence Warning */}
                {currentApproval.reason && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-3 mb-4 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <h4 className="font-semibold text-orange-900 text-sm">⚠️ Flagged for Review</h4>
                    </div>
                    <p className="text-xs text-orange-800">{currentApproval.reason}</p>
                  </div>
                )}
                
                {/* Journal Entry Preview */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border-2 border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900 text-sm">Proposed Journal Entry</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div>
                      <span className="text-gray-600">Department:</span>
                      <p className="font-semibold text-gray-900">{currentApproval.department}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">PO Number:</span>
                      <p className="font-semibold text-gray-900 font-mono">{currentApproval.poNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Supplier:</span>
                      <p className="font-semibold text-gray-900">{currentApproval.supplier}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Evidence:</span>
                      <p className="font-semibold text-gray-900">{currentApproval.evidence}</p>
                    </div>
                  </div>

                  <table className="w-full text-xs border-2 border-gray-300 mb-3">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Account</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Debit</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Credit</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      <tr className="border-t border-gray-300">
                        <td className="py-2 px-3 text-gray-900">{currentApproval.debitAccount}</td>
                        <td className="py-2 px-3 text-right font-mono text-gray-900">
                          {editingJE ? (
                            <input
                              type="text"
                              value={editedAmount}
                              onChange={(e) => setEditedAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                              className="w-full px-2 py-1 border-2 border-blue-500 rounded text-right bg-blue-50"
                              autoFocus
                            />
                          ) : (
                            currentApproval.amount
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-gray-900">-</td>
                      </tr>
                      <tr className="border-t border-gray-300">
                        <td className="py-2 px-3 text-gray-900">{currentApproval.creditAccount}</td>
                        <td className="py-2 px-3 text-right font-mono text-gray-900">-</td>
                        <td className="py-2 px-3 text-right font-mono text-gray-900">
                          {editingJE ? `€${editedAmount}` : currentApproval.amount}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {!editingJE && (
                    <button
                      onClick={() => setEditingJE(true)}
                      className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Modify accrual amount
                    </button>
                  )}
                </div>

                {/* User Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Add Note (Optional):
                  </label>
                  <textarea
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="Add any comments or adjustments to document your decision..."
                    className="w-full h-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleReject}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 border-2 border-gray-400"
                  >
                    <X className="w-4 h-4" />
                    Reject - Needs Investigation
                  </button>
                  
                  {editingJE || userNote ? (
                    <button
                      onClick={() => handleApprove(true)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Approve with Modifications
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(false)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Approve as Recommended
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-500 text-center mt-3">
                  💡 This is your checkpoint - AI provides the analysis, you make the final call
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                <h3 className="text-2xl font-bold mb-4">🤝 AI + Human Partnership</h3>
                <p className="text-lg mb-6 leading-relaxed">
                  The AI handles <strong>data mining and calculations</strong>. You provide the 
                  <strong> professional judgment, modifications, and final approval</strong>. 
                  You're in control—the AI just does the tedious work.
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
                    <p className="text-sm text-gray-600">Same Task, You're in Control</p>
                  </div>
                </div>

                {/* Main Description */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">What's Different:</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You're still the Finance Manager with <strong className="text-green-600">full control and final approval</strong>. 
                    The Accrual Sentinel does the tedious scanning and drafting, but 
                    <strong className="text-green-600"> you review, modify, and approve each entry</strong>.
                  </p>
                </div>

                {/* What the AI Does */}
                <div className="bg-green-50 rounded-lg p-4 mb-6 border-2 border-green-200">
                  <h4 className="text-lg font-bold text-green-900 mb-3">AI Does the Tedious Work:</h4>
                  <div className="space-y-2 text-sm text-green-800">
                    <p>✓ Scans all 120 POs and 15 projects daily</p>
                    <p>✓ Identifies unbilled work with supporting evidence</p>
                    <p>✓ Drafts journal entries with calculations</p>
                  </div>
                </div>

                {/* Your Role */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
                  <h4 className="text-base font-bold text-blue-900 mb-2">You Maintain Control:</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>✓ <strong>Review</strong> each high-value entry individually</p>
                    <p>✓ <strong>Modify</strong> accrual amounts based on your judgment</p>
                    <p>✓ <strong>Add notes</strong> to document your decisions</p>
                    <p>✓ <strong>Reject</strong> entries that need investigation</p>
                    <p>✓ <strong>Approve</strong> only when you're confident</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowWelcomePopup(false)}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors w-full shadow-lg"
                >
                  Got It — Let's Review Entries →
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}