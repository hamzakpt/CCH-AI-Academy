import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ai-adventure/app/components/ui/card';
import { Button } from '@ai-adventure/app/components/ui/button';
import { Badge } from '@ai-adventure/app/components/ui/badge';
import { Input } from '@ai-adventure/app/components/ui/input';
import { Progress } from '@ai-adventure/app/components/ui/progress';
import { Alert, AlertDescription } from '@ai-adventure/app/components/ui/alert';
import { Scenario, AgentStep } from '@ai-adventure/app/types/scenario';
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  Sparkles,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Clock
} from 'lucide-react';
import { AgentPlanPanel } from '@ai-adventure/app/components/AgentPlanPanel';
import { ReasoningArtifacts } from '@ai-adventure/app/components/ReasoningArtifacts';
import { PostActionReflection } from '@ai-adventure/app/components/PostActionReflection';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  stepId?: string;
  showReasoning?: boolean;
  suggestedQuestions?: string[];
  requiresApproval?: boolean;
  approved?: boolean;
  showProgress?: boolean;
  isCurrentStep?: boolean;
}

interface ChatBasedExecutionProps {
  scenario: Scenario;
  mode: 'learn' | 'apply';
  onReset: () => void;
}

type ExecutionState = 'ready' | 'running' | 'waiting-input' | 'waiting-hitl' | 'completed';

