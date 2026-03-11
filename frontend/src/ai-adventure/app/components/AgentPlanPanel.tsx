import { Card, CardContent, CardHeader, CardTitle } from '@ai-adventure/app/components/ui/card';
import { Badge } from '@ai-adventure/app/components/ui/badge';
import { Scenario } from '@ai-adventure/app/types/scenario';
import { CheckCircle2, Circle, AlertCircle, Wrench, Database, Target } from 'lucide-react';

interface AgentPlanPanelProps {
  scenario: Scenario;
  currentStepId?: string;
  completedSteps: string[];
}

export function AgentPlanPanel({ scenario, currentStepId, completedSteps }: AgentPlanPanelProps) {
  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50 sticky top-6">
      <CardHeader className="bg-blue-100 border-b border-blue-200">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-sm">🤖</span>
          </div>
          Agent Plan
        </CardTitle>
        <p className="text-sm text-blue-800 mt-2">
          Transparent view of what the AI agent will do, which tools it uses, and success criteria.
        </p>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
        {scenario.steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStepId;
          const isPending = !isCompleted && !isCurrent;

          return (
            <div
              key={step.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isCurrent
                  ? 'bg-white border-[#F40009] shadow-md'
                  : isCompleted
                  ? 'bg-green-50 border-green-300'
                  : 'bg-white border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted
                    ? 'bg-green-600'
                    : isCurrent
                    ? 'bg-[#F40009]'
                    : 'bg-gray-300'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : (
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-gray-600 mb-3">{step.description}</p>

                  {/* Tools */}
                  <div className="mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Wrench className="h-3 w-3 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-700">Tools:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {step.tools.map(tool => (
                        <Badge key={tool} variant="outline" className="text-xs py-0 px-2">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Data Used */}
                  <div className="mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Database className="h-3 w-3 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-700">Data:</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {step.dataUsed.join(' • ')}
                    </div>
                  </div>

                  {/* Success Criteria */}
                  <div className="mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Target className="h-3 w-3 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-700">Success:</span>
                    </div>
                    <div className="text-xs text-gray-600 italic">
                      {step.successCriteria}
                    </div>
                  </div>

                  {/* HITL Warning */}
                  {step.requiresHITL && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded">
                      <AlertCircle className="h-3 w-3" />
                      <span className="font-semibold">Requires approval</span>
                    </div>
                  )}

                  {/* Duration */}
                  <div className="mt-2 text-xs text-gray-500">
                    ⏱️ ~{step.duration}s
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
