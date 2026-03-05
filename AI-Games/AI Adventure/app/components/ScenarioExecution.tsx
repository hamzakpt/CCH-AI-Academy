import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Scenario, AgentStep } from '@/app/types/scenario';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { AgentPlanPanel } from '@/app/components/AgentPlanPanel';
import { HITLGate } from '@/app/components/HITLGate';
import { PostActionReflection } from '@/app/components/PostActionReflection';
import { ReasoningArtifacts } from '@/app/components/ReasoningArtifacts';

interface ScenarioExecutionProps {
  scenario: Scenario;
  mode: 'learn' | 'apply';
  onReset: () => void;
}

type ExecutionState = 'ready' | 'running' | 'waiting-hitl' | 'completed';

export function ScenarioExecution({ scenario, mode, onReset }: ScenarioExecutionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [executionState, setExecutionState] = useState<ExecutionState>('ready');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showPlanPanel, setShowPlanPanel] = useState(mode === 'learn');
  const [progress, setProgress] = useState(0);
  const [showReflection, setShowReflection] = useState(false);

  const currentStep = currentStepIndex >= 0 ? scenario.steps[currentStepIndex] : null;
  const allStepsCompleted = completedSteps.length === scenario.steps.length;

  useEffect(() => {
    if (executionState === 'running' && currentStep && !currentStep.requiresHITL) {
      // Simulate step execution
      const timer = setTimeout(() => {
        handleStepComplete();
      }, currentStep.duration * 1000);

      // Update progress
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          const increment = 100 / (currentStep.duration * 10);
          return Math.min(prev + increment, 100);
        });
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(progressTimer);
      };
    }
  }, [executionState, currentStepIndex]);

  const handleStart = () => {
    setCurrentStepIndex(0);
    setExecutionState('running');
    setProgress(0);
  };

  const handleStepComplete = () => {
    if (currentStep) {
      setCompletedSteps(prev => [...prev, currentStep.id]);
      setProgress(100);
      
      // Move to next step or complete
      if (currentStepIndex < scenario.steps.length - 1) {
        setTimeout(() => {
          const nextStep = scenario.steps[currentStepIndex + 1];
          if (nextStep.requiresHITL) {
            setExecutionState('waiting-hitl');
          }
          setCurrentStepIndex(currentStepIndex + 1);
          setProgress(0);
          if (!nextStep.requiresHITL) {
            setExecutionState('running');
          }
        }, 1000);
      } else {
        setExecutionState('completed');
        setShowReflection(true);
      }
    }
  };

  const handleHITLApprove = () => {
    handleStepComplete();
    setExecutionState('running');
  };

  const handleHITLReject = () => {
    setExecutionState('ready');
    setCurrentStepIndex(currentStepIndex - 1);
  };

  const totalDuration = scenario.steps.reduce((sum, step) => sum + step.duration, 0);
  const elapsedDuration = scenario.steps
    .slice(0, currentStepIndex + 1)
    .reduce((sum, step) => sum + step.duration, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onReset}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scenarios
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="text-5xl">{typeof scenario.icon === 'string' ? scenario.icon : <scenario.icon className="h-10 w-10" />}</div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold">{scenario.title}</h2>
                <Badge className={mode === 'learn' ? 'bg-blue-600' : 'bg-green-600'}>
                  {mode === 'learn' ? '🎓 Learn Mode' : '⚡ Apply Mode'}
                </Badge>
              </div>
              <p className="text-gray-600 text-lg mb-2">{scenario.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {scenario.estimatedTime}
                </span>
                <span>{scenario.steps.length} steps</span>
                <span className="font-semibold text-green-600">{scenario.benefits.timeSaved} saved</span>
              </div>
            </div>
          </div>

          {mode === 'apply' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPlanPanel(!showPlanPanel)}
              className="flex items-center gap-2"
            >
              {showPlanPanel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPlanPanel ? 'Hide' : 'Show'} Agent Plan
            </Button>
          )}
        </div>
      </div>

      {/* Problem Statement */}
      <Alert className="mb-6 border-2 border-yellow-400 bg-yellow-50">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <AlertDescription className="text-base">
          <strong className="text-yellow-900">Problem:</strong> {scenario.problem}
        </AlertDescription>
      </Alert>

      {/* Main Execution Area */}
      <div className="grid grid-cols-12 gap-6">
        {/* Execution Panel */}
        <div className={showPlanPanel ? 'col-span-7' : 'col-span-12'}>
          <Card className="border-2">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#F40009]" />
                  Agent Execution
                </span>
                {executionState === 'ready' && (
                  <Button onClick={handleStart} className="bg-[#F40009] hover:bg-[#DC0008]">
                    <Play className="h-4 w-4 mr-2" />
                    Start Agent
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {executionState === 'ready' && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Start</h3>
                  <p className="text-gray-600">
                    Click "Start Agent" to begin the automated workflow
                  </p>
                </div>
              )}

              {executionState !== 'ready' && !showReflection && (
                <div className="space-y-6">
                  {/* Progress Overview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">
                        Step {currentStepIndex + 1} of {scenario.steps.length}
                      </span>
                      <span className="text-sm text-gray-600">
                        {completedSteps.length} completed
                      </span>
                    </div>
                    <Progress value={(completedSteps.length / scenario.steps.length) * 100} className="mb-2" />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Estimated: {elapsedDuration}s / {totalDuration}s</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.max(0, totalDuration - elapsedDuration)}s remaining
                      </span>
                    </div>
                  </div>

                  {/* Current Step Execution */}
                  {currentStep && (
                    <>
                      {executionState === 'waiting-hitl' ? (
                        <HITLGate
                          step={currentStep}
                          onApprove={handleHITLApprove}
                          onReject={handleHITLReject}
                        />
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${
                              completedSteps.includes(currentStep.id) 
                                ? 'bg-green-100' 
                                : 'bg-blue-100 animate-pulse'
                            }`}>
                              {completedSteps.includes(currentStep.id) ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <div className="h-3 w-3 bg-blue-600 rounded-full" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-1">{currentStep.title}</h4>
                              <p className="text-gray-600 mb-3">{currentStep.description}</p>
                              
                              {executionState === 'running' && (
                                <div className="space-y-3">
                                  <Progress value={progress} className="h-2" />
                                  <div className="text-sm text-gray-500">
                                    Processing... {Math.round(progress)}%
                                  </div>
                                </div>
                              )}

                              {completedSteps.includes(currentStep.id) && (
                                <>
                                  <Alert className="bg-green-50 border-green-200 mb-4">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800">
                                      <strong>Success:</strong> {currentStep.successCriteria}
                                    </AlertDescription>
                                  </Alert>
                                  
                                  {/* Show Reasoning Artifacts for Commercial scenario */}
                                  {scenario.id === 'commercial-1' && (
                                    <ReasoningArtifacts 
                                      step={currentStep} 
                                      stepNumber={scenario.steps.findIndex(s => s.id === currentStep.id) + 1}
                                    />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Completed Steps */}
                  {completedSteps.length > 0 && currentStepIndex > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-500 mb-3">Completed Steps</h4>
                      <div className="space-y-2">
                        {scenario.steps
                          .filter(step => completedSteps.includes(step.id) && step.id !== currentStep?.id)
                          .map(step => (
                            <div key={step.id} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <span className="text-gray-700">{step.title}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {showReflection && (
                <PostActionReflection
                  scenario={scenario}
                  completedSteps={completedSteps}
                  onClose={() => setShowReflection(false)}
                  onNewScenario={onReset}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Agent Plan Panel */}
        {showPlanPanel && (
          <div className="col-span-5">
            <AgentPlanPanel 
              scenario={scenario} 
              currentStepId={currentStep?.id}
              completedSteps={completedSteps}
            />
          </div>
        )}
      </div>
    </div>
  );
}