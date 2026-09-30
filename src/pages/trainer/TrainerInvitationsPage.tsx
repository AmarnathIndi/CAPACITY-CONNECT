import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Radio,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { useAuthStore } from '../../store/useAuthStore';

export const TrainerInvitationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { sessions, updateSessionStatus } = useCourseStore();
  const { currentUser } = useAuthStore();

  const [feedbackMsg, setFeedbackMsg] = useState('');

  const trainerSessions = sessions.filter(
    (s) => currentUser && (s.trainerId === currentUser.id || s.trainerName === currentUser.name)
  );

  const handleResponse = (sessionId: string, status: 'accepted' | 'declined') => {
    updateSessionStatus(sessionId, status);
    if (status === 'accepted') {
      setFeedbackMsg('Session Accepted! It has been pinned to your weekly teaching calendar.');
    } else {
      setFeedbackMsg('Session declined. The Admin scheduling engine has been notified.');
    }
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider">
          HQ Faculty Assignments
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Live Masterclass Session Invitations
        </h1>
        <p className="text-xs text-slate-500">
          Respond to live training invitations assigned by the Director General of Meteorology and National Training Cell.
        </p>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Invitations List */}
      <div className="space-y-4">
        {trainerSessions.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
            No live training invitations currently pending for your account.
          </div>
        ) : (
          trainerSessions.map((ses) => {
            const isPending = ses.status === 'invited';
            const isAccepted = ses.status === 'accepted' || ses.status === 'scheduled';
            const isDeclined = ses.status === 'declined';

            return (
              <div
                key={ses.id}
                className={`p-6 rounded-3xl border shadow-xs transition-all space-y-4 ${
                  isPending
                    ? 'bg-gradient-to-r from-purple-50/60 to-sky-50/60 border-purple-300 ring-2 ring-purple-100'
                    : isAccepted
                    ? 'bg-white border-emerald-300'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          isPending
                            ? 'bg-purple-600 text-white'
                            : isAccepted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {ses.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">ID: {ses.id}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-1">{ses.title}</h3>
                  </div>

                  {isAccepted && (
                    <Link
                      to={`/live-session/${ses.id}`}
                      className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors self-start"
                    >
                      <Radio size={14} />
                      <span>Enter Meeting Room</span>
                    </Link>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/80 p-3.5 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Scheduled Date
                    </span>
                    <span className="font-semibold text-slate-800">{ses.date}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Time Slot
                    </span>
                    <span className="font-semibold text-slate-800">{ses.time}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Target Region
                    </span>
                    <span className="font-semibold text-sky-800">{ses.targetRegion}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Medium
                    </span>
                    <span className="font-semibold text-slate-800">{ses.language}</span>
                  </div>
                </div>

                {/* Action Buttons for Pending Invitations */}
                {isPending && (
                  <div className="flex items-center justify-end space-x-3 pt-2">
                    <button
                      onClick={() => handleResponse(ses.id, 'declined')}
                      className="px-4 py-2 border border-red-300 bg-white hover:bg-red-50 text-red-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                    >
                      <XCircle size={14} />
                      <span>{t('trainer.decline')}</span>
                    </button>

                    <button
                      onClick={() => handleResponse(ses.id, 'accepted')}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={14} />
                      <span>{t('trainer.accept')}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
