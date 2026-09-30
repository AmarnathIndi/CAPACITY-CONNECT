import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Clock,
  User,
  Star,
  CheckCircle2,
  PlayCircle,
  FileText,
  AlertCircle,
  Award,
  Send,
  DownloadCloud,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useOfflineStore } from '../../store/useOfflineStore';
import { Avatar } from '../../components/common/Avatar';

export const TraineeCourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { courses, enrollCourse, rateCourse } = useCourseStore();
  const { currentUser, users } = useAuthStore();
  const { toggleSaveOfflineCourse, isCourseSavedOffline } = useOfflineStore();

  const course = courses.find((c) => c.id === id);

  const [ratingStars, setRatingStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [trainerScores, setTrainerScores] = useState<Record<string, number>>({});
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Course not found.</h2>
        <Link to="/trainee/catalog" className="text-sky-700 underline text-xs mt-2 inline-block">
          Back to Course Catalog
        </Link>
      </div>
    );
  }

  const isEnrolled = currentUser ? course.enrolledUsers.includes(currentUser.id) : false;
  const isCompleted = currentUser ? course.completedUsers.includes(currentUser.id) : false;
  const isOffline = isCourseSavedOffline(course.id);
  const trainer = users.find((u) => u.id === course.trainerId);

  const avgRating =
    course.ratings.length > 0
      ? (course.ratings.reduce((acc, r) => acc + r.rating, 0) / course.ratings.length).toFixed(1)
      : '5.0';

  const handleEnroll = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    enrollCourse(course.id, currentUser.id);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !reviewComment.trim()) return;

    const trainersList = course.trainers || [];
    const trainerRatingsData = trainersList.map((tr) => ({
      trainerId: tr.trainerId,
      trainerName: tr.trainerName || tr.name || 'Trainer Faculty',
      rating: trainerScores[tr.trainerId] || 5
    }));

    rateCourse(course.id, {
      userId: currentUser.id,
      userName: currentUser.name,
      rating: ratingStars,
      comment: reviewComment.trim(),
      date: new Date().toISOString().substring(0, 10),
      trainerRatings: trainerRatingsData
    });

    setFeedbackSubmitted(true);
    setReviewComment('');
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500">
        <Link to="/trainee/catalog" className="hover:text-slate-800">
          Catalog
        </Link>
        <ChevronRight size={12} />
        <span className="text-slate-700 font-semibold">{course.category}</span>
        <ChevronRight size={12} />
        <span className="text-slate-900 font-bold truncate max-w-xs">{course.code}</span>
      </nav>

      {/* Hero Banner */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-xs border border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#002D62] text-white text-xs font-bold">
                {course.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
                {course.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                Level: {course.level}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs ml-auto">
                <Star size={14} className="fill-amber-400" />
                <span>{avgRating}</span>
                <span className="text-slate-400 font-normal">({course.ratings.length} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {i18n.language === 'hi' && course.titleHi ? course.titleHi : course.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {i18n.language === 'hi' && course.descriptionHi ? course.descriptionHi : course.description}
            </p>

            {/* Quick Metadata Pill */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-slate-400" />
                <span>Duration: <strong>{course.duration}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen size={15} className="text-slate-400" />
                <span>Modules: <strong>{course.modules.length} lessons</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <Award size={15} className="text-emerald-600" />
                <span>Certification: <strong>Available upon passing test</strong></span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              {isEnrolled ? (
                <>
                  <Link
                    to={`/trainee/player/${course.id}`}
                    className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-colors"
                  >
                    <PlayCircle size={16} />
                    <span>{t('courses.continue')}</span>
                  </Link>
                  {course.testId && (
                    <Link
                      to={`/trainee/test/${course.testId}`}
                      className="px-5 py-2.5 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-colors"
                    >
                      <Award size={16} className="text-amber-400" />
                      <span>{t('courses.takeTest')}</span>
                    </Link>
                  )}
                </>
              ) : (
                <button
                  onClick={handleEnroll}
                  className="px-6 py-3 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                >
                  {t('courses.enroll')}
                </button>
              )}

              <button
                onClick={() => toggleSaveOfflineCourse(course.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                  isOffline
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <DownloadCloud size={15} />
                <span>{isOffline ? t('courses.offlineSaved') : t('courses.downloadForOffline')}</span>
              </button>
            </div>
          </div>

          {/* Right Column Thumbnail & Trainer Details */}
          <div className="bg-slate-50 p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between space-y-6">
            <div className="rounded-2xl overflow-hidden shadow-xs border border-slate-200 h-44">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Course Instructional Team (Trainers) */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <User size={13} className="text-sky-700" />
                  <span>Instructional Team ({course.trainers?.length || 1})</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Certified Faculty</span>
              </div>
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {(course.trainers && course.trainers.length > 0 ? course.trainers : [{
                  trainerId: course.trainerId || 'tr1',
                  trainerName: course.trainerName,
                  role: 'Lead' as const,
                  designation: trainer?.designation || 'Meteorologist',
                  office: trainer?.office || 'IMD Office',
                  skills: ['Meteorology'],
                  rating: 4.8
                }]).map((tr, idx) => (
                  <div key={tr.trainerId || idx} className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <Avatar size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-xs text-slate-900 truncate">{tr.trainerName}</p>
                        {tr.role === 'Lead' ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                            Lead
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                            Co-trainer
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{tr.designation || 'Specialist'}</p>
                      <div className="flex items-center justify-between text-[10px] mt-1">
                        <span className="text-sky-700 font-semibold">{tr.office || 'IMD Office'}</span>
                        <span className="text-amber-600 font-bold flex items-center gap-0.5">
                          ★ {tr.rating ? tr.rating.toFixed(1) : '4.8'}
                        </span>
                      </div>
                      {tr.skills && tr.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {tr.skills.slice(0, 3).map((sk) => (
                            <span key={sk} className="px-1.5 py-0.5 rounded text-[9px] bg-sky-50 text-sky-800 border border-sky-100">
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Modules & Syllabus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <BookOpen size={18} className="text-sky-700" />
              <span>{t('courses.modules')}</span>
            </h2>

            <div className="space-y-3">
              {course.modules.map((mod, idx) => (
                <div
                  key={mod.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-sky-50/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{mod.title}</h4>
                      <p className="text-[11px] text-slate-500 capitalize">
                        Type: {mod.type} • Duration: {mod.duration}
                      </p>
                    </div>
                  </div>

                  {isEnrolled && (
                    <Link
                      to={`/trainee/player/${course.id}`}
                      className="px-3 py-1 bg-white hover:bg-sky-100 border border-slate-300 rounded-lg text-xs font-semibold text-sky-800 flex items-center gap-1"
                    >
                      <PlayCircle size={13} />
                      <span>Start</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ratings & Feedback Form */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                <span>{t('courses.ratings')} & Trainee Reviews</span>
              </h3>
            </div>

            {/* Submit Feedback Form */}
            {isEnrolled && !feedbackSubmitted && (
              <form onSubmit={handleFeedbackSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
                <h4 className="font-bold text-slate-800">{t('courses.rateCourse')}</h4>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Overall Course Evaluation</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingStars(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          size={18}
                          className={
                            star <= ratingStars ? 'text-amber-500 fill-amber-400' : 'text-slate-300'
                          }
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">{ratingStars} / 5</span>
                  </div>
                </div>

                {/* Per-Trainer Rating Section */}
                {course.trainers && course.trainers.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-2">
                    <label className="block text-slate-700 font-semibold">Faculty / Trainer Evaluations</label>
                    <p className="text-[11px] text-slate-500">Rate each course trainer separately:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {course.trainers.map((tr) => (
                        <div key={tr.trainerId} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                          <div className="flex items-center space-x-2">
                            <Avatar size="sm" />
                            <div>
                              <p className="font-bold text-xs text-slate-800">{tr.trainerName}</p>
                              <span className="text-[10px] text-slate-500">{tr.role} • {tr.office}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                type="button"
                                key={s}
                                onClick={() => setTrainerScores((prev) => ({ ...prev, [tr.trainerId]: s }))}
                                className="p-0.5 hover:scale-110 transition-transform"
                              >
                                <Star
                                  size={14}
                                  className={
                                    s <= (trainerScores[tr.trainerId] || 5)
                                      ? 'text-amber-500 fill-amber-400'
                                      : 'text-slate-300'
                                  }
                                />
                              </button>
                            ))}
                            <span className="text-xs font-bold text-slate-700 ml-1">
                              {trainerScores[tr.trainerId] || 5}★
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-600 mb-1">Written Feedback</label>
                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share scientific feedback or operational utility of this course..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-900 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Send size={13} />
                  <span>{t('courses.submitFeedback')}</span>
                </button>
              </form>
            )}

            {feedbackSubmitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Thank you! Your course evaluation has been logged for IMD curriculum review.</span>
              </div>
            )}

            {/* Existing Reviews List */}
            <div className="space-y-3">
              {course.ratings.length === 0 ? (
                <p className="text-xs text-slate-400">No trainee reviews submitted yet.</p>
              ) : (
                course.ratings.map((rev, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{rev.userName}</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={12} className="fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600">{rev.comment}</p>
                    {rev.trainerRatings && rev.trainerRatings.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/60 mt-1">
                        {rev.trainerRatings.map((trR) => (
                          <span key={trR.trainerId} className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                            {trR.trainerName}: <strong className="text-amber-600">{trR.rating}★</strong>
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 block">{rev.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Prerequisites & Certification Info */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck size={16} className="text-sky-700" />
              <span>Competency Standards</span>
            </h3>

            <div className="text-xs space-y-2 text-slate-600">
              <p>
                <strong>Prerequisites:</strong>{' '}
                {course.prerequisiteCourseId ? (
                  <Link to={`/trainee/course/${course.prerequisiteCourseId}`} className="text-sky-700 underline font-semibold">
                    {course.prerequisiteCourseId.toUpperCase()} (Required)
                  </Link>
                ) : (
                  t('courses.noPrereq')
                )}
              </p>
              <p>
                <strong>Evaluation Mode:</strong> 15-Minute Computer-Based MCQ Examination (Pass mark: 70%)
              </p>
              <p>
                <strong>Accreditation:</strong> Ministry of Earth Sciences, Central Training Division
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
