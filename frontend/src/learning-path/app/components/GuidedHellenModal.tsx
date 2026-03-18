import { useState, useRef, useEffect } from 'react';
import { X, Send, User, Brain, Plus } from 'lucide-react';
import hellenLogoTransparent from '@learning-path/assets/hellen-logo-transparent-background.png';
import { useSound } from '@learning-path/utils/sounds';
import { API_BASE } from '@shared/config/api';

interface GuidedHellenModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateLearningPath: () => void;
}

interface Message {
    text: string;
    sender: 'bot' | 'user';
    isLoading?: boolean;
}

const TOPICS = [
    'Data Visualization',
    'Statistics & Analytics',
    'Machine Learning',
    'Data Engineering',
    'Generative & Agentic AI',
];

const INITIAL_BOT_MESSAGE = `Hi! I'm Hellen+. Let me help you figure out what you want to learn. 🎯\n\nWhat topic would you like to explore?`;

function getQ2Message(topic: string): string {
    return `Great choice! What specific area or subtopic within **${topic}** would you like to explore? (e.g., "neural networks", "SQL pipelines", "EDA")`;
}


/**
 * Step flow:
 *   0 → topic selection buttons
 *   1 → Q2: subtopic (frontend, text input)
 *   2 → Q3: AI-generated (text input)
 *   3 → Q4: AI-generated (text input)
 *   4 → Q5: AI-generated (text input)
 *   5 → final CTA message
 *
 * API receives step 3, 4, or 5 (maps to UI steps 2, 3, 4).
 */
const UI_STEP_TO_API_STEP: Record<number, number> = { 2: 3, 3: 4, 4: 5 };

