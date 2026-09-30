import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  User,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  DownloadCloud
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useOfflineStore } from '../../store/useOfflineStore';

export const TraineeCatalogPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { courses, enrollCourse } = useCourseStore();
  const { currentUser } = useAuthStore();
  const { isCourseSavedOffline } = useOfflineStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  const categories = ['All', 'Radar', 'Cyclone', 'NWP', 'AWS', 'Satellite', 'Aviation', 'Agromet'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.titleHi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || c.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleEnroll = (courseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    enrollCourse(courseId, currentUser.id);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002D62] via-slate-900 to-sky-900 rounded-3xl p-6 sm:p-8 text-white space-y-3 shadow-md">
        <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles size={16} />
          <span>IMD National Academy of Meteorology</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Operational Course Catalog & Skill Programs
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Master Doppler weather radar nowcasting, cyclone forecasting, automatic weather station telemetry, and numerical modeling with official IMD course materials.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('courses.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-xs text-slate-800"
            />
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          </div>

          {/* Level Filter Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
            >
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  Level: {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-400 font-bold mr-1 flex items-center gap-1 flex-shrink-0">
            <Filter size={13} />
            <span>Discipline:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold flex-shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((crs) => {
          const isEnrolled = currentUser && crs.enrolledUsers.includes(currentUser.id);
          const isCompleted = currentUser && crs.completedUsers.includes(currentUser.id);
          const isOfflineSaved = isCourseSavedOffline(crs.id);

          return (
            <div
              key={crs.id}
              className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-200 hover:border-sky-400 hover:shadow-lg transition-all flex flex-col group"
            >
              <div className="relative h-44 overflow-hidden bg-slate-900">
                <img
                  src={crs.thumbnail}
                  alt={crs.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                  <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                    {crs.code}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-sky-700 text-white text-[10px] font-bold">
                    {crs.category}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white">
                  <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs font-semibold">
                    {crs.level}
                  </span>
                  {isOfflineSaved && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/80 text-white font-bold flex items-center gap-1">
                      <DownloadCloud size={12} />
                      <span>Offline Ready</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-base text-slate-900 line-clamp-2 leading-snug group-hover:text-sky-700 transition-colors">
                    {i18n.language === 'hi' && crs.titleHi ? crs.titleHi : crs.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {i18n.language === 'hi' && crs.descriptionHi ? crs.descriptionHi : crs.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-slate-400" />
                      <span>{crs.duration}</span>
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-700" title={crs.trainers?.map((t) => `${t.role}: ${t.name}`).join(', ')}>
                      <User size={14} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate max-w-[180px]">
                        {crs.trainers && crs.trainers.length > 0 ? (
                          <>
                            <span>{crs.trainers.find((t) => t.role === 'Lead')?.name || crs.trainers[0].name}</span>
                            {crs.trainers.length > 1 && (
                              <span className="text-[10px] text-sky-700 font-semibold ml-1 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                                +{crs.trainers.length - 1} more trainers
                              </span>
                            )}
                          </>
                        ) : (
                          crs.trainerName
                        )}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {isCompleted ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 size={15} />
                        <span>{t('courses.courseCompleted')}</span>
                      </span>
                    ) : isEnrolled ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-sky-800 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
                        <CheckCircle2 size={15} />
                        <span>{t('courses.enrolled')}</span>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleEnroll(crs.id, e)}
                        className="px-3.5 py-1.5 bg-[#002D62] hover:bg-[#0A2540] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                      >
                        {t('courses.enroll')}
                      </button>
                    )}

                    <Link
                      to={`/trainee/course/${crs.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <span>{isEnrolled ? 'Open Player' : 'Details'}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
