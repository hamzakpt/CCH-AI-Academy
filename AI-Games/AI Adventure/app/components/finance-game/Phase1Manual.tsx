import { useState } from 'react';
import { Mail, Clock, AlertCircle, Check, X, Calculator, Inbox, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Phase1ManualProps {
  onComplete: () => void;
  onBack?: () => void;
}

type EmailResponse = {
  from: string;
  department: string;
  subject: string;
  body: string;
  poNumber?: string;
  poAmount?: string;
  percentComplete?: string;
  supplier?: string;
};

type AccrualEntry = {
  id: number;
  department: string;
  poNumber: string;
  supplier: string;
  poAmount: number;
  percentComplete: number;
  accrualAmount: number;
  completed: boolean;
};

const emailResponses: EmailResponse[] = [
  {
    from: 'Sarah Chen (Marketing)',
    department: 'Marketing',
    subject: 'Re: Month-End Accrual Request - Unbilled Work',
    body: 'Hi Finance Team,\n\nThanks for the reminder! We have one major PO still open:\n\n• PO Number: PO-2026-04892\n• Supplier: CreativeEdge Digital Agency\n• PO Amount: €23,500\n• Work is about 80% complete (final assets pending)\n\nLet me know if you need anything else!\n\nSarah',
    poNumber: 'PO-2026-04892',
    poAmount: '€23,500',
    percentComplete: '80%',
    supplier: 'CreativeEdge Digital Agency'
  },
  {
    from: 'Mike Rodriguez (Logistics)',
    department: 'Logistics',
    subject: 'Re: Unbilled POs for February Close',
    body: 'Hey,\n\nWe received shipment from TransEurope last week but no invoice yet:\n\nPO-2026-04521\nTransEurope Logistics\nTotal: €45,000\n100% delivered (GPS logs confirm 2,400 pallets received Feb 18-28)\n\nPayment terms are Net 30, so invoice should arrive next week.\n\nMike',
    poNumber: 'PO-2026-04521',
    poAmount: '€45,000',
    percentComplete: '100%',
    supplier: 'TransEurope Logistics'
  },
  {
    from: 'Priya Patel (IT)',
    department: 'IT',
    subject: 'Re: Open POs for Month-End',
    body: 'Hi team,\n\nOur SaaS licenses are active but we haven\'t received the February invoice:\n\n- PO: PO-2026-04156\n- Vendor: CloudTech Solutions\n- Amount: €67,200 (annual license, prorated monthly)\n- Status: All systems active, services rendered 100%\n\nThis happens every month - they bill 45 days in arrears.\n\nPriya',
    poNumber: 'PO-2026-04156',
    poAmount: '€67,200',
    percentComplete: '100%',
    supplier: 'CloudTech Solutions'
  }
];

export function Phase1Manual({ onComplete, onBack }: Phase1ManualProps) {
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState<'inbox' | 'excel'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailResponse | null>(null);
  const [readEmails, setReadEmails] = useState<Set<string>>(new Set());
  const [accrualEntries, setAccrualEntries] = useState<AccrualEntry[]>([
    { id: 1, department: '', poNumber: '', supplier: '', poAmount: 0, percentComplete: 0, accrualAmount: 0, completed: false },
    { id: 2, department: '', poNumber: '', supplier: '', poAmount: 0, percentComplete: 0, accrualAmount: 0, completed: false },
    { id: 3, department: '', poNumber: '', supplier: '', poAmount: 0, percentComplete: 0, accrualAmount: 0, completed: false },
  ]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [emailsSent] = useState(40);

  const handleEmailClick = (email: EmailResponse) => {
    setSelectedEmail(email);
    setReadEmails(prev => new Set([...prev, email.from]));
    
    // Simulate time spent reading email
    setTimeout(() => {
      setTimeSpent(prev => prev + 0.5);
    }, 1000);
  };

  const handleStartExcelEntry = () => {
    setCurrentStep('excel');
    setSelectedEmail(null);
  };

  const handleCellUpdate = (id: number, field: keyof AccrualEntry, value: any) => {
    setAccrualEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        const updated = { ...entry, [field]: value };
        
        // Auto-calculate accrual amount when we have both values
        if (field === 'poAmount' || field === 'percentComplete') {
          if (updated.poAmount && updated.percentComplete) {
            updated.accrualAmount = Math.round((updated.poAmount * updated.percentComplete / 100) * 100) / 100;
          }
        }
        
        // Check if row is complete
        if (updated.department && updated.poNumber && updated.supplier && updated.poAmount > 0 && updated.percentComplete > 0) {
          updated.completed = true;
          setTimeSpent(prev => prev + 2); // Each entry takes time
        }
        
        return updated;
      }
      return entry;
    }));
  };

  const handleAutoFillFromEmail = (email: EmailResponse, entryId: number) => {
    setAccrualEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        const poAmount = parseFloat(email.poAmount?.replace(/[€,]/g, '') || '0');
        const percentComplete = parseFloat(email.percentComplete?.replace('%', '') || '0');
        const accrualAmount = Math.round((poAmount * percentComplete / 100) * 100) / 100;
        
        return {
          ...entry,
          department: email.department,
          poNumber: email.poNumber || '',
          supplier: email.supplier || '',
          poAmount,
          percentComplete,
          accrualAmount,
          completed: true
        };
      }
      return entry;
    }));
    
    setTimeSpent(prev => prev + 3);
  };

  const completedEntries = accrualEntries.filter(e => e.completed).length;
  const canSubmit = completedEntries >= 3;

  const handleSubmit = () => {
    setShowCompletionPopup(true);
    setTimeout(() => {
      onComplete();
    }, 4000);
  };

  return (
    <div className="h-full overflow-hidden p-3">
      <div className="max-w-[1600px] mx-auto h-full flex flex-col">
        {/* Back Button */}
        {onBack && (
          <div className="flex justify-start mb-2">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
        )}
        {/* Header Stats */}
        <div className="mb-2 flex-shrink-0">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-3 shadow-lg">
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-red-100 text-[10px] mb-1">Department Progress</p>
                <p className="text-white font-bold text-sm">{completedEntries} of 20 Dept Heads</p>
              </div>
              <div className="text-center">
                <p className="text-red-100 text-[10px] mb-1">Estimated Time</p>
                <p className="text-white font-bold text-sm">24+ Hours (Manual)</p>
              </div>
              <div className="text-center">
                <p className="text-red-100 text-[10px] mb-1">Email Effort</p>
                <p className="text-white font-bold text-sm">{emailsSent}+ Emails</p>
              </div>
              <div className="text-center">
                <p className="text-red-100 text-[10px] mb-1">Status</p>
                <p className="text-white font-bold text-sm">REACTIVE</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-3 flex-shrink-0">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-700 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 text-xs mb-1">Instructions:</h3>
                <p className="text-yellow-800 text-[10px] leading-relaxed">
                  {currentStep === 'inbox' 
                    ? 'Read email responses from department heads. Copy details into Excel for accrual calculations.'
                    : 'Manually enter PO details from emails into the accrual worksheet. Calculate accrual amounts (PO Amount × % Complete).'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-3 flex-shrink-0">
          <button
            onClick={() => setCurrentStep('inbox')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              currentStep === 'inbox' 
                ? 'bg-[#E41E2B] text-white' 
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Inbox ({readEmails.size}/3 read)
          </button>
          <button
            onClick={() => setCurrentStep('excel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              currentStep === 'excel' 
                ? 'bg-green-700 text-white' 
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Accrual Worksheet ({completedEntries}/3 completed)
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden mb-3">
          {currentStep === 'inbox' ? (
            // Email Inbox View
            <div className="grid grid-cols-3 gap-3 h-full">
              {/* Email List */}
              <div className="col-span-1 bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2">
                  <h3 className="text-white font-bold text-sm">Email Responses</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {emailResponses.map((email, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEmailClick(email)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        selectedEmail?.from === email.from
                          ? 'border-[#E41E2B] bg-red-50'
                          : readEmails.has(email.from)
                          ? 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          : 'border-blue-300 bg-blue-50 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <Mail className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          readEmails.has(email.from) ? 'text-gray-400' : 'text-blue-600'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${
                            readEmails.has(email.from) ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {email.from}
                          </p>
                          <p className="text-[10px] text-gray-600 truncate">{email.subject}</p>
                        </div>
                      </div>
                      {!readEmails.has(email.from) && (
                        <div className="text-[9px] text-blue-700 font-semibold">NEW</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Detail */}
              <div className="col-span-2 bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2">
                  <h3 className="text-white font-bold text-sm">Email Content</h3>
                </div>
                {selectedEmail ? (
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-4 pb-4 border-b-2 border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-1">{selectedEmail.subject}</h4>
                      <p className="text-xs text-gray-600 mb-2">From: {selectedEmail.from}</p>
                    </div>
                    <div className="mb-6">
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                        {selectedEmail.body}
                      </pre>
                    </div>
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-900 text-sm mb-3">Next Step:</h5>
                      <p className="text-xs text-blue-800 mb-3">
                        Copy the PO details from this email into your Excel accrual worksheet
                      </p>
                      <button
                        onClick={handleStartExcelEntry}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
                      >
                        <Calculator className="w-3 h-3" />
                        Open Accrual Worksheet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Select an email to read</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Excel Worksheet View
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden flex flex-col h-full">
              <div className="bg-gradient-to-r from-green-700 to-green-800 px-4 py-2">
                <h3 className="text-white font-bold text-sm">Month-End Accrual Worksheet (Excel)</h3>
              </div>
              
              {/* Helper: Quick Fill Buttons */}
              <div className="bg-blue-50 border-b-2 border-blue-200 p-3">
                <p className="text-xs text-blue-900 font-semibold mb-2">Quick Fill from Emails:</p>
                <div className="flex gap-2">
                  {emailResponses.map((email, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const emptyEntry = accrualEntries.find(e => !e.completed);
                        if (emptyEntry) handleAutoFillFromEmail(email, emptyEntry.id);
                      }}
                      disabled={!accrualEntries.some(e => !e.completed)}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 py-1.5 rounded text-[10px] font-semibold transition-colors"
                    >
                      Fill {email.department}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-blue-700 mt-2">
                  ⚠️ In reality, you'd manually type each value from the email - this is the tedious part!
                </p>
              </div>

              <div className="flex-1 overflow-auto p-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-700 text-white">
                      <th className="border-2 border-green-800 p-2 text-[10px] font-bold text-left w-[100px]">Department</th>
                      <th className="border-2 border-green-800 p-2 text-[10px] font-bold text-left w-[120px]">PO Number</th>
                      <th className="border-2 border-green-800 p-2 text-[10px] font-bold text-left w-[200px]">Supplier</th>
                      <th className="border-2 border-green-800 p-2 text-[10px] font-bold text-right w-[100px]">PO Amount (€)</th>
                      <th className="border-2 border-green-800 p-2 text-[10px] font-bold text-right w-[100px]">% Complete</th>
                      <th className="border-2 border-green-800 p-2 text-[10px] font-bold text-right w-[120px]">Accrual Amount (€)</th>
                      <th className="border-2 border-green-800 p-2 text-[10px] font-bold text-center w-[60px]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accrualEntries.map((entry) => (
                      <tr key={entry.id} className={entry.completed ? 'bg-green-50' : 'bg-white'}>
                        <td className="border-2 border-gray-300 p-1">
                          <input
                            type="text"
                            value={entry.department}
                            onChange={(e) => handleCellUpdate(entry.id, 'department', e.target.value)}
                            className="w-full px-2 py-1 text-[10px] border border-gray-300 rounded"
                            placeholder="e.g., Marketing"
                          />
                        </td>
                        <td className="border-2 border-gray-300 p-1">
                          <input
                            type="text"
                            value={entry.poNumber}
                            onChange={(e) => handleCellUpdate(entry.id, 'poNumber', e.target.value)}
                            className="w-full px-2 py-1 text-[10px] border border-gray-300 rounded font-mono"
                            placeholder="PO-2026-####"
                          />
                        </td>
                        <td className="border-2 border-gray-300 p-1">
                          <input
                            type="text"
                            value={entry.supplier}
                            onChange={(e) => handleCellUpdate(entry.id, 'supplier', e.target.value)}
                            className="w-full px-2 py-1 text-[10px] border border-gray-300 rounded"
                            placeholder="Supplier name"
                          />
                        </td>
                        <td className="border-2 border-gray-300 p-1">
                          <input
                            type="number"
                            value={entry.poAmount || ''}
                            onChange={(e) => handleCellUpdate(entry.id, 'poAmount', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-[10px] border border-gray-300 rounded text-right font-mono"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="border-2 border-gray-300 p-1">
                          <input
                            type="number"
                            value={entry.percentComplete || ''}
                            onChange={(e) => handleCellUpdate(entry.id, 'percentComplete', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-[10px] border border-gray-300 rounded text-right font-mono"
                            placeholder="0"
                            min="0"
                            max="100"
                          />
                        </td>
                        <td className="border-2 border-gray-300 p-1">
                          <div className="px-2 py-1 text-[10px] text-right font-mono font-bold text-green-700">
                            {entry.accrualAmount > 0 ? entry.accrualAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                          </div>
                        </td>
                        <td className="border-2 border-gray-300 p-1 text-center">
                          {entry.completed ? (
                            <Check className="w-4 h-4 text-green-600 mx-auto" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-gray-300 rounded mx-auto"></div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-bold">
                      <td colSpan={5} className="border-2 border-gray-400 p-2 text-xs text-right">TOTAL:</td>
                      <td className="border-2 border-gray-400 p-2 text-xs text-right font-mono text-green-800">
                        €{accrualEntries.reduce((sum, e) => sum + e.accrualAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border-2 border-gray-400"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="bg-gray-100 border-t-2 border-gray-300 p-3">
                <p className="text-[10px] text-gray-600 mb-2">
                  <strong>Formula:</strong> Accrual Amount = PO Amount × (% Complete / 100)
                </p>
                <p className="text-[10px] text-gray-500">
                  ...and you still have 17 more departments to chase (15 more emails remaining)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Stats */}
        <div className="flex-shrink-0 grid grid-cols-3 gap-2 mb-2">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-2 text-center">
            <p className="text-red-600 text-[10px] mb-1">Time Spent</p>
            <p className="text-red-800 font-bold text-lg">{timeSpent.toFixed(1)}h</p>
          </div>
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-2 text-center">
            <p className="text-orange-600 text-[10px] mb-1">Emails Read</p>
            <p className="text-orange-800 font-bold text-lg">{readEmails.size}</p>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-2 text-center">
            <p className="text-yellow-600 text-[10px] mb-1">Accruals Entered</p>
            <p className="text-yellow-800 font-bold text-lg">{completedEntries}</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-3 px-6 rounded-lg font-bold text-sm transition-all shadow-lg ${
              canSubmit
                ? 'bg-gradient-to-r from-[#E41E2B] to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canSubmit 
              ? 'Submit Accruals (You\'ve experienced enough tedium!)' 
              : `Complete ${3 - completedEntries} more entries to continue`}
          </button>
        </div>

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
                className="bg-white rounded-xl p-8 max-w-2xl shadow-2xl border-4 border-red-500"
              >
                <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-200">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Phase 1: The Manual Process</h3>
                    <p className="text-sm text-gray-600">Month-End Accrual Drafting</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Your Task:</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You're a Finance Manager at Coca-Cola Hellenic, and it's month-end close time. 
                    You need to <strong className="text-red-600">manually gather unbilled work data</strong> from department heads 
                    and enter it into Excel to calculate accrual journal entries.
                  </p>
                </div>

                <div className="bg-red-50 rounded-lg p-4 mb-6 border-2 border-red-200">
                  <h4 className="text-lg font-bold text-red-900 mb-3">The Reality:</h4>
                  <div className="space-y-2 text-sm text-red-800">
                    <p>1. <strong>Read email responses</strong> from department heads about their unbilled POs</p>
                    <p>2. <strong>Copy data into Excel</strong> - manually type PO numbers, amounts, and completion %</p>
                    <p>3. <strong>Calculate accrual amounts</strong> using formulas</p>
                    <p>4. <strong>Repeat for 20 departments</strong> - this simulation shows just 3</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
                  <h4 className="text-base font-bold text-blue-900 mb-2">For This Simulation:</h4>
                  <p className="text-sm text-blue-800">
                    Switch between the Inbox (read emails) and Accrual Worksheet (enter data manually). 
                    We've added "Quick Fill" buttons to save you time, but imagine typing every field by hand!
                  </p>
                </div>

                <button
                  onClick={() => setShowWelcomePopup(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors w-full shadow-lg"
                >
                  Start Manual Process →
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
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-12 max-w-lg shadow-2xl text-center border-4 border-red-400"
              >
                <h2 className="text-4xl font-bold text-white mb-6">That Was Exhausting.</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-red-100 text-sm mb-2">Total Time Spent</p>
                    <p className="text-white font-bold text-5xl">24 Hours</p>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-red-100 text-sm mb-2">Email Exchanges</p>
                    <p className="text-white font-bold text-5xl">40+ Emails</p>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-red-100 text-sm mb-2">Manual Data Entry</p>
                    <p className="text-white font-bold text-5xl">18 Entries</p>
                  </div>
                </div>

                <p className="text-white text-lg leading-relaxed">
                  And this happens <strong>every single month</strong>. 
                  Now let's see the AI-powered way...
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
