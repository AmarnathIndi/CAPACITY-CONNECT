import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Award,
  BookOpen,
  CloudSun,
  Shield,
  TrendingUp,
  ArrowRight,
  Bell,
  Users,
  Compass,
  CheckCircle,
  Zap,
  Calendar,
  Sparkles,
  Radar
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCourseStore } from '../../store/useCourseStore';
import { Avatar } from '../../components/common/Avatar';

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, demoLogin, users } = useAuthStore();
  const { courses, announcements, certificates } = useCourseStore();

  // Top learners sorted by points
  const activeLearners = [...users]
    .filter((u) => u.status === 'active')
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  const handleQuickDemo = (role: 'trainee' | 'trainer' | 'admin') => {
    demoLogin(role);
    if (role === 'trainee') navigate('/trainee/catalog');
    else if (role === 'trainer') navigate('/trainer/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Government Banner */}
      <section className="relative bg-gradient-to-br from-[#002D62] via-[#0A2540] to-sky-950 text-white overflow-hidden py-14 px-4 sm:px-6 lg:px-8 border-b-4 border-sky-400">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-400" />
              <span>MoES Mission Mausam Capacity Initiative</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {t('home.welcome')}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {t('home.welcomeSub')} — unified national learning and competency infrastructure for radar nowcasting, cyclone warning, numerical models, and observational telemetry.
            </p>

            {/* Quick CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {currentUser ? (
                <Link
                  to={
                    currentUser.role === 'trainee'
                      ? '/trainee/catalog'
                      : currentUser.role === 'trainer'
                      ? '/trainer/dashboard'
                      : '/admin/dashboard'
                  }
                  className="px-5 py-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-5 py-3 rounded-lg bg-[#FF9933] hover:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all"
                >
                  <span>Access Staff Portal</span>
                  <ArrowRight size={16} />
                </Link>
              )}

              <Link
                to="/trainee/catalog"
                className="px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2"
              >
                <BookOpen size={16} />
                <span>Explore Course Catalog</span>
              </Link>
            </div>

            {/* Quick Demo Login Bar if logged out */}
            {!currentUser && (
              <div className="pt-3 border-t border-white/15">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                  One-Click Demo Personas:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickDemo('trainee')}
                    className="px-3 py-1.5 rounded bg-sky-500/20 hover:bg-sky-500/40 text-sky-200 border border-sky-400/40 text-xs font-semibold transition-all"
                  >
                    🚀 Trainee (Dr. Sharma)
                  </button>
                  <button
                    onClick={() => handleQuickDemo('trainer')}
                    className="px-3 py-1.5 rounded bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 border border-purple-400/40 text-xs font-semibold transition-all"
                  >
                    🎓 Trainer (Dr. Kulkarni)
                  </button>
                  <button
                    onClick={() => handleQuickDemo('admin')}
                    className="px-3 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 border border-amber-400/40 text-xs font-semibold transition-all"
                  >
                    👑 Admin (Dr. Mohapatra)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics Card Grid */}
          <div className="w-full lg:w-auto grid grid-cols-2 gap-3 sm:gap-4 flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-white/15 text-white">
              <div className="flex items-center justify-between">
                <BookOpen size={24} className="text-sky-300" />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/30 text-sky-200">
                  Active
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold mt-3">{courses.length}</p>
              <p className="text-xs text-slate-300 mt-1 font-medium">{t('home.coursesAvailable')}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-white/15 text-white">
              <div className="flex items-center justify-between">
                <Users size={24} className="text-emerald-300" />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200">
                  National
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold mt-3">{users.length}</p>
              <p className="text-xs text-slate-300 mt-1 font-medium">{t('home.activeTrainees')}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-white/15 text-white">
              <div className="flex items-center justify-between">
                <Award size={24} className="text-amber-300" />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200">
                  Verified
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold mt-3">{certificates.length}</p>
              <p className="text-xs text-slate-300 mt-1 font-medium">{t('home.certificationsIssued')}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-white/15 text-white">
              <div className="flex items-center justify-between">
                <Radar size={24} className="text-purple-300" />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200">
                  Offices
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold mt-3">94.8%</p>
              <p className="text-xs text-slate-300 mt-1 font-medium">{t('home.rmcParticipation')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Announcements & Achievements Wall */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Announcements & Official Directives (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Bell size={20} className="text-sky-700" />
                <h2 className="text-lg font-bold text-slate-900">
                  {t('home.latestAnnouncements')}
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Official Dispatch</span>
            </div>

            <div className="space-y-3.5">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.priority === 'urgent'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : item.priority === 'high'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-sky-100 text-sky-800 border border-sky-200'
                      }`}
                    >
                      {item.priority === 'urgent' ? '🚨 Mandatory Directive' : 'Official Notice'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{item.date}</span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    {i18n.language === 'hi' && item.titleHi ? item.titleHi : item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {i18n.language === 'hi' && item.contentHi ? item.contentHi : item.content}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                    <span className="font-medium text-slate-600">Issued by: {item.author}</span>
                    <Link
                      to="/trainee/catalog"
                      className="text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1"
                    >
                      <span>Relevant Courses</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Wall & Top Learners (1 col) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Award size={20} className="text-amber-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  {t('home.achievementsWall')}
                </h2>
              </div>
              <Link
                to="/trainee/leaderboard"
                className="text-xs text-sky-700 font-semibold hover:underline"
              >
                Full Leaderboard →
              </Link>
            </div>

            {/* Top Learners List */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t('home.topLearners')}
                </p>
              </div>

              {activeLearners.map((learner, idx) => (
                <div key={learner.id} className="p-3.5 flex items-center space-x-3 hover:bg-slate-50">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      idx === 0
                        ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-800'
                        : idx === 2
                        ? 'bg-amber-700/60 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  <Avatar size="md" name={learner.name} />

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{learner.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {learner.designation} • {learner.office}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {learner.badges.slice(0, 2).map((b) => (
                        <span
                          key={b}
                          className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold"
                        >
                          🎖️ {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-extrabold text-sky-700">
                      {learner.points.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{t('home.points')}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Regional Honor Card */}
            <div className="bg-gradient-to-br from-amber-500/10 via-sky-50 to-emerald-500/10 p-4 rounded-xl border border-amber-200/80 space-y-2">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                <Sparkles size={15} />
                <span>Regional Milestone of the Month</span>
              </div>
              <p className="text-xs text-slate-800 font-medium">
                <strong>Chennai Regional Meteorological Centre (RMC)</strong> recorded 98% pass rate on Tropical Cyclone Dvorak master exams.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Courses Spotlight */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Priority Meteorological Curricula</h2>
              <p className="text-xs text-slate-500">
                WMO-compliant operational courses designed for scientific assistants & meteorologists
              </p>
            </div>
            <Link
              to="/trainee/catalog"
              className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1"
            >
              <span>{t('home.viewAll')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {courses.slice(0, 4).map((crs) => (
              <div
                key={crs.id}
                className="bg-white rounded-xl overflow-hidden shadow-xs border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all flex flex-col group"
              >
                <div className="relative h-36 overflow-hidden bg-slate-900">
                  <img
                    src={crs.thumbnail}
                    alt={crs.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                      {crs.code}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#002D62] text-white text-[10px] font-bold">
                      {crs.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-sky-700 transition-colors">
                      {i18n.language === 'hi' && crs.titleHi ? crs.titleHi : crs.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {i18n.language === 'hi' && crs.descriptionHi ? crs.descriptionHi : crs.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">⏱️ {crs.duration}</span>
                    <Link
                      to={`/trainee/course/${crs.id}`}
                      className="font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
