import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Radio,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  CheckCircle2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { useAuthStore } from '../../store/useAuthStore';
import { LiveSession } from '../../types';

export const AdminLiveSessionsPage: React.FC = () => {
  const { t } = useTranslation();
  const { sessions, addSession } = useCourseStore();
  const { users } = useAuthStore();

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [title, setTitle] = useState('');
  const [trainerId, setTrainerId] = useState('usr-trainer-1');
  const [date, setDate] = useState('2026-10-15');
  const [time, setTime] = useState('11:00 - 12:30 IST');
  const [targetRegion, setTargetRegion] = useState('Southern Region');
  const [language, setLanguage] = useState('English');
  const [success, setSuccess] = useState(false);

  const trainers = users.filter((u) => u.role === 'trainer');

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedTrainer = trainers.find((tr) => tr.id === trainerId);

    const newSession: LiveSession = {
      id: `ses-${Date.now()}`,
      title: title.trim(),
      titleHi: title.trim(),
      trainerId,
      trainerName: assignedTrainer?.name || 'Dr. Sunita Kulkarni',
      date,
      time,
      duration: '90 mins',
      office: assignedTrainer?.office || 'New Delhi HQ',
      status: 'scheduled',
      attendees: ['usr-trainee-1', 'usr-trainee-2', 'usr-trainee-4'],
      hasTranscript: true,
      topic: title.trim(),
      targetRegion,
      language
    };

    addSession(newSession);
    setShowScheduleModal(false);
    setTitle('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
            Virtual Training Academy
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Live Meteorological Sessions & Webinars
          </h1>
          <p className="text-xs text-slate-500">
            Centrally schedule high-impact interactive masterclasses and monitor video attendance.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-5 py-2.5 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-md transition-colors flex-shrink-0"
        >
          <Plus size={16} />
          <span>Schedule New Session</span>
        </button>
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Live training masterclass successfully scheduled and posted to RMC rosters!</span>
        </div>
      )}

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((ses) => (
          <div
            key={ses.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-sky-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    ses.status === 'scheduled' || ses.status === 'accepted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : ses.status === 'invited'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {ses.status}
                </span>

                <span className="text-[10px] text-slate-400 font-mono">ID: {ses.id}</span>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug">
                {ses.title}
              </h3>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" />
                  <span>{ses.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-400" />
                  <span>{ses.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-400" />
                  <span>Instructor: {ses.trainerName}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Link
                to={`/live-session/${ses.id}`}
                className="w-full py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Radio size={14} />
                <span>Launch Meeting Room</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Schedule Live Virtual Masterclass
            </h3>

            <form onSubmit={handleSchedule} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Extreme Monsoon Precipitation Forecasts"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lead Instructor</label>
                <select
                  value={trainerId}
                  onChange={(e) => setTrainerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {trainers.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.name} ({tr.office})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
