
import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, Message, AIMode } from '../types';
import { streamChatResponse } from '../services/geminiService';

interface ChatInterfaceProps {
  chat: ChatSession | null;
  onSendMessage: (msg: string) => void;
  onUpdateChat: (updated: ChatSession) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chat, onUpdateChat }) => {
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat?.messages, streamingContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chat || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    const updatedChat = { 
      ...chat, 
      messages: [...chat.messages, userMsg],
      updatedAt: Date.now()
    };
    
    onUpdateChat(updatedChat);
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');

    try {
      let finalResponse = "";
      await streamChatResponse(
        chat.messages,
        input,
        chat.mode,
        (chunk) => {
          setStreamingContent(chunk);
          finalResponse = chunk;
        }
      );

      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: finalResponse,
        timestamp: Date.now()
      };

      const finalizedChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, modelMsg],
        // Auto-title if first message
        title: chat.messages.length === 0 ? input.slice(0, 30) + '...' : chat.title
      };
      
      onUpdateChat(finalizedChat);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  if (!chat) return <div className="flex-1 flex items-center justify-center text-slate-500">Select a chat to begin</div>;

  return (
    <div className="flex-1 flex flex-col h-full">
      <header className="h-16 border-b border-slate-900 flex items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400">
            <i className={`fas ${getModeIcon(chat.mode)}`}></i>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">{chat.title}</h4>
            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{chat.mode} Neural Link</span>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar pb-32">
        {chat.messages.map((msg) => (
          <div key={msg.id} className={`flex gap-6 max-w-4xl mx-auto animate-fadeIn ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             {msg.role === 'model' && <div className="w-10 h-10 rounded-2xl bg-indigo-600 shrink-0 flex items-center justify-center text-white"><i className="fas fa-brain"></i></div>}
             <div className={`p-5 rounded-3xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-[#151515] border border-slate-800 text-slate-300 rounded-tl-none'}`}>
                {msg.content}
             </div>
             {msg.role === 'user' && <div className="w-10 h-10 rounded-2xl bg-slate-800 shrink-0 flex items-center justify-center text-slate-400 font-bold">U</div>}
          </div>
        ))}
        {isStreaming && (
          <div className="flex gap-6 max-w-4xl mx-auto animate-pulse">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 shrink-0 flex items-center justify-center text-white"><i className="fas fa-circle-notch animate-spin"></i></div>
            <div className="p-5 rounded-3xl bg-[#151515] border border-slate-800 text-slate-300 rounded-tl-none text-sm leading-relaxed">
              {streamingContent || "Gemini is resonating..."}
            </div>
          </div>
        )}
      </div>

      <div className="p-8 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Quantum reason with NexusAI..."
            className="w-full bg-[#151515] border border-slate-800 rounded-2xl px-6 py-4 pr-16 text-sm text-slate-200 outline-none transition-all focus:border-indigo-500 shadow-2xl"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="absolute right-2 top-2 w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
          >
            <i className="fas fa-arrow-up"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

const getModeIcon = (mode: string) => {
  switch(mode) {
    case 'study': return 'fa-book-reader';
    case 'coding': return 'fa-code';
    case 'tutor': return 'fa-user-graduate';
    case 'research': return 'fa-microscope';
    default: return 'fa-feather';
  }
};

export default ChatInterface;
