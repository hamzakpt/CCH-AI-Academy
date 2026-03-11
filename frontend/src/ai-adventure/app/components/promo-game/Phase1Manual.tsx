import { useState } from 'react';
import { FileSpreadsheet, AlertTriangle, Clock, Search, ArrowLeft } from 'lucide-react';
import { MetricsPanel } from './MetricsPanel';
import { motion, AnimatePresence } from 'motion/react';

interface Phase1ManualProps {
  onComplete: () => void;
  onBack?: () => void;
}

export function Phase1Manual({ onComplete, onBack }: Phase1ManualProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [enteredPrice, setEnteredPrice] = useState('');
  const [showError, setShowError] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showMindsetPopup, setShowMindsetPopup] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);

  const correctPrice = '1.75';
  const expectedPrice = '1.65';

  const handleSearch = () => {
    if (searchQuery.toLowerCase().includes('coca') || searchQuery.toLowerCase().includes('zero')) {
      setHasSearched(true);
    }
  };

  const handlePriceSubmit = () => {
    if (enteredPrice === correctPrice) {
      setShowError(false);
      setIsComplete(true);
      setTimeout(() => setShowMindsetPopup(true), 2000);
    } else {
      setShowError(true);
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 bg-gray-50 p-4 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-3">
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
              <div className="flex-1 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Manual Promo Compliance Auditing</h2>
                <p className="text-gray-600 text-sm">
                  Experience the tedious reality of manual compliance checking
                </p>
              </div>
              <div className="w-20" /> {/* Spacer for alignment */}
            </div>
            
            {/* Task Instructions */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-2">
              <h3 className="font-semibold text-blue-900 mb-1 text-sm">Your Task:</h3>
              <ol className="text-xs text-blue-800 space-y-0.5 list-decimal list-inside">
                <li>Search for "Coca-Cola Zero 1.5L" on the retailer website</li>
                <li>Compare the live price with the JBP agreed price</li>
                <li>Manually enter the discrepancy into the compliance tracker</li>
              </ol>
            </div>

            {/* Status Bar */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <div>
                    <p className="text-xs font-semibold text-yellow-900">
                      Checking 1 of 150 SKUs
                    </p>
                    <p className="text-[10px] text-yellow-700">
                      Estimated time remaining: <strong>4 hours 12 minutes</strong>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-yellow-600">Progress</p>
                  <div className="w-32 h-1.5 bg-yellow-200 rounded-full mt-1">
                    <div className="w-[0.67%] h-full bg-yellow-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Split Screen Layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* Left: JBP Document */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-800 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-semibold">Joint Business Plan - Q1 2026.pdf</span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50">
                <div className="bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-3 border-b-2 border-[#E41E2B] pb-2">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Joint Business Plan</h3>
                      <p className="text-xs text-gray-600">Coca-Cola Hellenic × Sklavenitis</p>
                    </div>
                    <div className="text-right text-[10px] text-gray-500">
                      <p>Period: Q1 2026</p>
                      <p>Status: Active</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-800 mb-2 text-xs">Trade Promotion Schedule - February 2026</h4>
                    
                    <table className="w-full text-[10px] border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 p-1 text-left">SKU Code</th>
                          <th className="border border-gray-300 p-1 text-left">Product</th>
                          <th className="border border-gray-300 p-1 text-left">Regular Price</th>
                          <th className="border border-gray-300 p-1 text-left">Promo Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-1">CC500ML-GR</td>
                          <td className="border border-gray-300 p-1">Coca-Cola Classic 500ml</td>
                          <td className="border border-gray-300 p-1">€1.20</td>
                          <td className="border border-gray-300 p-1">€0.99</td>
                        </tr>
                        <tr className="bg-yellow-50">
                          <td className="border border-gray-300 p-1 font-semibold">CCZ1.5L-GR</td>
                          <td className="border border-gray-300 p-1 font-semibold">Coca-Cola Zero Sugar 1.5L</td>
                          <td className="border border-gray-300 p-1 font-semibold">€1.85</td>
                          <td className="border border-gray-300 p-1 font-semibold text-[#E41E2B]">€1.65</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-1">FS500ML-GR</td>
                          <td className="border border-gray-300 p-1">Fanta Orange 500ml</td>
                          <td className="border border-gray-300 p-1">€1.15</td>
                          <td className="border border-gray-300 p-1">€0.95</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs">
                    <p className="font-semibold text-blue-900 mb-1">Promotion Terms:</p>
                    <ul className="space-y-1 text-blue-800">
                      <li>• Valid: February 10-28, 2026</li>
                      <li>• Minimum display: 2 gondola ends</li>
                      <li>• Expected weekly volume: 450 units</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Retailer Website */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-white border-b border-gray-200">
                <div className="bg-gray-100 px-2 py-2 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-600 flex items-center gap-2">
                    <span className="text-green-600">🔒</span>
                    <span>www.sklavenitis.gr/products</span>
                  </div>
                </div>
                
                <div className="p-4 bg-white border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='40'%3E%3Crect fill='%23003DA5' width='120' height='40'/%3E%3Ctext x='60' y='25' font-family='Arial' font-size='18' font-weight='bold' fill='white' text-anchor='middle'%3ESKLAVENITIS%3C/text%3E%3C/svg%3E" alt="Sklavenitis" className="h-8" />
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Search for products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={handleSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 h-[280px] overflow-y-auto">
                {!hasSearched ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Search className="w-16 h-16 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Enter search query above to begin...</p>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-sm text-gray-600 mb-4">Search results for "{searchQuery}"</p>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                      <div className="flex gap-4">
                        <div className="w-32 h-32 bg-[#E41E2B] rounded flex items-center justify-center flex-shrink-0">
                          <div className="text-white text-center">
                            <div className="font-bold text-lg">Coca-Cola</div>
                            <div className="text-xs">ZERO SUGAR</div>
                            <div className="text-2xl font-bold mt-2">1.5L</div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            Coca-Cola Zero Sugar 1.5L
                          </h3>
                          <p className="text-xs text-gray-600 mb-3">SKU: CCZ1.5L-GR</p>
                          
                          <div className="flex items-baseline gap-3 mb-3">
                            <span className="text-3xl font-bold text-gray-900">€1.75</span>
                            <span className="text-sm text-gray-500 line-through">€1.85</span>
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                              SALE
                            </span>
                          </div>
                          
                          <button className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition-colors">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Compliance Tracker Form */}
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 bg-white rounded-lg shadow-lg border-2 border-gray-300 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Compliance Tracker - Manual Data Entry</h3>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value="CCZ1.5L-GR"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    JBP Agreed Price
                  </label>
                  <input
                    type="text"
                    value="€1.65"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Live Website Price <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Type the price you see..."
                    value={enteredPrice}
                    onChange={(e) => {
                      setEnteredPrice(e.target.value);
                      setShowError(false);
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <AnimatePresence>
                {showError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 border-l-4 border-red-500 p-3 mb-4"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <p className="text-sm font-semibold text-red-900">
                        Error: Value does not match website screenshot. Please re-type carefully.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isComplete ? (
                <button
                  onClick={handlePriceSubmit}
                  disabled={!enteredPrice}
                  className="bg-[#E41E2B] text-white px-6 py-3 rounded font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Submit Entry → Continue to Next SKU (2 of 150)
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-900 mb-2">Discrepancy Recorded</h4>
                      <p className="text-sm text-yellow-800 mb-3">
                        Price mismatch detected: Expected €1.65, Found €1.75 (+€0.10 variance)
                      </p>
                      <p className="text-xs text-yellow-700 bg-yellow-100 rounded p-2 mb-3">
                        ⏱️ Time spent on this single SKU: <strong>2 minutes 34 seconds</strong><br/>
                        📊 Remaining SKUs: <strong>149</strong><br/>
                        ⏳ Estimated time to completion: <strong>6 hours 23 minutes</strong>
                      </p>
                      <button
                        onClick={onComplete}
                        className="bg-[#E41E2B] hover:bg-red-700 text-white px-6 py-3 rounded font-semibold transition-colors"
                      >
                        Experience the AI-Powered Way →
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

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
                  className="bg-gradient-to-br from-[#E41E2B] to-red-700 text-white rounded-lg p-8 max-w-md shadow-2xl"
                >
                  <h3 className="text-2xl font-bold mb-4">💡 Notice the "Digital Window Shopping" Fatigue?</h3>
                  <p className="text-lg mb-6 leading-relaxed">
                    You're wasting your talent on <strong>Ctrl+C and Ctrl+V</strong>. This is repetitive work that steals time from strategic relationship management.
                  </p>
                  <button
                    onClick={() => {
                      setShowMindsetPopup(false);
                      onComplete();
                    }}
                    className="bg-white text-[#E41E2B] px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors w-full"
                  >
                    I understand - Show me the better way →
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
                onClick={(e) => {
                  e.stopPropagation();
                  // Prevent closing by clicking overlay
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-xl p-8 max-w-2xl shadow-2xl border-4 border-[#E41E2B]"
                >
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-200">
                    <div className="w-16 h-16 bg-[#E41E2B] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-3xl">👔</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Welcome to Part 1: The Manual Way</h3>
                      <p className="text-sm text-gray-600">Promo Compliance Auditing Simulation</p>
                    </div>
                  </div>

                  {/* Role Description */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Your Role:</h4>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      You are a <strong className="text-[#E41E2B]">Trade Promotions Manager</strong> at Coca-Cola Hellenic responsible for 
                      ensuring retail partners comply with agreed promotional pricing across 150+ SKUs.
                    </p>
                  </div>

                  {/* Today's Task */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
                    <h4 className="text-lg font-bold text-blue-900 mb-3">Today's Task:</h4>
                    <p className="text-blue-800 mb-3">
                      Check if <strong>Sklavenitis</strong> (a major Greek retailer) is honoring the promotional price 
                      for <strong>Coca-Cola Zero Sugar 1.5L</strong> as agreed in your Joint Business Plan.
                    </p>
                    <div className="bg-white rounded p-3 border border-blue-300">
                      <p className="text-sm text-gray-700 mb-2"><strong>Your Process:</strong></p>
                      <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                        <li>Open the Joint Business Plan PDF (left side) to find the agreed promo price</li>
                        <li>Visit the retailer's website (right side) and search for "Coca-Cola Zero 1.5L"</li>
                        <li>Compare the live website price with the JBP agreed price</li>
                        <li>Manually type any discrepancy into the compliance tracker</li>
                      </ol>
                    </div>
                  </div>

                  {/* Key Info */}
                  <div className="bg-yellow-50 rounded-lg p-4 mb-6 border-2 border-yellow-300">
                    <p className="text-sm text-yellow-900">
                      ⏱️ <strong>Reality Check:</strong> This is just 1 of 150 SKUs you need to audit daily. 
                      Experience the manual tedium before discovering the AI-powered alternative.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowWelcomePopup(false)}
                    className="bg-[#E41E2B] hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors w-full shadow-lg"
                  >
                    I Understand — Start Manual Audit →
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}