import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, X, Send, Sparkles, BookOpen, AlertCircle, Minimize2, Maximize2 } from 'lucide-react';
import assistantQA from '../../data/assistantQA.json';
import { api, USE_MOCKS } from '../../api/client';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citation?: string;
  timestamp: string;
}

export const AICourseAssistant: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text:
        i18n.language === 'hi'
          ? 'नमस्ते! मैं आईएमडी एआई पाठ्यक्रम सहायक हूं। मैं आधिकारिक आईएमडी मौसम विज्ञान नियमावली और वीडियो व्याख्यानों से सीधे आपके तकनीकी प्रश्नों का उत्तर देता हूं। आप रडार, चक्रवात, एडब्ल्यूएस या मौसम मॉडल के बारे में पूछ सकते हैं।'
          : 'Namaste! I am the IMD AI Course Assistant. I answer strictly from official IMD meteorological training manuals and video lectures, citing exact document pages and timestamps. Ask me about Doppler radar, cyclone tracking, AWS calibration, or NWP models.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Backend API with local fallback
    if (!USE_MOCKS) {
      api.aiAssistant
        .chat(query)
        .then((res) => {
          const citationText = res.citations && res.citations.length > 0 ? res.citations[0].source : undefined;
          const assistantMsg: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            sender: 'assistant',
            text: res.answer,
            citation: citationText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        })
        .catch(() => {
          // Fallback to local QA
          fallbackLocalAnswer(query);
        });
    } else {
      setTimeout(() => {
        fallbackLocalAnswer(query);
      }, 450);
    }
  };

  const fallbackLocalAnswer = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const isHindiQuery = /[\u0900-\u097F]/.test(query) || i18n.language === 'hi';

    const matchedQA = assistantQA.find((item) =>
      item.keywords.some((kw) => lowerQuery.includes(kw.toLowerCase()))
    );

    let responseText = '';
    let citationText: string | undefined = undefined;

    if (matchedQA) {
      responseText = isHindiQuery && matchedQA.answerHi ? matchedQA.answerHi : matchedQA.answer;
      citationText = matchedQA.citation;
    } else {
      responseText =
        isHindiQuery
          ? 'यह प्रश्न स्वीकृत आईएमडी प्रशिक्षण सामग्री में शामिल नहीं है। सुरक्षा और सटीकता के लिए, मैं केवल प्रमाणित आईएमडी दस्तावेजों से उत्तर देता हूं। कृपया अपने क्षेत्रीय प्रशिक्षण अधिकारी या आधिकारिक आईएमडी एसओपी से संपर्क करें।'
          : 'This query is not covered in the approved IMD operational training materials. To ensure scientific fidelity, I only answer from verified course manuals. Please refer to your divisional SOP or contact the training directorate.';
    }

    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'assistant',
      text: responseText,
      citation: citationText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, assistantMsg]);
  };

  const sampleQuestions = [
    { en: 'What is Rayleigh scattering in Doppler radar?', hi: 'डॉपलर रडार में रेले प्रकीर्णन क्या है?' },
    { en: 'Explain Dvorak T-number and embedded center', hi: 'ड्वोरक टी-संख्या और एम्बेडेड सेंटर समझाएं' },
    { en: 'What is the Pt100 RTD sensor in AWS?', hi: 'AWS में Pt100 RTD तापमान सेंसर क्या है?' },
    { en: 'Minimum wind speed for Cyclonic Storm?', hi: 'चक्रवाती तूफान के लिए न्यूनतम हवा की गति क्या है?' }
  ];

  return (
    <aside aria-label="AI Course Assistant" className="fixed bottom-5 right-5 z-50 no-print">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center space-x-2.5 bg-gradient-to-r from-[#002D62] to-sky-700 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-sky-500/25 hover:scale-105 transition-all border border-sky-400/40"
          title="Open IMD AI Course Assistant"
        >
          <div className="relative">
            <Bot size={22} className="text-amber-300" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-xs font-bold tracking-wide">
            {i18n.language === 'hi' ? 'आईएमडी एआई सहायक' : 'IMD Course AI'}
          </span>
          <Sparkles size={14} className="text-amber-400 animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-200 ${
            isMinimized ? 'w-80 h-14' : 'w-88 sm:w-[410px] h-[550px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#002D62] via-slate-900 to-sky-900 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-amber-300">
                <Bot size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold flex items-center gap-1.5">
                  <span>{t('assistant.title')}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                    IMD Verified
                  </span>
                </h4>
                <p className="text-[10px] text-slate-300 line-clamp-1">
                  {i18n.language === 'hi' ? 'केवल आधिकारिक सामग्री से उत्तर' : 'Cites approved manuals & lecture timestamps'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-slate-300">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:text-white hover:bg-white/10 rounded"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-white hover:bg-white/10 rounded"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#002D62] text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* Source Citation Box */}
                      {msg.citation && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-start space-x-1.5 text-[11px] text-sky-800 bg-sky-50/80 p-2 rounded-lg">
                          <BookOpen size={14} className="text-sky-700 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[10px] uppercase tracking-wider block text-sky-900">
                              {t('assistant.sourceCitation')}:
                            </span>
                            <span className="font-medium text-slate-700">{msg.citation}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Sample Questions Pills */}
              <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200 overflow-x-auto flex space-x-1.5 text-[11px] no-scrollbar">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(i18n.language === 'hi' ? q.hi : q.en)}
                    className="flex-shrink-0 px-2.5 py-1 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-full text-slate-700 transition-colors whitespace-nowrap"
                  >
                    💡 {i18n.language === 'hi' ? q.hi : q.en}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('assistant.placeholder')}
                  className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800 placeholder-slate-400"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="p-2.5 bg-[#002D62] text-white rounded-xl hover:bg-[#0A2540] disabled:opacity-40 transition-colors shadow-xs"
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
};
