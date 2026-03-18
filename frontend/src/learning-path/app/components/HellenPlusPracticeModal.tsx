import { useState, useRef, useEffect } from 'react';
import { X, Send, User, Brain } from 'lucide-react';
import hellenLogoTransparent from '@learning-path/assets/hellen-logo-transparent-background.png';
import ReactMarkdown from 'react-markdown';
import { API_BASE } from '@shared/config/api';

interface HellenPlusPracticeModalProps {
    isOpen: boolean;
    onClose: () => void;
    moduleName: string;
    submoduleNames: string[];
}

interface PracticeMessage {
    text: string;
    sender: 'bot' | 'user';
    isLoading?: boolean;
    isStreaming?: boolean;
}

interface HistoryEntry {
    role: 'user' | 'assistant';
    content: string;
}

export function HellenPlusPracticeModal({
    isOpen,
    onClose,
    moduleName,
    submoduleNames,
}: HellenPlusPracticeModalProps) {
    const [messages, setMessages] = useState<PracticeMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [exchangeCount, setExchangeCount] = useState(0);
    const sessionHistoryRef = useRef<HistoryEntry[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset and auto-start whenever the modal opens
    useEffect(() => {
        if (isOpen && moduleName) {
            setMessages([]);
            setInput('');
            setIsTyping(false);
            setExchangeCount(0);
            sessionHistoryRef.current = [];
            // Small delay so state resets flush before the first fetch
            setTimeout(() => streamPractice(null), 150);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, moduleName]);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Re-focus input after each bot response
    useEffect(() => {
        if (!isTyping && messages.length > 0) {
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [isTyping]);

    const streamPractice = async (userResponse: string | null) => {
        if (isTyping) return;
        setIsTyping(true);

        if (userResponse !== null) {
            setMessages(prev => [...prev, { text: userResponse, sender: 'user' }]);
        }

        // Add loading placeholder for bot reply
        setMessages(prev => [
            ...prev,
            { text: '', sender: 'bot', isLoading: true, isStreaming: true },
        ]);

        let accumulatedText = '';

        try {
            const response = await fetch(`${API_BASE}/hellen-practice-stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    module_name: moduleName,
                    submodule_names: submoduleNames,
                    user_response: userResponse,
                    history: sessionHistoryRef.current.slice(-20),
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error(`HTTP ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            // Switch loading → streaming on first chunk
            setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.isLoading) {
                    updated[updated.length - 1] = { ...last, isLoading: false, isStreaming: true };
                }
                return updated;
            });

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const payload = line.slice(6).trim();
                    if (!payload) continue;

                    try {
                        const event = JSON.parse(payload);

                        if (event.type === 'token') {
                            accumulatedText += event.content;
                            const snapshot = accumulatedText;
                            setMessages(prev => {
                                const updated = [...prev];
                                const last = updated[updated.length - 1];
                                if (last?.sender === 'bot') {
                                    updated[updated.length - 1] = {
                                        ...last,
                                        text: snapshot,
                                        isLoading: false,
                                    };
                                }
                                return updated;
                            });
                        } else if (event.type === 'done') {
                            setMessages(prev => {
                                const updated = [...prev];
                                const last = updated[updated.length - 1];
                                if (last?.sender === 'bot') {
                                    updated[updated.length - 1] = {
                                        ...last,
                                        text: accumulatedText,
                                        isStreaming: false,
                                        isLoading: false,
                                    };
                                }
                                return updated;
                            });
                        } else if (event.type === 'error') {
                            accumulatedText = `Sorry, an error occurred: ${event.detail}`;
                            setMessages(prev => {
                                const updated = [...prev];
                                const last = updated[updated.length - 1];
                                if (last?.sender === 'bot') {
                                    updated[updated.length - 1] = {
                                        ...last,
                                        text: accumulatedText,
                                        isStreaming: false,
                                        isLoading: false,
                                    };
                                }
                                return updated;
                            });
                        }
                    } catch {
                        /* ignore malformed SSE lines */
                    }
                }
            }
        } catch (error) {
            console.error('Practice stream error:', error);
            const errText = 'Sorry, I encountered an error. Please try again.';
            setMessages(prev => {
                const cleaned = prev.filter(m => !m.isLoading);
                return [...cleaned, { text: errText, sender: 'bot' as const }];
            });
        } finally {
            setIsTyping(false);
            if (accumulatedText) {
                if (userResponse !== null) {
                    sessionHistoryRef.current.push({ role: 'user', content: userResponse });
                    setExchangeCount(prev => prev + 1);
                }
                sessionHistoryRef.current.push({
                    role: 'assistant',
                    content: accumulatedText,
                });
            }
        }
    };

    const handleSubmit = () => {
        const msg = input.trim();
        if (!msg || isTyping) return;
        setInput('');
        streamPractice(msg);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[700px] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-[#6D28D9] to-[#4F46E5] text-white p-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center p-1">
                            <img src={hellenLogoTransparent} alt="Hellen+" className="h-full" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                Hellen+
                                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-normal">
                                    Practice Mode
                                </span>
                            </h3>
                            <p className="text-xs text-white/80 truncate max-w-[260px]">{moduleName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-all"
                        title="Close practice session"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sub-header */}
                <div className="flex-shrink-0 px-4 py-2 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-purple-700 flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5" />
                        Guided Practice
                    </span>
                    <span className="text-xs text-purple-500">
                        {exchangeCount === 0
                            ? 'Starting session…'
                            : `${exchangeCount} exchange${exchangeCount !== 1 ? 's' : ''} • Session active`}
                    </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            {/* Avatar */}
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    message.sender === 'bot' ? '' : 'bg-gray-300'
                                }`}
                            >
                                {message.sender === 'bot' ? (
                                    <img
                                        src={hellenLogoTransparent}
                                        alt="Hellen+"
                                        className="w-8 h-8 object-contain"
                                    />
                                ) : (
                                    <User className="w-4 h-4 text-gray-600" />
                                )}
                            </div>

                            {/* Bubble */}
                            <div className="max-w-[78%]">
                                <div
                                    className={`rounded-2xl px-4 py-2.5 ${
                                        message.sender === 'bot'
                                            ? 'bg-white text-gray-800 shadow-sm'
                                            : 'bg-[#6D28D9] text-white'
                                    }`}
                                >
                                    {message.isLoading ? (
                                        <div className="flex items-center gap-1.5 py-1">
                                            <div
                                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                style={{ animationDelay: '0ms' }}
                                            />
                                            <div
                                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                style={{ animationDelay: '150ms' }}
                                            />
                                            <div
                                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                style={{ animationDelay: '300ms' }}
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-sm leading-relaxed prose prose-sm max-w-none">
                                            <ReactMarkdown>{message.text}</ReactMarkdown>
                                            {message.isStreaming && (
                                                <span className="inline-block w-0.5 h-4 bg-gray-500 ml-0.5 animate-pulse" />
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                    <div className="flex gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            placeholder="Type your answer..."
                            disabled={isTyping}
                            className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-purple-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm transition-colors"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!input.trim() || isTyping}
                            className="w-11 h-11 bg-gradient-to-r from-[#6D28D9] to-[#4F46E5] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex-shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                        Session continues until you close • Hellen+ adapts to your understanding
                    </p>
                </div>
            </div>
        </div>
    );
}
