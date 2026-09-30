import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Users,
  Award,
  Star,
  PlusCircle,
  FileQuestion,
  Library,
  ArrowRight,
  Clock,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCourseStore } from '../../store/useCourseStore';

export const TrainerDashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuthStore();
  const { courses, tests, sessions, testResults, trainerLibrary } = useCourseStore();

  const trainerCourses = courses.filter((c) =>
    currentUser && (
      c.trainerId === currentUser.id ||
      c.trainers?.some((t) => t.trainerId === currentUser.id || t.trainerName === currentUser.name)
    )
  );
  const trainerSessions = sessions.filter((s) =>
    currentUser && (
      s.trainerId === currentUser.id ||
      s.trainers?.some((t) => t.trainerId === currentUser.id || t.trainerName === currentUser.name)
    )
  );
  const pendingInvites = trainerSessions.filter((s) => s.status === 'invited');

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-[#002D62] via-slate-900 to-sky-950 p-6 sm:p-8 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={16} />
            <span>Master Instructor Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {currentUser?.designation} • {currentUser?.office} • Overall Instructor Rating: ★ {currentUser?.rating || 4.9}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2.5 flex-shrink-0">
          <Link
            to="/trainer/ai-test-generator"
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Sparkles size={15} />
            <span>AI Test Generator</span>
          </Link>
          <Link
            to="/trainer/courses/new"
            className="px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <PlusCircle size={15} />
            <span>New Course</span>
          </Link>
        </div>
      </div>

      {/* Invitations Notification Alert */}
      {pendingInvites.length > 0 && (
        <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-purple-900 shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center font-bold flex-shrink-0">
              <Radio size={20} className="animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-sm">
                You have {pendingInvites.length} pending training session invitation(s) from National HQ!
              </p>
              <p className="text-purple-700 mt-0.5">
                Target: {pendingInvites[0].title} ({pendingInvites[0].targetRegion})
              </p>
            </div>
          </div>
          <Link
            to="/trainer/invitations"
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs whitespace-nowrap shadow-xs"
          >
            Review & Respond →
          </Link>
        </div>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Assigned Courses</span>
            <BookOpen size={18} className="text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{trainerCourses.length}</p>
          <p className="text-[11px] text-slate-500">Live in National Catalog</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Test Submissions</span>
            <Users size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{testResults.length}</p>
          <p className="text-[11px] text-slate-500">Staff officers evaluated</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Shared Library Assets</span>
            <Library size={18} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{trainerLibrary.length}</p>
          <p className="text-[11px] text-slate-500">Technical resources</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Avg Trainee Feedback</span>
            <Star size={18} className="text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{currentUser?.rating || 4.9} / 5</p>
          <p className="text-[11px] text-emerald-600 font-semibold">Outstanding standard</p>
        </div>
      </div>

      {/* Grid: Assigned Courses & Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Assigned Courses (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-xs border border-slate-200 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen size={18} className="text-sky-700" />
              <span>Assigned Meteorological Curricula</span>
            </h2>
            <Link
              to="/trainer/courses/new"
              className="text-xs font-bold text-sky-700 hover:text-sky-900"
            >
              + Create New Course
            </Link>
          </div>

          <div className="space-y-4">
            {trainerCourses.map((crs) => {
              const myTrainerRecord = crs.trainers?.find(
                (t) => t.trainerId === currentUser?.id || t.trainerName === currentUser?.name
              );
              const myRole: 'Lead' | 'Co-trainer' = myTrainerRecord?.role || (crs.trainerId === currentUser?.id ? 'Lead' : 'Co-trainer');

              return (
                <div
                  key={crs.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-sky-300 transition-colors"
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={crs.thumbnail}
                      alt={crs.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                          {crs.code}
                        </span>
                        {myRole === 'Lead' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            Lead Trainer
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                            Co-trainer
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          ({crs.trainers?.length || 3} faculty)
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">
                        {crs.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Enrolled: {crs.enrolledUsers.length} staff • {crs.modules.length} lessons • Level: {crs.level}
                      </p>
                    </div>
                  </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/trainee/course/${crs.id}`}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    View
                  </Link>
                  <Link
                    to="/trainer/ai-test-generator"
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Sparkles size={12} className="text-purple-600" />
                    <span>Gen Exam</span>
                  </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Upcoming Sessions & Availability shortcut (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Calendar size={16} className="text-sky-700" />
              <span>Upcoming Live Masterclasses</span>
            </h3>

            <div className="space-y-3">
              {trainerSessions.map((ses) => (
                <div
                  key={ses.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ses.status === 'scheduled'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ses.status === 'invited'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {ses.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{ses.time}</span>
                  </div>

                  <p className="font-bold text-slate-900 line-clamp-2">{ses.title}</p>

                  <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                    <span>{ses.date}</span>
                    <Link
                      to={`/live-session/${ses.id}`}
                      className="font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1"
                    >
                      <span>Join Room</span>
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/trainer/availability"
              className="block w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-center text-xs transition-colors"
            >
              Update Teaching Calendar →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
