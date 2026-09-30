import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Sparkles,
  Calendar
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuditStore } from '../../store/useAuditStore';
import { Announcement } from '../../types';

export const AdminAnnouncementsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { announcements, addAnnouncement } = useCourseStore();
  const { addNotification } = useNotificationStore();
  const { logAction } = useAuditStore();

  const [title, setTitle] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [content, setContent] = useState('');
  const [contentHi, setContentHi] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [category, setCategory] = useState<'notice' | 'achievement' | 'training'>('notice');
  const [author, setAuthor] = useState('Dr. S. C. Bhan (Head - Training)');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newAnnouncement: Announcement = {
      id: `anc-${Date.now()}`,
      title: title.trim(),
      titleHi: titleHi.trim() || title.trim(),
      content: content.trim(),
      contentHi: contentHi.trim() || content.trim(),
      date: new Date().toISOString().substring(0, 10),
      priority,
      author,
      category
    };

    addAnnouncement(newAnnouncement);

    // Also broadcast notification to all staff
    addNotification({
      userId: 'all',
      title: title.trim(),
      titleHi: titleHi.trim() || title.trim(),
      message: content.trim(),
      messageHi: contentHi.trim() || content.trim(),
      type: category === 'training' ? 'course' : 'system'
    });

    logAction('Dr. M. Mohapatra', 'Admin', 'ANNOUNCEMENT_POSTED', title, `Published ${priority} directive on homepage`);

    setSuccess(true);
    setTitle('');
    setTitleHi('');
    setContent('');
    setContentHi('');
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
          Official Dispatches & Portal Broadcast
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Post Portal Announcements & Regional Achievements
        </h1>
        <p className="text-xs text-slate-500">
          Broadcast national advisories, mandatory training directives, and regional milestone commendations to the homepage.
        </p>
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Announcement successfully published to homepage and broadcast via notification bell!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column (2 Cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5 text-xs">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Megaphone size={16} className="text-sky-700" />
              <span>Announcement Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title (English)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mandatory Pre-Cyclone Radar Calibration Exercise"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title (हिन्दी)</label>
                <input
                  type="text"
                  value={titleHi}
                  onChange={(e) => setTitleHi(e.target.value)}
                  placeholder="e.g. अनिवार्य चक्रवात पूर्व रडार अंशांकन अभ्यास"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="normal">Normal Notice</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">🚨 Urgent / Mandatory</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="notice">Official Notice</option>
                  <option value="training">Training Directive</option>
                  <option value="achievement">Achievement Commendation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Author / Division</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bulletin Content (English)</label>
              <textarea
                rows={3}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Full dispatch text regarding directives or commendations..."
                className="w-full p-3 rounded-xl border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bulletin Content (हिन्दी)</label>
              <textarea
                rows={3}
                value={contentHi}
                onChange={(e) => setContentHi(e.target.value)}
                placeholder="आधिकारिक सूचना का विवरण..."
                className="w-full p-3 rounded-xl border border-slate-300 text-slate-900"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-md transition-colors"
              >
                <Save size={15} />
                <span>{t('admin.publishAnnouncement')}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Existing Announcements Feed (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100 uppercase tracking-wider">
              Currently Live on Homepage
            </h3>

            <div className="space-y-3">
              {announcements.map((anc) => (
                <div
                  key={anc.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        anc.priority === 'urgent'
                          ? 'bg-red-100 text-red-800'
                          : anc.priority === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {anc.priority}
                    </span>
                    <span className="text-[10px] text-slate-400">{anc.date}</span>
                  </div>

                  <h4 className="font-bold text-slate-900">{anc.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{anc.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
