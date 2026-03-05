import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Scenario } from '@/app/types/scenario';
import { Clock, AlertCircle, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OldVsNewComparisonProps {
  scenario: Scenario;
  onChooseNewWay: () => void;
  onChooseOldWay: () => void;
}

export function OldVsNewComparison({ scenario, onChooseNewWay, onChooseOldWay }: OldVsNewComparisonProps) {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          {typeof scenario.icon === 'string' ? scenario.icon : <scenario.icon className="h-8 w-8 inline-block mr-2" />} {scenario.title}
        </h2>
        <p className="text-lg text-gray-700 mb-2">
          <strong>Problem:</strong> {scenario.problem}
        </p>
        <Badge variant="secondary" className="text-sm">
          {scenario.function} • {scenario.difficulty}
        </Badge>
      </div>

      {/* Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Traditional Manual Process */}
        <Card className="border-2 border-gray-300 bg-gray-50 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gray-100 border-b-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-xl font-bold">📋 Traditional Manual Process</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{scenario.oldWayTime || '30-60 min'}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-4 font-medium">
              How you'd normally handle this:
            </p>
            <ol className="space-y-2.5">
              {(scenario.oldWaySteps || []).map((step, index) => (
                <li key={index} className="flex gap-3 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                    {index + 1}
                  </span>
                  <span className="flex-1 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <div className="flex gap-2 items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Pain Points:</strong> Multiple systems, waiting for responses, manual data entry, prone to errors
                </div>
              </div>
            </div>

            <Button
              onClick={onChooseOldWay}
              variant="outline"
              className="w-full mt-6 border-2 font-semibold"
              size="lg"
            >
              Show me this way
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* AI Agent Approach */}
        <Card className="border-4 border-[#E41E2B] bg-gradient-to-br from-red-50 to-white hover:shadow-2xl transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#E41E2B] text-white px-4 py-1.5 text-xs font-bold rounded-bl-lg shadow-lg">
            RECOMMENDED
          </div>
          <CardHeader className="bg-gradient-to-r from-[#E41E2B]/5 to-transparent border-b-2 border-red-100">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#E41E2B]" />
                AI Agent Assistant
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 text-[#E41E2B]">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-bold">{scenario.estimatedTime}</span>
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 border-green-300 font-semibold">
                ⚡ {scenario.benefits.timeSaved} saved
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-700 mb-4 font-medium">
              How the AI agent handles this:
            </p>
            <ol className="space-y-2.5">
              {scenario.steps.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm text-gray-800">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E41E2B] text-white flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 pt-0.5">
                    <div className="font-semibold">{step.title}</div>
                    <div className="text-gray-600 text-xs mt-0.5">{step.description}</div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex gap-2 items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <strong>Benefits:</strong> {scenario.benefits.impactMetric}
                </div>
              </div>
            </div>

            <Button
              onClick={onChooseNewWay}
              className="w-full mt-6 bg-[#E41E2B] hover:bg-[#DC0008]"
              size="lg"
            >
              Work with AI Agent
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom CTA */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              💡 Learning Objective
            </h3>
            <p className="text-gray-700 text-sm max-w-3xl mx-auto">
              See how agentic AI transforms manual, time-consuming workflows into fast, automated processes 
              while keeping you in control with Human-in-the-Loop approvals at critical steps.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}