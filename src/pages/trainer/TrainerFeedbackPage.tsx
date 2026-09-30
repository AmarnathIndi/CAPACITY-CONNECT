import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MessageSquare, BookOpen, ThumbsUp, Filter } from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { useAuthStore } from '../../store/useAuthStore';

export const TrainerFeedbackPage: React.FC = () => {
  const { t } = useTranslation();
  const { courses } = useCourseStore();
  const { currentUser } = useAuthStore();

  const myCourses = courses.filter((c) =>
    currentUser && (
      c.trainerId === currentUser.id ||
      c.trainers?.some((t) => t.trainerId === currentUser.id || t.trainerName === currentUser.name)
    )
  );

  // Aggregate all ratings across trainer's courses, identifying trainer-specific vs course ratings
  const allFeedback = myCourses.flatMap((c) =>
    c.ratings.map((r) => {
      const specificTrainerRating = r.trainerRatings?.find(
        (tr) => tr.trainerId === currentUser?.id || tr.trainerName === currentUser?.name
      );
      return {
        ...r,
        courseCode: c.code,
        courseTitle: c.title,
        trainerRating: specificTrainerRating?.rating || r.rating,
        courseRating: r.rating
      };
    })
  );

  const avgTrainerRating =
    allFeedback.length > 0
      ? (allFeedback.reduce((sum, r) => sum + r.trainerRating, 0) / allFeedback.length).toFixed(1)
      : (currentUser?.rating || 4.9).toString();

  const avgCourseRating =
    allFeedback.length > 0
      ? (allFeedback.reduce((sum, r) => sum + r.courseRating, 0) / allFeedback.length).toFixed(1)
      : '4.8';

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
          Instructor Quality Assurance
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Trainee Evaluations & Faculty Feedback
        </h1>
        <p className="text-xs text-slate-500">
          Detailed breakdown of your individual faculty ratings alongside overall course evaluations across Regional Meteorological Centres.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Your Faculty Rating</span>
          <div className="flex items-center space-x-2">
            <p className="text-3xl font-extrabold text-amber-500">{avgTrainerRating}</p>
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} className={i < Math.round(Number(avgTrainerRating)) ? 'fill-amber-400' : 'text-slate-300'} />
              ))}
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Direct trainee scores for your teaching</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Course Curriculum Summary</span>
          <div className="flex items-center space-x-2">
            <p className="text-3xl font-extrabold text-sky-800">{avgCourseRating}</p>
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} className={i < Math.round(Number(avgCourseRating)) ? 'fill-amber-400' : 'text-slate-300'} />
              ))}
            </div>
          </div>
          <span className="text-[11px] text-slate-500">Overall course material rating</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Evaluations Received</span>
          <p className="text-3xl font-extrabold text-slate-900">{allFeedback.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">100% verified staff officers</span>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <MessageSquare size={18} className="text-sky-700" />
          <span>Faculty & Course Reviews ({allFeedback.length})</span>
        </h2>

        <div className="space-y-4">
          {allFeedback.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No written reviews submitted yet for your modules.
            </p>
          ) : (
            allFeedback.map((fb, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs hover:border-sky-300 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{fb.userName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
                      {fb.courseCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="text-[10px] font-semibold text-amber-800">Your Rating:</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: fb.trainerRating }).map((_, i) => (
                          <Star key={i} size={12} className="fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-amber-900">{fb.trainerRating}★</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-600">
                      <span className="text-[10px]">Course Summary:</span>
                      <span className="text-[10px] font-bold text-slate-800">{fb.courseRating}★</span>
                    </div>

                    <span className="text-[10px] text-slate-400">{fb.date}</span>
                  </div>
                </div>

                <p className="text-slate-700 text-xs leading-relaxed italic">
                  "{fb.comment}"
                </p>

                <p className="text-[10px] text-slate-500">Curriculum: {fb.courseTitle}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
