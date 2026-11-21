import { useEffect, useState, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/api';
import type { Conversation, Message } from '../types';

export function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations on mount
  const loadConversations = async () => {
    try {
      const response = await chatService.getConversations();
      setConversations(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load conversations', err);
      setError('Failed to load conversations.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeId === null) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const response = await chatService.getConversation(activeId);
        setMessages(response.data.messages || []);
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    };

    loadMessages();
  }, [activeId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Create new conversation
  const handleNewChat = async () => {
    try {
      const response = await chatService.createConversation();
      const newConv = response.data;
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(newConv.id);
      setMessages([]);
    } catch (err) {
      console.error('Failed to create conversation', err);
      setError('Failed to create conversation.');
    }
  };

  // Delete conversation
  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the conversation when clicking delete
    if (!confirm('Delete this conversation?')) return;

    try {
      await chatService.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete conversation', err);
      setError('Failed to delete conversation.');
    }
  };

  // Send message
  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || activeId === null || sending) return;

    const content = input.trim();
    setInput('');
    setSending(true);
    setError('');

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: Date.now(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await chatService.sendMessage(activeId, content);
      const assistantMessage: Message = response.data;
      setMessages((prev) => [...prev, assistantMessage]);
      loadConversations(); // Refresh titles
    } catch (err) {
      console.error('Failed to send message', err);
      setError('Failed to get AI response. Make sure Ollama is running.');
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold text-white mb-3">AIChat</h1>
          <button
            onClick={handleNewChat}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors text-sm"
          >
            + New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <p className="text-slate-500 text-sm p-2">No conversations yet.</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center justify-between px-3 py-2 rounded mb-1 text-sm transition-colors cursor-pointer ${
                  activeId === conv.id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
                onClick={() => setActiveId(conv.id)}
              >
                <span className="truncate flex-1">{conv.title}</span>
                <button
                  onClick={(e) => handleDelete(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 ml-2 text-xs transition-opacity"
                  title="Delete conversation"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-2 truncate">
            {user?.fullName}
          </p>
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:underline"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col">
        {activeId === null ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-400 mb-4">
                Select a conversation or start a new one.
              </p>
              <button
                onClick={handleNewChat}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                + New Chat
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && !sending && (
                <p className="text-center text-slate-500 text-sm">
                  Send a message to start the conversation.
                </p>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-2xl px-4 py-2 rounded-lg whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-100 border border-slate-700'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-400 border border-slate-700 px-4 py-2 rounded-lg">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Error banner */}
            {error && (
              <div className="bg-red-900/50 text-red-300 px-6 py-2 text-sm border-t border-red-800">
                {error}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="p-4 border-t border-slate-700 bg-slate-800"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}