export function ChatBasedExecution({ scenario, mode, onReset }: ChatBasedExecutionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [executionState, setExecutionState] = useState<ExecutionState>('ready');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showPlanPanel, setShowPlanPanel] = useState(mode === 'learn');
  const [progress, setProgress] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [currentProgressInterval, setCurrentProgressInterval] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentStep = currentStepIndex >= 0 ? scenario.steps[currentStepIndex] : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial greeting
  useEffect(() => {
    if (executionState === 'ready' && messages.length === 0) {
      setTimeout(() => {
        addAgentMessage(
          `👋 Hi! I'm your AI assistant. I can help you with: **${scenario.title}**\n\n**Situation:** ${scenario.problem}\n\nShall I analyze this and recommend the best action? Just say "yes" or "start" to begin!`,
          undefined,
          ['Yes, start!', 'What will you do?', 'How long will this take?']
        );
      }, 500);
    }
  }, []);

  const addAgentMessage = (content: string, stepId?: string, suggestedQuestions?: string[], showReasoning?: boolean, requiresApproval?: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'agent',
      content,
      timestamp: new Date(),
      stepId,
      suggestedQuestions,
      showReasoning,
      requiresApproval
    };
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, newMessage]);
    }, 800);
  };

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleStart = () => {
    setCurrentStepIndex(0);
    setExecutionState('running');
    setProgress(0);
    
    addAgentMessage(
      `🎯 Perfect! I'll work through this step-by-step. Here's my plan:\n\n${scenario.steps.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}\n\nStarting now...`,
      undefined,
      undefined
    );

    // Wait for the message to appear, then start execution
    setTimeout(() => {
      console.log('About to execute step 0');
      executeCurrentStep(0); // Pass the index explicitly
    }, 1500);
  };

  const executeCurrentStep = (stepIndex?: number) => {
    const indexToUse = stepIndex !== undefined ? stepIndex : currentStepIndex;
    const stepToExecute = scenario.steps[indexToUse];
    
    if (!stepToExecute) {
      console.log('No current step to execute, stepIndex:', indexToUse);
      return;
    }

    console.log('Executing step:', indexToUse, stepToExecute.title);

    // Agent announces what it's doing immediately
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      const stepMessage: Message = {
        id: Date.now().toString(),
        type: 'agent',
        content: `🔄 **Step ${indexToUse + 1}/${scenario.steps.length}: ${stepToExecute.title}**\n\n${stepToExecute.description}\n\nWorking on this now...`,
        timestamp: new Date(),
        stepId: stepToExecute.id,
        showProgress: true
      };
      
      setMessages(prev => [...prev, stepMessage]);
      console.log('Step message added, starting progress...');

      // Reset progress and start execution
      setProgress(0);

      // Simulate execution
      if (!stepToExecute.requiresHITL) {
        console.log('Starting auto execution for step:', stepToExecute.title);
        // Progress updates
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            const increment = 100 / (stepToExecute.duration * 10);
            const newProgress = Math.min(prev + increment, 100);
            console.log('Progress update:', newProgress);
            return newProgress;
          });
        }, 100);

        // Complete after duration
        setTimeout(() => {
          clearInterval(progressInterval);
          setProgress(100);
          console.log('Step complete, calling handleStepComplete with index:', indexToUse);
          handleStepComplete(indexToUse);
        }, stepToExecute.duration * 1000);
      } else {
        console.log('Step requires approval, showing approval request');
        // Human-in-the-Loop step - ask for approval
        setTimeout(() => {
          setExecutionState('waiting-hitl');
          
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            
            // Build approval message with action content if available
            let approvalContent = `⏸️ **Human-in-the-Loop: Your Approval Needed**\n\n${stepToExecute.hitlMessage}`;
            
            // Add the actual action content (e.g., talk track)
            if (stepToExecute.hitlActionContent) {
              approvalContent += `\n\n---\n\n### ${stepToExecute.hitlActionContent.title}\n\n`;
              
              stepToExecute.hitlActionContent.sections.forEach(section => {
                approvalContent += `**${section.heading}**\n`;
                if (section.content) {
                  approvalContent += `${section.content}\n\n`;
                }
                if (section.bullets) {
                  section.bullets.forEach(bullet => {
                    approvalContent += `• ${bullet}\n`;
                  });
                  approvalContent += `\n`;
                }
              });
              
              approvalContent += `---\n\n`;
            }
            
            approvalContent += `\n**Tools I'll use:** ${stepToExecute.tools.join(', ')}\n**What success looks like:** ${stepToExecute.successCriteria}\n\nDo you approve saving this to your plan?`;
            
            const approvalMessage: Message = {
              id: Date.now().toString(),
              type: 'agent',
              content: approvalContent,
              timestamp: new Date(),
              stepId: stepToExecute.id,
              suggestedQuestions: ['Approve', 'Show me more details', 'What are the risks?'],
              requiresApproval: true
            };
            setMessages(prev => [...prev, approvalMessage]);
          }, 800);
        }, 1500);
      }
    }, 800);
  };

  const handleStepComplete = (stepIndex?: number) => {
    const indexToUse = stepIndex !== undefined ? stepIndex : currentStepIndex;
    const step = scenario.steps[indexToUse];
    
    if (!step) return;

    setCompletedSteps(prev => [...prev, step.id]);
    setProgress(100);

    // Shorter, more digestible success message
    const successMessage = `✅ **Done!** ${step.successCriteria}`;

    addAgentMessage(
      successMessage,
      step.id,
      ['Continue'],
      false
    );

    // Wait longer before auto-continuing to give user time to digest
    setTimeout(() => {
      const nextIndex = indexToUse + 1;
      if (nextIndex < scenario.steps.length) {
        setCurrentStepIndex(nextIndex);
        setProgress(0);
        setTimeout(() => executeCurrentStep(nextIndex), 2000); // Increased from 1500ms to 2000ms
      } else {
        // All done!
        setExecutionState('completed');
        setTimeout(() => {
          addAgentMessage(
            `🎉 **All done!**\\n\\nCompleted ${scenario.steps.length} steps successfully!\\n\\n**Impact:** ${scenario.benefits.impactMetric}\\n**Time saved:** ${scenario.benefits.timeSaved}`,
            undefined,
            ['Show summary', 'Try another scenario'],
            false
          );
        }, 1500); // Increased from 1000ms to 1500ms
      }
    }, 3000); // Increased from 2000ms to 3000ms to give more time between steps
  };

  const handleApprove = () => {
    setExecutionState('running');
    addUserMessage('✅ Approved - proceed with this action');
    
    setTimeout(() => {
      addAgentMessage(
        `Thank you! Executing now...`,
        currentStep?.id
      );
      setTimeout(() => handleStepComplete(currentStepIndex), 2000);
    }, 800);
  };

  const handleSendMessage = (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    addUserMessage(text);
    setInputValue('');

    // Handle different user intents
    setTimeout(() => {
      if (executionState === 'ready' && (text.toLowerCase().includes('yes') || text.toLowerCase().includes('start'))) {
        handleStart();
      } else if (text === 'Approve') {
        handleApprove();
      } else if (text === 'Continue to next step') {
        // Do nothing, auto-continues
        addAgentMessage('Perfect! Continuing...', undefined, []);
      } else if (text.includes('What will you do')) {
        addAgentMessage(
          `Here's what I'll do:\n\n${scenario.steps.map((s, i) => `**${i + 1}. ${s.title}**\n${s.description}\nUsing: ${s.tools.join(', ')}\n`).join('\n')}`,
          undefined,
          ['Sounds good, start!', 'How long will this take?']
        );
      } else if (text.includes('How long')) {
        addAgentMessage(
          `This will take approximately **${scenario.estimatedTime}** to complete.\n\nI'll handle ${scenario.steps.length} steps automatically, with ${scenario.steps.filter(s => s.requiresHITL).length} requiring your approval.\n\nReady to begin?`,
          undefined,
          ['Yes, start!']
        );
      } else if (text.includes('How did you determine') || text.includes('What data did you use')) {
        addAgentMessage(
          `Great question! Let me show you the reasoning artifacts...`,
          currentStep?.id,
          ['Thanks!', 'Continue']
        );
      } else if (text.includes('Show me more details') || text.includes('What are the risks')) {
        addAgentMessage(
          `**Detailed breakdown:**\n\n${currentStep?.hitlMessage}\n\n**Risk assessment:**\n- This action is reversible\n- No financial risk beyond planned discount\n- Customer satisfaction risk if not executed well\n\n**My confidence:** 92%\n\nShall I proceed?`,
          currentStep?.id,
          ['Approve', 'Not now']
        );
      } else if (text === 'Show summary') {
        setExecutionState('completed');
      } else if (text === 'Try another scenario') {
        onReset();
      } else if (text.toLowerCase().includes('why') || text.toLowerCase().includes('explain')) {
        addAgentMessage(
          `I'd love to explain! ${currentStep ? `For "${currentStep.title}", I'm using ${currentStep.tools.join(' and ')} to ${currentStep.description.toLowerCase()}. This helps ensure ${currentStep.successCriteria.toLowerCase()}.` : 'I work through structured steps using real business data and tools, applying business rules to make recommendations. Feel free to ask about any specific step!'}`,
          undefined,
          ['Got it', 'Show me the data']
        );
      } else if (text.toLowerCase().includes('pause') || text.toLowerCase().includes('stop')) {
        addAgentMessage(
          `⏸️ No problem! I've paused. You can ask me questions or say "continue" when you're ready.`,
          undefined,
          ['Continue', 'Explain current step', 'Start over']
        );
      } else if (text.toLowerCase().includes('help')) {
        addAgentMessage(
          `I'm here to help! Here's what you can do:\n\n**During execution:**\n- Ask "why" or "how" questions\n- Request "show me the data"\n- Say "pause" to stop and ask questions\n- Ask "what are the risks" before approving\n\n**Anytime:**\n- "explain [step]" - Learn about any step\n- "show summary" - See overall impact\n- "try another scenario" - Switch scenarios`,
          undefined,
          ['Continue']
        );
      } else {
        // Generic helpful response
        addAgentMessage(
          `I'm here to help! ${executionState === 'ready' ? 'Say "start" to begin the workflow, or ask "what will you do" to see my plan.' : executionState === 'completed' ? 'We\'re all done! Say "show summary" to review results, or "try another scenario" to continue learning.' : 'I\'m working on the analysis. Feel free to ask "why", "how", or "explain" questions about what I\'m doing!'}`,
          undefined,
          executionState === 'ready' ? ['Start', 'What will you do?'] : executionState === 'completed' ? ['Show summary', 'Try another scenario'] : ['Explain current step', 'Show me the data']
        );
      }
    }, 1000);
  };

  const totalDuration = scenario.steps.reduce((sum, step) => sum + step.duration, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onReset} className="mb-4">
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
              <p className="text-gray-600 text-lg">{scenario.description}</p>
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

      {/* Main Chat Area */}
      <div className="grid grid-cols-12 gap-6">
        {/* Chat Panel */}
        <div className={showPlanPanel ? 'col-span-7' : 'col-span-12'}>
          <Card className="border-2 border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#E41E2B] to-[#DC0008] text-white">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Chat with AI Agent
                </span>
                {currentStep && executionState === 'running' && (
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    Step {currentStepIndex + 1}/{scenario.steps.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Messages Area */}
              <div className="h-[600px] overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.map((message, messageIndex) => {
                  // Check if this is the current step being executed
                  const isCurrentStepMessage = message.stepId === currentStep?.id && 
                    message.content.includes('Working on this now') && 
                    executionState === 'running';

                  return (
                    <div key={message.id}>
                      <div className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === 'agent' ? 'bg-[#F40009]' : 'bg-blue-600'
                        }`}>
                          {message.type === 'agent' ? (
                            <Bot className="h-5 w-5 text-white" />
                          ) : (
                            <User className="h-5 w-5 text-white" />
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'items-end' : ''}`}>
                          <div className={`rounded-lg p-4 ${
                            message.type === 'agent' 
                              ? 'bg-white border-2 border-gray-200' 
                              : 'bg-blue-600 text-white'
                          }`}>
                            <div className="prose prose-sm max-w-none">
                              {message.content.split('\\n').map((line, i) => {
                                // Check if this is the start of action content
                                if (line.startsWith('---')) {
                                  return null; // Skip separator lines
                                }
                                
                                // Bold headers (surrounded by **)
                                if (line.match(/^\*\*.*\*\*$/)) {
                                  const text = line.replace(/^\*\*|\*\*$/g, '');
                                  return <div key={i} className="font-bold text-base mt-3 mb-2">{text}</div>;
                                }
                                
                                // Headers with ###
                                if (line.startsWith('###')) {
                                  const text = line.replace(/^###\s*/, '');
                                  return <div key={i} className="font-bold text-lg mt-4 mb-2 text-[#F40009]">{text}</div>;
                                }
                                
                                // Bullet points
                                if (line.startsWith('•')) {
                                  const text = line.substring(1).trim();
                                  // Check if line contains ** for inline bold
                                  const parts = text.split(/(\*\*.*?\*\*)/);
                                  return (
                                    <div key={i} className="ml-4 mb-1 flex items-start gap-2">
                                      <span className="text-[#F40009] mt-1">•</span>
                                      <span>
                                        {parts.map((part, pi) => {
                                          if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={pi}>{part.slice(2, -2)}</strong>;
                                          }
                                          return <span key={pi}>{part}</span>;
                                        })}
                                      </span>
                                    </div>
                                  );
                                }
                                
                                // Regular lines with inline bold
                                if (line.includes('**')) {
                                  const parts = line.split(/(\*\*.*?\*\*)/);
                                  return (
                                    <div key={i} className="mb-1">
                                      {parts.map((part, pi) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                          return <strong key={pi}>{part.slice(2, -2)}</strong>;
                                        }
                                        return <span key={pi}>{part}</span>;
                                      })}
                                    </div>
                                  );
                                }
                                
                                // Empty lines
                                if (!line.trim()) {
                                  return <div key={i} className="h-2" />;
                                }
                                
                                // Regular text
                                return <div key={i} className="mb-1">{line}</div>;
                              })}
                            </div>

                            {/* Progress Bar for Currently Running Step */}
                            {isCurrentStepMessage && !currentStep?.requiresHITL && (
                              <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                  <span className="font-medium">Processing...</span>
                                  <span>{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>Estimated: ~{currentStep?.duration}s</span>
                                </div>
                              </div>
                            )}

                            {/* Show Reasoning Button */}
                            {message.showReasoning && message.stepId && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const step = scenario.steps.find(s => s.id === message.stepId);
                                    if (step) {
                                      // Scroll to show reasoning
                                      document.getElementById(`reasoning-${message.stepId}`)?.scrollIntoView({ behavior: 'smooth' });
                                    }
                                  }}
                                  className="text-xs"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Reasoning Artifacts
                                </Button>
                              </div>
                            )}

                            {/* Approval Buttons */}
                            {message.requiresApproval && !message.approved && (
                              <div className="mt-4 flex gap-2">
                                <Button
                                  onClick={handleApprove}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                  size="sm"
                                >
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleSendMessage('Show me more details')}
                                  variant="outline"
                                  size="sm"
                                >
                                  <HelpCircle className="h-4 w-4 mr-1" />
                                  Details
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Suggested Questions */}
                          {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.suggestedQuestions.map((q, i) => (
                                <Button
                                  key={i}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSendMessage(q)}
                                  className="text-xs bg-white hover:bg-gray-50"
                                >
                                  {q}
                                </Button>
                              ))}
                            </div>
                          )}

                          {/* Timestamp */}
                          <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      {/* Reasoning Artifacts */}
                      {message.stepId && message.showReasoning && completedSteps.includes(message.stepId) && scenario.id === 'commercial-1' && (
                        <div id={`reasoning-${message.stepId}`} className="ml-14 mt-3">
                          <ReasoningArtifacts
                            step={scenario.steps.find(s => s.id === message.stepId)!}
                            stepNumber={scenario.steps.findIndex(s => s.id === message.stepId) + 1}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#F40009] flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Show Post-Action Reflection */}
                {executionState === 'completed' && completedSteps.length === scenario.steps.length && (
                  <div className="mt-6">
                    <PostActionReflection
                      scenario={scenario}
                      completedSteps={completedSteps}
                      onClose={() => {}}
                      onNewScenario={onReset}
                    />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t bg-white p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything or say 'start' to begin..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    className="bg-[#F40009] hover:bg-[#DC0008]"
                    disabled={!inputValue.trim() || isTyping}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  Ask questions anytime during execution
                </div>
              </div>
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