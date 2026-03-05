import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Scenario } from '@/app/types/scenario';
import { 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Shield,
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface PostActionReflectionProps {
  scenario: Scenario;
  completedSteps: string[];
  onClose: () => void;
  onNewScenario: () => void;
}

export function PostActionReflection({ 
  scenario, 
  completedSteps,
  onClose,
  onNewScenario 
}: PostActionReflectionProps) {
  const totalDuration = scenario.steps.reduce((sum, step) => sum + step.duration, 0);
  const hitlSteps = scenario.steps.filter(step => step.requiresHITL).length;

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center py-8">
        <div className="text-7xl mb-4">🎉</div>
        <h3 className="text-3xl font-bold text-green-600 mb-2">Scenario Complete!</h3>
        <p className="text-gray-600 text-lg">
          You successfully completed the "{scenario.title}" workflow
        </p>
      </div>

      {/* What Happened */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            What Just Happened?
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-semibold">Steps Completed</span>
              </div>
              <div className="text-3xl font-bold text-green-600">{completedSteps.length}</div>
              <div className="text-sm text-gray-600">out of {scenario.steps.length} total</div>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Execution Time</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{totalDuration}s</div>
              <div className="text-sm text-gray-600">automated workflow</div>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-orange-600" />
                <span className="font-semibold">HITL Gates</span>
              </div>
              <div className="text-3xl font-bold text-orange-600">{hitlSteps}</div>
              <div className="text-sm text-gray-600">approval checkpoints</div>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-semibold">Time Saved</span>
              </div>
              <div className="text-3xl font-bold text-green-600">{scenario.benefits.timeSaved}</div>
              <div className="text-sm text-gray-600">vs manual process</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <h4 className="font-semibold mb-2">Key Actions Performed:</h4>
            <ul className="space-y-2">
              {scenario.steps.map(step => (
                <li key={step.id} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">{step.title}:</span>
                    <span className="text-gray-600 ml-1">{step.successCriteria}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Estimate */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader className="bg-green-100">
          <CardTitle className="flex items-center gap-2 text-green-900">
            <TrendingUp className="h-5 w-5" />
            Impact & Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-green-900 mb-1">⏱️ {scenario.benefits.timeSaved} Saved</h4>
                  <p className="text-green-800">
                    This workflow typically takes 15-45 minutes manually. The AI agent completed it in under {Math.ceil(totalDuration / 60)} minute{totalDuration > 60 ? 's' : ''}.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-green-900 mb-1">📊 {scenario.benefits.impactMetric}</h4>
                  <p className="text-green-800">
                    Beyond time savings, this automation improved accuracy, ensured policy compliance, and provided better outcomes.
                  </p>
                </div>
              </div>
            </div>

            {hitlSteps > 0 && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-green-900 mb-1">🛡️ Risk Mitigation</h4>
                    <p className="text-green-800">
                      {hitlSteps} human-in-the-loop checkpoint{hitlSteps > 1 ? 's' : ''} ensured critical decisions were reviewed before execution, preventing costly mistakes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Learning Modules */}
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <BookOpen className="h-5 w-5" />
            Continue Learning
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-gray-600 mb-4">
            Deepen your understanding of agentic AI with these modules from the <strong>DIAI Academy - Agentic AI Module</strong>:
          </p>
          <div className="space-y-2">
            {scenario.learningModules.map((module, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-between hover:border-[#F40009] hover:text-[#F40009]"
              >
                <span className="flex items-center gap-2">
                  <Badge variant="secondary">{index + 1}</Badge>
                  {module}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={onNewScenario}
          className="flex-1 bg-[#F40009] hover:bg-[#DC0008]"
          size="lg"
        >
          Try Another Scenario
        </Button>
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 border-2"
          size="lg"
        >
          Review Execution
        </Button>
      </div>
    </div>
  );
}