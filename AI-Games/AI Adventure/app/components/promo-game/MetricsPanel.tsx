import { TrendingDown, Clock, Zap, DollarSign } from 'lucide-react';

interface MetricCardProps {
  label: string;
  manual: string;
  agentic: string;
  icon: React.ReactNode;
}

function MetricCard({ label, manual, agentic, icon }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-gray-600">{icon}</div>
        <h4 className="font-semibold text-sm text-gray-900">{label}</h4>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Manual Process:</span>
          <span className="text-sm font-medium text-red-600">{manual}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Agentic Process:</span>
          <span className="text-sm font-medium text-green-600">{agentic}</span>
        </div>
      </div>
    </div>
  );
}

export function MetricsPanel() {
  return (
    <div className="bg-gray-50 border-l border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Impact Metrics</h3>
        <p className="text-sm text-gray-600">Manual vs. Agentic Comparison</p>
      </div>
      
      <div className="space-y-4">
        <MetricCard
          label="Daily Audit Time"
          manual="120-180 Minutes"
          agentic="0 Minutes (Auto)"
          icon={<Clock className="w-4 h-4" />}
        />
        
        <MetricCard
          label="Audit Frequency"
          manual="Once Daily (Sampled)"
          agentic="Real-time (Continuous)"
          icon={<Zap className="w-4 h-4" />}
        />
        
        <MetricCard
          label="Response Time"
          manual="24+ Hours"
          agentic="< 5 Minutes"
          icon={<TrendingDown className="w-4 h-4" />}
        />
        
        <MetricCard
          label="Financial Impact"
          manual="High Promo Leakage"
          agentic="Optimized Trade Spend"
          icon={<DollarSign className="w-4 h-4" />}
        />
      </div>

      <div className="mt-6 p-4 bg-[#E41E2B] text-white rounded-lg">
        <p className="text-xs font-semibold mb-1">ESTIMATED ANNUAL SAVINGS</p>
        <p className="text-2xl font-bold">€450,000+</p>
        <p className="text-xs mt-1 opacity-90">Based on reduced promo leakage</p>
      </div>
    </div>
  );
}
