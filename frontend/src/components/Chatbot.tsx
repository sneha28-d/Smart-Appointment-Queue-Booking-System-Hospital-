import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { aiService, type ChatResponse } from '../services/aiService';
import { doctorService } from '../services/doctorService';
import type { Doctor } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  analytics?: ChatResponse['analytics'];
}

const Chatbot: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { doctorId: paramDoctorId } = useParams<{ doctorId: string }>();
  
  const [isOpen, setIsOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am your DocQueue Assistant. Ask me about waiting times, peak hours, or suggest low-rush slots to plan your visit.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch doctors list for the selection dropdown
  useEffect(() => {
    if (isAuthenticated) {
      doctorService.getDoctors()
        .then((data) => setDoctors(data))
        .catch((err) => console.error('Failed to load doctors in chatbot:', err));
    }
  }, [isAuthenticated]);

  // 2. Automatically sync doctor context based on routing params (e.g. /booking/:doctorId)
  useEffect(() => {
    if (paramDoctorId) {
      setSelectedDoctorId(paramDoctorId);
    }
  }, [paramDoctorId]);

  // 3. Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // If user is not authenticated, do not show the chatbot
  if (!isAuthenticated) return null;

  // Predefined suggestion chips
  const suggestions = [
    'How long is the waiting today?',
    'When is it less crowded?',
    'Suggest a low-rush slot to visit',
    'What are the peak hours?'
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage(textToSend, selectedDoctorId || undefined);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.reply,
        timestamp: new Date(),
        analytics: response.analytics
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Sorry, I encountered an issue pulling wait time data. Please try again in a bit.',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(message);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* ─── Chat Window ─── */}
      {isOpen && (
        <div className="w-[380px] max-w-[calc(100vw-2rem)] h-[550px] max-h-[calc(100vh-8rem)] bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-2xl flex flex-col mb-4 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-8">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">QueueSync AI</h3>
                <span className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block"></span>
                  Live Queue Assistant
                </span>
              </div>
            </div>
            
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-100 p-1.5 rounded-lg hover:bg-white/10 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Context Selector */}
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 font-semibold shrink-0">Consulting for:</span>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 py-1 px-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[220px] truncate"
            >
              <option value="">General Clinic/Hospital</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.name} ({doc.speciality})
                </option>
              ))}
            </select>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                </div>
                
                {/* Meta Timestamp */}
                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {/* Render live analytics metrics dashboard inside chat when provided */}
                {msg.sender === 'bot' && msg.analytics && (
                  <div className="mt-2 bg-gradient-to-br from-slate-50 to-indigo-50 border border-indigo-100/50 rounded-xl p-3 w-[92%] shadow-inner text-xs space-y-2 animate-in fade-in duration-300">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-bold border-b border-indigo-100/40 pb-1.5 mb-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                      </svg>
                      Live Queue Insights: {msg.analytics.doctorName}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-white/80 p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block font-medium">Avg Waiting Time</span>
                        <span className="font-bold text-blue-600 text-sm mt-0.5 block">{msg.analytics.avgWaitTime}</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block font-medium">Waiting Queue</span>
                        <span className="font-bold text-indigo-600 text-sm mt-0.5 block">{msg.analytics.todayWaitingPatientsCount} patient(s)</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg border border-slate-100 col-span-2">
                        <span className="text-slate-400 block font-medium">✨ Suggested Low-Rush Hour</span>
                        <span className="font-bold text-emerald-600 mt-0.5 block">
                          {msg.analytics.lowRushHours.join(', ') || 'No data'}
                        </span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block font-medium">Peak Rush Hours</span>
                        <span className="font-bold text-amber-600 mt-0.5 block">
                          {msg.analytics.peakHours.join(', ') || 'No data'}
                        </span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block font-medium">Best Day to Visit</span>
                        <span className="font-bold text-indigo-600 mt-0.5 block">
                          {msg.analytics.lessBusyDays.slice(0, 1).join('') || 'No data'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="bg-white text-slate-800 border border-slate-100 px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-700 text-[10.5px] px-2.5 py-1.5 rounded-full transition shrink-0 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Footer Input Form */}
          <form 
            onSubmit={handleFormSubmit}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask when to visit..."
              disabled={isLoading}
              className="flex-1 bg-slate-50 text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white p-2 rounded-xl transition shadow-md shadow-blue-500/10 cursor-pointer disabled:shadow-none shrink-0"
            >
              <svg className="w-4 h-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>

        </div>
      )}

      {/* ─── Floating Toggle Button ─── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-500/35 hover:scale-105 transition-all duration-300 cursor-pointer"
      >
        {isOpen ? (
          <svg className="w-6 h-6 animate-in spin-in-90 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 animate-in zoom-in-50 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default Chatbot;
