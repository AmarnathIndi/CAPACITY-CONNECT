import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Star,
  Zap,
  ArrowRight,
  ShieldCheck,
  Target
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCourseStore } from '../../store/useCourseStore';

export const TraineeProgressPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuthStore();
  const { courses, certificates, testResults } = useCourseStore();

  const userEnrolledCourses = courses.filter(
    (c) => currentUser && c.enrolledUsers.includes(currentUser.id)
  );

  const userCompletedCourses = courses.filter(
    (c) => currentUser && c.completedUsers.includes(currentUser.id)
  );

  const userCertificates = certificates.filter(
    (c) => currentUser && c.userId === currentUser.id
  );

  const completionRate =
    userEnrolledCourses.length > 0
      ? Math.round((userCompletedCourses.length / userEnrolledCourses.length) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002D62] via-slate-900 to-sky-950 p-6 sm:p-8 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
            IMD Staff Competency Portfolio
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            My Learning Progress & Achievements
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Track your operational meteorology hours, active course enrollments, milestone badges, and national ranking.
          </p>
        </div>

        {/* Big Points Badge */}
        <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center flex-shrink-0">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
            National Points
          </span>
          <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 mt-1">
            {currentUser?.points.toLocaleString()}
          </p>
          <span className="text-xs text-emerald-300 font-semibold mt-1 block">
            Level 3 Senior Practitioner
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Enrolled Modules</span>
            <BookOpen size={18} className="text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{userEnrolledCourses.length}</p>
          <p className="text-[11px] text-slate-500">{userCompletedCourses.length} Completed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Completion Ratio</span>
            <Target size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">{completionRate}%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Earned Credentials</span>
            <Award size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{userCertificates.length}</p>
          <p className="text-[11px] text-slate-500">Official IMD Badges</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Milestone Badges</span>
            <Zap size={18} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-700">{currentUser?.badges.length || 0}</p>
          <p className="text-[11px] text-slate-500">Peer verified</p>
        </div>
      </div>

      {/* Active Courses Progress List */}
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Course Enrollments</h2>
            <p className="text-xs text-slate-500">Continue lessons and take competency tests</p>
          </div>
          <Link
            to="/trainee/catalog"
            className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1"
          >
            <span>Explore More</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="space-y-4">
          {userEnrolledCourses.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              You have not enrolled in any courses yet.
            </p>
          ) : (
            userEnrolledCourses.map((crs) => {
              const isDone = currentUser && crs.completedUsers.includes(currentUser.id);
              const progressPct = isDone ? 100 : 65;

              return (
                <div
                  key={crs.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-sky-300 transition-colors"
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={crs.thumbnail}
                      alt={crs.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                          {crs.code}
                        </span>
                        <span className="text-xs text-slate-500">{crs.category}</span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">
                        {i18n.language === 'hi' && crs.titleHi ? crs.titleHi : crs.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Trainer: {crs.trainerName} • Duration: {crs.duration}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar & Actions */}
                  <div className="w-full md:w-64 space-y-2 flex-shrink-0">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">
                        {isDone ? 'Completed 100%' : 'In Progress'}
                      </span>
                      <span className="text-sky-700">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isDone ? 'bg-emerald-500' : 'bg-sky-600'}`}
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <Link
                        to={`/trainee/player/${crs.id}`}
                        className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        Open Player
                      </Link>
                      {crs.testId && (
                        <Link
                          to={`/trainee/test/${crs.testId}`}
                          className="px-3 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold"
                        >
                          Exam
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200 space-y-4">
        <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Award size={18} className="text-amber-500" />
          <span>Earned Meteorological Honors & Badges</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {currentUser?.badges.map((b) => (
            <div
              key={b}
              className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-center space-y-2 shadow-xs"
            >
              <div className="w-12 h-12 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xl mx-auto shadow-sm">
                🎖️
              </div>
              <h4 className="font-bold text-xs text-amber-950">{b}</h4>
              <p className="text-[10px] text-amber-800">MoES Certified Milestone</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
