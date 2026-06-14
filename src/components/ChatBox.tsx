"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

type Message = {
  id: number;
  content: string;
  created_at: string;
};

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages
  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (data && !error) {
        setMessages(data.reverse());
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const msg = input;
    setInput(''); // Optimistically clear

    const { error } = await supabase
      .from('messages')
      .insert([{ content: msg }]);

    if (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: 'clamp(16px, 4vw, 24px)',
          zIndex: 9999,
          background: 'var(--ink)',
          color: 'var(--paper)',
          padding: '16px 24px',
          fontFamily: 'var(--condensed)',
          fontSize: '16px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          border: '3px solid var(--ink)',
          boxShadow: '4px 4px 0 var(--saffron)',
          cursor: 'pointer',
          borderRadius: '0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <span style={{ 
          width: '12px', 
          height: '12px', 
          background: 'var(--saffron)', 
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'pulseOpacity 2s infinite'
        }}></span>
        {isOpen ? 'Close Chat' : 'Panic Chat'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '88px',
          right: 'clamp(16px, 4vw, 24px)',
          width: 'clamp(280px, calc(100vw - 32px), 360px)',
          height: '500px',
          maxHeight: 'calc(100vh - 120px)',
          background: 'var(--paper-2)',
          border: '4px solid var(--ink)',
          boxShadow: '8px 8px 0 var(--ink)',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            background: 'var(--saffron)',
            borderBottom: '4px solid var(--ink)',
            padding: '16px',
            fontFamily: 'var(--display)',
            fontSize: '24px',
            color: 'var(--ink)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>PANIC ROOM</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700 }}>LIVE</span>
          </div>

          {/* Message List */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontFamily: 'var(--sans)'
          }}>
            {messages.length === 0 ? (
              <p style={{ fontFamily: 'var(--mono)', fontSize: '12px', textAlign: 'center', color: 'var(--ink-2)', marginTop: '24px' }}>
                No messages yet. Be the first to panic.
              </p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} style={{
                  background: 'var(--paper)',
                  border: '2px solid var(--ink)',
                  padding: '12px',
                  position: 'relative'
                }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--saffron-deep)', marginBottom: '4px' }}>
                    ANON • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: 1.4, wordBreak: 'break-word' }}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} style={{
            borderTop: '4px solid var(--ink)',
            display: 'flex',
            background: 'var(--paper)'
          }}>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your panic here..."
              maxLength={200}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: 'var(--sans)',
                fontSize: '14px'
              }}
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              style={{
                background: 'var(--ink)',
                color: 'var(--paper)',
                border: 'none',
                borderLeft: '4px solid var(--ink)',
                padding: '0 16px',
                fontFamily: 'var(--condensed)',
                fontSize: '16px',
                fontWeight: 700,
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                opacity: input.trim() ? 1 : 0.5
              }}
            >
              SEND
            </button>
          </form>
        </div>
      )}
    </>
  );
}
