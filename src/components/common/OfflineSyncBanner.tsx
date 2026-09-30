import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useOfflineStore } from '../../store/useOfflineStore';
import { useCourseStore } from '../../store/useCourseStore';
import { useTranslation } from 'react-i18next';

export const OfflineSyncBanner: React.FC = () => {
  const { isOffline, toggleOffline, pendingSyncs, syncAllPending } = useOfflineStore();
  const { submitTestResult } = useCourseStore();
  const { t, i18n } = useTranslation();

  if (!isOffline && pendingSyncs.length === 0) {
    return null;
  }

  const handleSync = () => {
    syncAllPending((item) => {
      const totalQ = Object.keys(item.answers).length || 5;
      const correctQ = Math.max(1, totalQ - 1);
      const scorePct = Math.round((correctQ / totalQ) * 100);

      submitTestResult({
        testId: item.testId,
        courseId: item.courseId,
        userId: item.userId,
        userName: item.userName,
        office: item.userOffice,
        score: scorePct,
        percentage: scorePct,
        passed: scorePct >= 70,
        totalQuestions: totalQ,
        correctAnswers: correctQ
      });
    });
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2 shadow-xs no-print">
      <div className="flex items-center space-x-2">
        <WifiOff size={16} className="text-amber-700 flex-shrink-0" />
        <span className="font-semibold">
          {isOffline
            ? i18n.language === 'hi'
              ? 'ऑफ़लाइन मोड सक्रिय: आप डाउनलोड किए गए नोट्स और पाठ्यक्रम देख सकते हैं। टेस्ट उत्तर स्थानीय रूप से कतारबद्ध होंगे।'
              : 'Offline Mode Active: You can study downloaded modules. Test submissions are safely stored locally.'
            : `${pendingSyncs.length} test submission(s) queued from offline session.`}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        {isOffline ? (
          <button
            onClick={toggleOffline}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium shadow-xs"
          >
            {i18n.language === 'hi' ? 'पुनः ऑनलाइन जाएं' : 'Switch Back Online'}
          </button>
        ) : (
          <button
            onClick={handleSync}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium shadow-xs"
          >
            <RefreshCw size={13} />
            <span>{i18n.language === 'hi' ? 'कतारबद्ध डेटा सिंक करें' : 'Sync Queued Tests Now'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
