import { Clock, MousePointerClick, Activity } from 'lucide-react';

interface MetricsPanelProps {
  phase: 'manual' | 'agentic';
  time: string;
  effort: string;
  status: string;
}

export function MetricsPanel({ phase, time, effort, status }: MetricsPanelProps) {
  const isManual = phase === 'manual';
  
  return (
    <div className={`w-80 ${
      isManual 
        ? 'bg-gradient-to-br from-red-50 to-gray-100 border-l-4 border-red-500' 
        : 'bg-gradient-to-br from-slate-900 to-slate-800 border-l-4 border-cyan-500'
    } p-6 overflow-y-auto`}>
      {/* Scorecard Header */}
      <div className="mb-6">
        <h3 className={`text-sm font-bold mb-4 ${
          isManual ? 'text-gray-600' : 'text-cyan-400'
        }`}>
          {isManual ? 'DASHBOARD' : 'SCOREBOARD'}
        </h3>
        
        <div className="space-y-4">
          {/* Time Metric */}
          <div className={`p-4 rounded-lg ${
            isManual ? 'bg-white border-2 border-gray-200' : 'bg-slate-800 border-2 border-cyan-500/30'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${
                isManual ? 'bg-red-100' : 'bg-cyan-500/20'
              }`}>
                <Clock className={`w-4 h-4 ${
                  isManual ? 'text-red-600' : 'text-cyan-400'
                }`} />
              </div>
              <span className={`text-xs font-semibold ${
                isManual ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Time
              </span>
            </div>
            <p className={`text-2xl font-bold ${
              isManual ? 'text-gray-900' : 'text-white'
            } ${!isManual && 'glow-text'}`}>
              {time}
            </p>
          </div>

          {/* Effort Metric */}
          <div className={`p-4 rounded-lg ${
            isManual ? 'bg-white border-2 border-gray-200' : 'bg-slate-800 border-2 border-cyan-500/30'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${
                isManual ? 'bg-red-100' : 'bg-cyan-500/20'
              }`}>
                <MousePointerClick className={`w-4 h-4 ${
                  isManual ? 'text-red-600' : 'text-cyan-400'
                }`} />
              </div>
              <span className={`text-xs font-semibold ${
                isManual ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {isManual ? 'Effort' : 'Decisions'}
              </span>
            </div>
            <p className={`text-2xl font-bold ${
              isManual ? 'text-gray-900' : 'text-white'
            } ${!isManual && 'glow-text'}`}>
              {effort}
            </p>
          </div>

          {/* Status Metric */}
          <div className={`p-4 rounded-lg ${
            isManual ? 'bg-white border-2 border-gray-200' : 'bg-slate-800 border-2 border-cyan-500/30'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${
                isManual ? 'bg-red-100' : 'bg-cyan-500/20'
              }`}>
                <Activity className={`w-4 h-4 ${
                  isManual ? 'text-red-600' : 'text-cyan-400'
                }`} />
              </div>
              <span className={`text-xs font-semibold ${
                isManual ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Status
              </span>
            </div>
            <p className={`text-lg font-bold ${
              isManual 
                ? 'text-red-600' 
                : 'text-cyan-400 glow-text'
            }`}>
              {status}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Context */}
      <div className={`p-4 rounded-lg ${
        isManual 
          ? 'bg-red-50 border border-red-200' 
          : 'bg-cyan-500/10 border border-cyan-500/30'
      }`}>
        <p className={`text-xs ${
          isManual ? 'text-red-800' : 'text-cyan-300'
        }`}>
          {isManual 
            ? 'Manual processes create delays and missed opportunities in fast-moving supply chain disruptions.'
            : 'AI agents provide instant situational awareness and enable proactive decision-making before competitors can react.'}
        </p>
      </div>

      {!isManual && (
        <style>{`
          .glow-text {
            text-shadow: 0 0 20px rgba(34, 211, 238, 0.5);
            animation: pulse 2s ease-in-out infinite;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
        `}</style>
      )}
    </div>
  );
}
