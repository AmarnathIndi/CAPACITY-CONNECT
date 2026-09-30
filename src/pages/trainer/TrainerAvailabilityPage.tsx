import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Save,
  Radio,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCourseStore } from '../../store/useCourseStore';

export const TrainerAvailabilityPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, updateProfile } = useAuthStore();
  const { sessions } = useCourseStore();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const slots = [
    '09:00 - 11:00',
    '11:00 - 13:00',
    '14:00 - 16:00',
    '16:00 - 18:00'
  ];

  // Initialize from user availability
  const initialAvailability: Record<string, string[]> = currentUser?.availability || {
    Monday: ['10:00 - 12:00', '14:00 - 16:00'],
    Wednesday: ['10:00 - 12:00', '15:00 - 17:00'],
    Friday: ['09:00 - 11:00']
  };

  const [availability, setAvailability] = useState<Record<string, string[]>>(initialAvailability);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Accepted sessions for this trainer
  const acceptedSessions = sessions.filter(
    (s) => currentUser && s.trainerId === currentUser.id && (s.status === 'accepted' || s.status === 'scheduled')
  );

  const toggleSlot = (day: string, slot: string) => {
    const currentDaySlots = availability[day] || [];
    const isPresent = currentDaySlots.includes(slot);
    const updatedDaySlots = isPresent
      ? currentDaySlots.filter((s) => s !== slot)
      : [...currentDaySlots, slot];

    setAvailability({
      ...availability,
      [day]: updatedDaySlots
    });
  };

  const handleSave = () => {
    updateProfile({
      availability
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
          Instructor Scheduling Grid
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Weekly Teaching & Masterclass Availability
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Configure your operational availability slots across the week. National HQ administrators use this grid to automatically match and schedule live radar workshops without time conflicts.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Availability schedule updated and published to Admin Scheduling Engine!</span>
        </div>
      )}

      {/* Accepted Sessions Pinned Alert */}
      {acceptedSessions.length > 0 && (
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-start space-x-3 text-xs text-sky-950">
          <Radio size={18} className="text-sky-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              {acceptedSessions.length} Confirmed Masterclass Session(s) Active on Calendar:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {acceptedSessions.map((s) => (
                <span
                  key={s.id}
                  className="px-2.5 py-1 rounded-lg bg-white border border-sky-300 font-semibold text-[11px] text-sky-900 shadow-xs"
                >
                  📅 {s.date} ({s.time}) • {s.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Interactive Calendar Grid */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Clock size={18} className="text-sky-700" />
            <h2 className="text-base font-bold text-slate-900">Interactive Weekly Time Slots</h2>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded bg-emerald-500"></span> Available
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded bg-slate-200"></span> Unavailable
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {days.map((day) => {
            const dayActiveSlots = availability[day] || [];

            return (
              <div
                key={day}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between"
              >
                <div className="text-center pb-2 border-b border-slate-200">
                  <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                    {day}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {dayActiveSlots.length} slot(s) open
                  </span>
                </div>

                <div className="space-y-2">
                  {slots.map((slot) => {
                    const isAvailable = dayActiveSlots.includes(slot);

                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => toggleSlot(day, slot)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                          isAvailable
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs hover:bg-emerald-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-md transition-colors"
          >
            <Save size={15} />
            <span>Save Availability Calendar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
