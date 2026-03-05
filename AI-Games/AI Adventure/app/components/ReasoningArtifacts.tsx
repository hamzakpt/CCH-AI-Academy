import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { AgentStep } from '@/app/types/scenario';
import { Database, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReasoningArtifactsProps {
  step: AgentStep;
  stepNumber: number;
}

// Mock reasoning artifacts based on step - in production, these would come from actual agent execution
const getReasoningArtifacts = (stepId: string, stepNumber: number) => {
  const artifacts: { [key: string]: any } = {
    'step-1': {
      dataSources: [
        { name: 'Customer 360 Database', recordsAccessed: 1, lastUpdated: '2 hours ago' },
        { name: 'RED KPI Dashboard', recordsAccessed: 12, lastUpdated: '1 day ago' },
        { name: 'Transaction History', recordsAccessed: 487, lastUpdated: '1 hour ago' }
      ],
      keyFindings: [
        { metric: 'Annual Revenue', value: '€42,000', trend: 'stable', confidence: 95 },
        { metric: 'Promo Participation', value: '67%', trend: 'up', confidence: 92 },
        { metric: 'Fanta Sales YoY', value: '-18%', trend: 'down', confidence: 98 },
        { metric: 'Visit Frequency', value: '2.3/week', trend: 'stable', confidence: 90 }
      ],
      rules: [
        { rule: 'VIP Tier Threshold', condition: 'Revenue > €40K', result: '✓ Passed' },
        { rule: 'Active Customer', condition: 'Last purchase < 7 days', result: '✓ Passed' }
      ]
    },
    'step-2': {
      dataSources: [
        { name: 'Opportunity Detection Engine', recordsAccessed: 8, lastUpdated: '5 min ago' },
        { name: 'Market Benchmarks Database', recordsAccessed: 156, lastUpdated: '1 day ago' },
        { name: 'Competitor Intelligence', recordsAccessed: 23, lastUpdated: '3 hours ago' }
      ],
      keyFindings: [
        { metric: 'Fanta SKU Count', value: '2 vs 4 avg', trend: 'below', confidence: 96 },
        { metric: 'Category Penetration', value: '45% vs 78% avg', trend: 'below', confidence: 94 },
        { metric: 'Opportunity Value', value: '€2,400/year', trend: 'high', confidence: 87 },
        { metric: 'Competitive Gap', value: 'Store next door has full range', trend: 'risk', confidence: 91 }
      ],
      rules: [
        { rule: 'Significant Gap', condition: 'Customer SKUs < 50% market avg', result: '✓ Triggered' },
        { rule: 'High Impact', condition: 'Opportunity > €2K annual', result: '✓ Triggered' },
        { rule: 'Promo Readiness', condition: 'Customer promo score > 60%', result: '✓ Passed' }
      ]
    },
    'step-3': {
      dataSources: [
        { name: 'Pricing Catalog', recordsAccessed: 45, lastUpdated: '2 days ago' },
        { name: 'Promo Calendar', recordsAccessed: 3, lastUpdated: '1 week ago' },
        { name: 'Space Allocation Model', recordsAccessed: 1, lastUpdated: '5 hours ago' }
      ],
      keyFindings: [
        { metric: 'Recommended SKUs', value: 'Fanta 500ml, 1.5L', trend: 'add', confidence: 93 },
        { metric: 'Promo Discount', value: '15% (Q2 campaign)', trend: 'leverage', confidence: 97 },
        { metric: 'Incremental Revenue', value: '€600/month', trend: 'up', confidence: 85 },
        { metric: 'Space Required', value: '0.8m shelf space', trend: 'feasible', confidence: 88 }
      ],
      rules: [
        { rule: 'Margin Protection', condition: 'Discount ≤ 20%', result: '✓ Passed (15%)' },
        { rule: 'Volume Threshold', condition: 'Projected units > 100/month', result: '✓ Passed (240)' },
        { rule: 'Space Availability', condition: 'Required space < 1m', result: '✓ Passed (0.8m)' }
      ]
    },
    'step-4': {
      dataSources: [
        { name: 'Customer Personality Profile', recordsAccessed: 1, lastUpdated: '1 month ago' },
        { name: 'Past Negotiations DB', recordsAccessed: 7, lastUpdated: '3 months ago' },
        { name: 'Talk Track Templates', recordsAccessed: 3, lastUpdated: '2 weeks ago' }
      ],
      keyFindings: [
        { metric: 'Customer Style', value: 'Data-driven, needs proof', trend: 'insight', confidence: 89 },
        { metric: 'Decision Speed', value: 'Fast (avg 2 days)', trend: 'positive', confidence: 92 },
        { metric: 'Objection Pattern', value: 'Space & margin concerns', trend: 'known', confidence: 95 },
        { metric: 'Success Rate', value: '78% with visual aids', trend: 'high', confidence: 88 }
      ],
      rules: [
        { rule: 'Lead with Data', condition: 'Customer profile = analytical', result: '✓ Applied' },
        { rule: 'Visual Support', condition: 'Success rate with visuals > 70%', result: '✓ Include space plan' },
        { rule: 'Objection Prep', condition: 'Historical objections identified', result: '✓ 3 responses ready' }
      ]
    }
  };

  return artifacts[stepId] || null;
};

export function ReasoningArtifacts({ step, stepNumber }: ReasoningArtifactsProps) {
  const artifacts = getReasoningArtifacts(step.id, stepNumber);

  if (!artifacts) return null;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-300';
    if (confidence >= 80) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-orange-100 text-orange-800 border-orange-300';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      case 'high': return '🔥';
      case 'below': return '⚠️';
      case 'risk': return '⚠️';
      case 'positive': return '✅';
      default: return '📊';
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs">🧠</span>
          </div>
          Reasoning Artifacts - Step {stepNumber}
        </CardTitle>
        <p className="text-xs text-blue-800 mt-1">
          Transparent view of data sources, business rules, and confidence levels
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data Sources */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-blue-600" />
            <h4 className="font-semibold text-sm">Data Sources Used</h4>
          </div>
          <div className="space-y-2">
            {artifacts.dataSources.map((source: any, idx: number) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-blue-200 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{source.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {source.recordsAccessed} record{source.recordsAccessed > 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  Last updated: {source.lastUpdated}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Findings with Confidence */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <h4 className="font-semibold text-sm">Key Findings</h4>
          </div>
          <div className="space-y-2">
            {artifacts.keyFindings.map((finding: any, idx: number) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTrendIcon(finding.trend)}</span>
                    <span className="font-medium text-sm">{finding.metric}</span>
                  </div>
                  <Badge className={`${getConfidenceBadge(finding.confidence)} border text-xs`}>
                    {finding.confidence}% confidence
                  </Badge>
                </div>
                <div className="text-base font-semibold text-gray-900 ml-7">
                  {finding.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Rules Applied */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <h4 className="font-semibold text-sm">Business Rules & Thresholds</h4>
          </div>
          <div className="space-y-2">
            {artifacts.rules.map((rule: any, idx: number) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-blue-200 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-medium mb-1">{rule.rule}</div>
                    <div className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
                      {rule.condition}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-700 font-semibold whitespace-nowrap">
                    <CheckCircle2 className="h-4 w-4" />
                    {rule.result}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Summary */}
        <div className="bg-white rounded-lg p-3 border-2 border-blue-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Overall Analysis Confidence</span>
            <div className="flex items-center gap-2">
              {artifacts.keyFindings.map((f: any, idx: number) => (
                <div key={idx} className={`text-xs ${getConfidenceColor(f.confidence)}`}>
                  {f.confidence}%
                </div>
              ))}
              <Badge className="bg-blue-600 text-white ml-2">
                Avg: {Math.round(artifacts.keyFindings.reduce((sum: number, f: any) => sum + f.confidence, 0) / artifacts.keyFindings.length)}%
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
