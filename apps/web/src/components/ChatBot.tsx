'use client';

import { useState, useRef, useEffect } from 'react';
import Button from './ui/Button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatBot({ isOpen, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load threadId from sessionStorage and fetch conversation history
  useEffect(() => {
    const savedThreadId = sessionStorage.getItem('chatbot-thread-id');

    if (savedThreadId) {
      setThreadId(savedThreadId);
      fetchConversationHistory(savedThreadId);
    }
  }, []);

  // Fetch conversation history from backend
  const fetchConversationHistory = async (tid: string) => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(
        `http://localhost:3001/chat-agent/conversations/${tid}/history`,
      );

      if (response.ok) {
        const data = await response.json();
        // Map backend messages to frontend format
        const mappedMessages: Message[] = data.messages.map(
          (msg: { role: string; content: string }) => ({
            role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
            content: msg.content,
          }),
        );
        setMessages(mappedMessages);
      }
    } catch (error) {
      console.error('Failed to fetch conversation history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Save threadId to sessionStorage when it changes
  useEffect(() => {
    if (threadId) {
      sessionStorage.setItem('chatbot-thread-id', threadId);
    }
  }, [threadId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/chat-agent/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          threadId: threadId || undefined, // Send threadId if we have one
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Store threadId for subsequent messages
      if (data.threadId) {
        setThreadId(data.threadId);
      }

      // Add assistant response to messages
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setThreadId(null);
    sessionStorage.removeItem('chatbot-thread-id');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">UbieFlags Assistant</h2>
            <p className="text-sm text-blue-100">
              Ask me anything about your feature flags
              {threadId && (
                <span className="ml-2 text-xs bg-blue-500 px-2 py-0.5 rounded">
                  💾 Conversation saved
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-sm"
              title="Start a new conversation"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {isLoadingHistory && (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-2xl mb-2">⏳</div>
              <p>Loading conversation...</p>
            </div>
          )}

          {!isLoadingHistory && messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-4xl mb-4">💬</div>
              <p className="mb-2">Hi! I&apos;m your feature flag assistant.</p>
              <p className="text-sm">Try asking me:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• &quot;What flags exist in production?&quot;</li>
                <li>• &quot;Explain the beta_access flag&quot;</li>
                <li>• &quot;Why is new_onboarding ON for user123?&quot;</li>
                <li>• &quot;Show me stale flags&quot;</li>
              </ul>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="text-sm font-semibold mb-1">
                  {msg.role === 'user' ? 'You' : '🤖 Assistant'}
                </div>
                <div className="whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%]">
                <div className="text-sm font-semibold mb-1">
                  🤖 Assistant
                </div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your feature flags..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              variant="primary"
            >
              Send
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