export function GuidedHellenModal({ isOpen, onClose, onCreateLearningPath }: GuidedHellenModalProps) {
    const [step, setStep] = useState(0);
    const [topic, setTopic] = useState('');
    const [subtopic, setSubtopic] = useState('');
    const [collectedAnswers, setCollectedAnswers] = useState<string[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { playClick } = useSound();

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setStep(0);
            setTopic('');
            setSubtopic('');
            setCollectedAnswers([]);
            setInput('');
            setIsLoading(false);
            setMessages([{ text: INITIAL_BOT_MESSAGE, sender: 'bot' }]);
        }
    }, [isOpen]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input on text-input steps
    useEffect(() => {
        if (step >= 1 && step <= 4 && !isLoading) {
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [step, isLoading]);

    const addBotMessage = (text: string) => {
        setMessages(prev => prev.filter(m => !m.isLoading).concat({ text, sender: 'bot' }));
    };

    const addUserMessage = (text: string) => {
        setMessages(prev => [...prev, { text, sender: 'user' }]);
    };

    const showLoadingBubble = () => {
        setMessages(prev => [...prev, { text: '', sender: 'bot', isLoading: true }]);
    };

    // Fetch AI question for steps 2, 3, 4 (API receives 3, 4, 5)
    const fetchAIQuestion = async (
        currentTopic: string,
        currentSubtopic: string,
        answers: string[],
        uiStep: number   // 2, 3, or 4
    ) => {
        const apiStep = UI_STEP_TO_API_STEP[uiStep];
        setIsLoading(true);
        showLoadingBubble();
        try {
            const res = await fetch(`${API_BASE}/guided-hellen/next-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: currentTopic,
                    subtopic: currentSubtopic,
                    answers,
                    step: apiStep,
                }),
            });
            const data = await res.json();
            addBotMessage(data.message);
        } catch {
            addBotMessage('Sorry, I had trouble generating the next question. Please try again.');
        } finally {
            setIsLoading(false);
            // If this was the last AI step (apiStep 5), jump straight to CTA
            setStep(apiStep === 5 ? 5 : uiStep);
        }
    };

    const handleTopicSelect = (selectedTopic: string) => {
        playClick();
        setTopic(selectedTopic);
        addUserMessage(selectedTopic);
        setTimeout(() => {
            addBotMessage(getQ2Message(selectedTopic));
            setStep(1);
        }, 200);
    };

    const handleSubmit = () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;
        playClick();
        setInput('');

        addUserMessage(trimmed);

        if (step === 1) {
            // Q2 answered → save subtopic, fetch AI Q3 (UI step 2)
            setSubtopic(trimmed);
            const updatedAnswers = [trimmed];
            setCollectedAnswers(updatedAnswers);
            setTimeout(() => fetchAIQuestion(topic, trimmed, updatedAnswers, 2), 200);
        } else if (step === 2) {
            // Q3 answered → fetch AI Q4 (UI step 3)
            const updatedAnswers = [...collectedAnswers, trimmed];
            setCollectedAnswers(updatedAnswers);
            setTimeout(() => fetchAIQuestion(topic, subtopic, updatedAnswers, 3), 200);
        } else if (step === 3) {
            // User responded to AI step 4 → fetch AI step 5 (final teaching + recommendation)
            const updatedAnswers = [...collectedAnswers, trimmed];
            setCollectedAnswers(updatedAnswers);
            setTimeout(() => fetchAIQuestion(topic, subtopic, updatedAnswers, 4), 200);
        }
    };

    const formatText = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, li) => {
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (
                <span key={li}>
                    {parts.map((part, pi) =>
                        part.startsWith('**') && part.endsWith('**')
                            ? <strong key={pi}>{part.slice(2, -2)}</strong>
                            : <span key={pi}>{part}</span>
                    )}
                    {li < lines.length - 1 && <br />}
                </span>
            );
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[700px] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-[#6D28D9] to-[#4F46E5] text-white p-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center p-1">
                            <img src={hellenLogoTransparent} alt="Hellen+" className="h-full" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                Guided Hellen+
                                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-normal">AI Guide</span>
                            </h3>
                            <p className="text-xs text-white/80">Let me help you figure out what you want to learn.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-all"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sub-header */}
                <div className="flex-shrink-0 px-4 py-2 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-purple-700 flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5" />
                        Guided Learning
                    </span>
                    <span className="text-xs text-purple-500">
                        {step === 0 ? 'Starting…' : `Step ${Math.min(step, 5)} of 5`}
                    </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'bot' ? '' : 'bg-gray-300'}`}>
                                {message.sender === 'bot'
                                    ? <img src={hellenLogoTransparent} alt="Hellen+" className="w-8 h-8 object-contain" />
                                    : <User className="w-4 h-4 text-gray-600" />
                                }
                            </div>
                            <div className="max-w-[78%]">
                                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${message.sender === 'bot'
                                    ? 'bg-white text-gray-800 shadow-sm'
                                    : 'bg-[#6D28D9] text-white'
                                    }`}>
                                    {message.isLoading ? (
                                        <div className="flex items-center gap-1.5 py-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    ) : (
                                        formatText(message.text)
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                    {step === 0 && (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {TOPICS.map(t => (
                                <button
                                    key={t}
                                    onClick={() => handleTopicSelect(t)}
                                    className="px-3 py-2.5 bg-purple-50 border border-purple-200 text-purple-800 text-sm font-medium rounded-xl hover:bg-purple-100 hover:border-purple-400 transition-all text-left"
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    )}

                    {step >= 1 && step <= 4 && (
                        <div className="flex gap-2 items-center">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
                                }}
                                placeholder="Type your answer..."
                                disabled={isLoading}
                                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-purple-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm transition-colors"
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={!input.trim() || isLoading}
                                className="w-11 h-11 bg-gradient-to-r from-[#6D28D9] to-[#4F46E5] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex-shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {step === 5 && (
                        <button
                            onClick={() => { playClick(); onCreateLearningPath(); }}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6D28D9] to-[#4F46E5] text-white font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Create Learning Path
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
