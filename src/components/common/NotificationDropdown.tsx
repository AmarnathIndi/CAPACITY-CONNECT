import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Clock, BookOpen, Award, Users, AlertCircle } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';

export const NotificationDropdown: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const { currentUser } = useAuthStore();

  const userNotifications = notifications.filter(
    (n) => n.userId === 'all' || (currentUser && n.userId === currentUser.id)
  );

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen size={16} className="text-sky-600" />;
      case 'test':
        return <AlertCircle size={16} className="text-amber-600" />;
      case 'certificate':
        return <Award size={16} className="text-emerald-600" />;
      case 'approval':
        return <Users size={16} className="text-purple-600" />;
      default:
        return <Clock size={16} className="text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative p-2 text-slate-600 hover:text-sky-800 hover:bg-slate-100 rounded-full transition-colors focus:ring-2 focus:ring-sky-500"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-10 z-50 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3 bg-slate-50 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm text-slate-800">{t('nav.notifications')}</span>
              {unreadCount > 0 && (
                <span className="bg-sky-100 text-sky-800 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-sky-700 hover:text-sky-900 flex items-center gap-1 font-medium"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {userNotifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No notifications right now.
              </div>
            ) : (
              userNotifications.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-3 text-xs hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-3 ${
                    !item.read ? 'bg-sky-50/50' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 bg-white rounded shadow-xs border border-slate-100">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-slate-800 ${!item.read ? 'text-sky-950 font-bold' : ''}`}>
                      {i18n.language === 'hi' && item.titleHi ? item.titleHi : item.title}
                    </p>
                    <p className="text-slate-600 line-clamp-2 mt-0.5">
                      {i18n.language === 'hi' && item.messageHi ? item.messageHi : item.message}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                      <span>{item.date}</span>
                      {item.link && (
                        <Link
                          to={item.link}
                          onClick={() => setIsOpen(false)}
                          className="text-sky-600 hover:underline font-medium"
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-slate-50 text-center rounded-b-lg">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 block"
            >
              View Full Notifications Center →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
