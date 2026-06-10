import React, { useState, useEffect, useRef } from 'react';
import { useSocketStore } from '../stores/socketStore';
import { Send, Terminal, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatWindow({ showHistory = false }) {
  const { user, messages, sendMessage: storeSendMessage, deleteMessage, clearAllMessages, sendTypingStart, sendTypingStop, typingUsers } = useSocketStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const displayMessages = showHistory ? messages : messages.filter(m => !m.isHistory);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const threshold = 150;
    const position = container.scrollHeight - container.scrollTop - container.clientHeight;
    setIsNearBottom(position < threshold);
  };

  useEffect(() => {
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayMessages, isNearBottom]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    storeSendMessage(input, 'text');
    setInput('');
    sendTypingStop();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    sendTypingStart();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop();
    }, 2000);
  };

  return (
    <div className="flex flex-col overflow-hidden relative font-mono h-full w-full">
      
      {/* Admin Controls */}
      {user?.role === 'admin' && (
        <div className="absolute top-2 right-4 z-20">
          <button 
            onClick={() => {
              if (window.confirm("CRITICAL WARNING: Are you sure you want to permanently delete ALL chat history?")) {
                clearAllMessages();
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/80 border border-noir-error/50 text-noir-error text-[10px] font-bold tracking-widest uppercase hover:bg-noir-error/20 transition-colors rounded shadow-[0_0_10px_rgba(255,0,60,0.2)] backdrop-blur-md"
          >
            <Trash2 size={12} />
            CLEAR LOGS
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 pt-12 space-y-4 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {displayMessages.map((msg, idx) => {
            const isSystem = msg.type === 'system' || msg.type === 'alert';
            const isStatus = isSystem && msg.content.includes('STATUS UPDATE');
            const isMe = msg.isMe || msg.senderName === user?.username;
            
            // Format time
            const timeStr = new Date(msg.createdAt || msg._id || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit', hour12: false});

            if (isSystem) {
              return (
                <motion.div 
                  key={msg._id || idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-center my-4"
                >
                  <div className={`px-4 py-2 text-[10px] font-bold tracking-widest border rounded-full uppercase flex items-center gap-2 ${
                    isStatus 
                      ? 'border-noir-success bg-noir-success/10 text-noir-success shadow-[0_0_8px_rgba(0,255,102,0.3)]' 
                      : 'border-noir-error bg-noir-error/10 text-noir-error shadow-[0_0_15px_rgba(255,0,60,0.4)] animate-pulse'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div 
                key={msg._id || idx}
                initial={{ opacity: 0, x: isMe ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-baseline gap-2 mb-1 px-1">
                  <span className="text-[10px] font-bold text-noir-muted">
                    [{timeStr}]
                  </span>
                  <span className={`text-[10px] font-bold uppercase ${isMe ? 'text-noir-accent' : 'text-white'}`}>
                    {isMe ? 'ME' : msg.senderName}
                  </span>
                </div>
                
                <div className={`relative group/msg px-4 py-2 border backdrop-blur-sm max-w-[85%] text-xs tracking-wider break-words rounded-2xl ${
                  isMe 
                    ? 'border-noir-accent/50 bg-noir-accent/10 text-noir-accent shadow-[0_5px_15px_rgba(59,130,246,0.15)] rounded-br-sm' 
                    : 'border-white/10 bg-white/5 text-white shadow-[0_5px_15px_rgba(0,0,0,0.2)] rounded-bl-sm'
                }`}>
                  {msg.content}
                  
                  {user?.role === 'admin' && msg._id && !isSystem && (
                    <button 
                      onClick={() => deleteMessage(msg._id)}
                      className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 transition-opacity p-1.5 bg-black/90 border border-noir-error/50 text-noir-error rounded hover:bg-noir-error/20 hover:scale-110 shadow-lg ${isMe ? '-left-10' : '-right-10'}`}
                      title="Delete Message"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="absolute bottom-[65px] left-4 z-10 text-[10px] text-noir-accent animate-pulse tracking-widest font-bold bg-black/50 px-2 py-1 border border-noir-accent/30 rounded backdrop-blur-sm">
          ⚡ {typingUsers.join(', ')} {typingUsers.length > 1 ? 'ARE' : 'IS'} TRANSMITTING...
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-black/40 border-t border-noir-border backdrop-blur-md relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-noir-accent/30 to-transparent"></div>
        <div className="relative flex items-center group">
          <div className="absolute left-3 text-noir-accent/50 group-focus-within:text-noir-accent group-focus-within:drop-shadow-[0_0_5px_rgba(59,130,246,0.8)] transition-all pointer-events-none">
            <Terminal size={14} />
          </div>
          <input
            className="w-full bg-black/50 border border-white/10 rounded-none pl-9 pr-12 py-3 focus:outline-none focus:border-noir-accent/50 focus:ring-1 focus:ring-noir-accent/30 focus:bg-noir-accent/5 text-xs text-white placeholder-white/20 transition-all duration-300 font-mono tracking-widest uppercase shadow-inner"
            placeholder="ENTER COMMAND OR MESSAGE..."
            value={input}
            maxLength={300}
            onChange={handleTyping}
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="absolute right-2 px-3 py-1.5 bg-black text-noir-accent border border-noir-accent/30 hover:bg-noir-accent/20 hover:text-white hover:border-noir-accent hover:shadow-[inset_2px_0_0_0_#3b82f6,0_0_15px_rgba(59,130,246,0.4)] disabled:opacity-30 disabled:hover:bg-black disabled:hover:text-noir-accent disabled:hover:shadow-none disabled:hover:border-noir-accent/30 transition-all duration-300 flex items-center justify-center overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-noir-accent to-transparent opacity-0 group-hover:opacity-100"></div>
            <Send size={14} className="hover:translate-x-0.5 hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
