import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  CheckCheck,
  BookOpen,
  AlertCircle,
  Award,
  Users,
  Clock,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';

export const NotificationsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const { currentUser } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const userNotifications = notifications.filter(
    (n) => n.userId === 'all' || (currentUser && n.userId === currentUser.id)
  );

  const filteredNotifications = userNotifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'test') return n.type === 'test';
    if (activeFilter === 'course') return n.type === 'course';
    if (activeFilter === 'approval') return n.type === 'approval';
    if (activeFilter === 'session') return n.type === 'session';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen size={18} className="text-sky-600" />;
      case 'test':
        return <AlertCircle size={18} className="text-amber-600" />;
      case 'certificate':
        return <Award size={18} className="text-emerald-600" />;
      case 'approval':
        return <Users size={18} className="text-purple-600" />;
      default:
        return <Clock size={18} className="text-blue-600" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Page Title & Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Bell size={24} className="text-sky-700" />
            <span>National Notifications & Operational Alerts</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time training dispatches, certification reminders, and examination deadlines
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition-colors"
        >
          <CheckCheck size={16} className="text-sky-600" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {['all', 'unread', 'test', 'course', 'session', 'approval'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold capitalize transition-all ${
              activeFilter === tab
                ? 'bg-[#002D62] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No notifications found under this filter.
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`p-4 sm:p-5 flex items-start space-x-4 transition-colors cursor-pointer hover:bg-slate-50 ${
                !notif.read ? 'bg-sky-50/40' : ''
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className={`text-sm font-bold ${!notif.read ? 'text-[#002D62]' : 'text-slate-800'}`}>
                    {i18n.language === 'hi' && notif.titleHi ? notif.titleHi : notif.title}
                  </h3>
                  <span className="text-[11px] text-slate-400">{notif.date}</span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {i18n.language === 'hi' && notif.messageHi ? notif.messageHi : notif.message}
                </p>

                {notif.link && (
                  <div className="mt-2.5">
                    <Link
                      to={notif.link}
                      className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900"
                    >
                      <span>Take Action</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
              </div>

              {!notif.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600 flex-shrink-0 mt-2"></span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
