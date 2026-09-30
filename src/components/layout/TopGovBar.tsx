import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wifi, WifiOff, RefreshCw, ZoomIn, ZoomOut, Eye } from 'lucide-react';
import { useOfflineStore } from '../../store/useOfflineStore';
import { useCourseStore } from '../../store/useCourseStore';

export const TopGovBar: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { isOffline, toggleOffline, pendingSyncs, syncAllPending } = useOfflineStore();
  const { submitTestResult } = useCourseStore();
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('capacity_connect_lang', lng);
  };

  const handleSyncNow = () => {
    syncAllPending((syncItem) => {
      // Simulate grading synced offline submission
      const totalQ = Object.keys(syncItem.answers).length || 5;
      const correctQ = Math.max(1, totalQ - 1);
      const scorePct = Math.round((correctQ / totalQ) * 100);
      submitTestResult({
        testId: syncItem.testId,
        courseId: syncItem.courseId,
        userId: syncItem.userId,
        userName: syncItem.userName,
        office: syncItem.userOffice,
        score: scorePct,
        percentage: scorePct,
        passed: scorePct >= 70,
        totalQuestions: totalQ,
        correctAnswers: correctQ
      });
    });
  };

  const adjustFontSize = (delta: number) => {
    const next = Math.max(-1, Math.min(2, fontSizeLevel + delta));
    setFontSizeLevel(next);
    const root = document.documentElement;
    if (next === -1) root.style.fontSize = '14px';
    else if (next === 0) root.style.fontSize = '16px';
    else if (next === 1) root.style.fontSize = '18px';
    else if (next === 2) root.style.fontSize = '20px';
  };

  const toggleContrast = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    if (next) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 text-xs border-b border-slate-800">
      {/* Indian Tiranga top hairline */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-3">
        {/* Ministry & Govt Info */}
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-slate-100 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {i18n.language === 'hi' ? 'भारत सरकार | पृथ्वी विज्ञान मंत्रालय' : 'Government of India | Ministry of Earth Sciences'}
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400 font-medium">
            {i18n.language === 'hi' ? 'भारत मौसम विज्ञान विभाग' : 'India Meteorological Department (IMD)'}
          </span>
        </div>

        {/* Accessibility & Utilities */}
        <div className="flex items-center space-x-4">
          {/* Offline Mode Toggle Simulator */}
          <div className="flex items-center bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
            <button
              onClick={toggleOffline}
              aria-label="Toggle network simulation"
              className={`flex items-center gap-1.5 font-medium transition-colors ${
                isOffline ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'
              }`}
              title="Click to simulate offline / online connection state"
            >
              {isOffline ? <WifiOff size={13} /> : <Wifi size={13} />}
              <span>{isOffline ? t('nav.offline') : t('nav.online')}</span>
            </button>

            {pendingSyncs.length > 0 && (
              <button
                onClick={handleSyncNow}
                disabled={isOffline}
                className="ml-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] disabled:opacity-40"
                title="Sync offline queue now"
              >
                <RefreshCw size={11} className={!isOffline ? 'animate-spin' : ''} />
                <span>{pendingSyncs.length} {t('nav.pendingSync')}</span>
              </button>
            )}
          </div>

          {/* Contrast Mode */}
          <button
            onClick={toggleContrast}
            aria-label="High contrast mode"
            title="Toggle High Contrast"
            className="flex items-center gap-1 text-slate-300 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800"
          >
            <Eye size={12} />
            <span className="hidden sm:inline">Contrast</span>
          </button>

          {/* Font Resizing */}
          <div className="flex items-center space-x-1 bg-slate-800 px-1.5 py-0.5 rounded">
            <button
              onClick={() => adjustFontSize(-1)}
              aria-label="Decrease font size"
              title="Decrease font size (A-)"
              className="px-1 text-slate-300 hover:text-white font-bold"
            >
              A-
            </button>
            <button
              onClick={() => adjustFontSize(0)}
              aria-label="Normal font size"
              title="Normal font size (A)"
              className="px-1 text-slate-300 hover:text-white font-bold"
            >
              A
            </button>
            <button
              onClick={() => adjustFontSize(1)}
              aria-label="Increase font size"
              title="Increase font size (A+)"
              className="px-1 text-slate-300 hover:text-white font-bold"
            >
              A+
            </button>
          </div>

          {/* Bilingual Language Switcher */}
          <div className="flex items-center rounded bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                i18n.language === 'en'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => changeLanguage('hi')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                i18n.language === 'hi'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
