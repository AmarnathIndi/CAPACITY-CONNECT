import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  WifiOff,
  RefreshCw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useOfflineStore } from '../../store/useOfflineStore';
import { Certificate, MCQQuestion } from '../../types';

export const TraineeTestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { tests, submitTestResult } = useCourseStore();
  const { currentUser, updateProfile } = useAuthStore();
  const { isOffline, queueOfflineTest } = useOfflineStore();

  const test = tests.find((t) => t.id === id) || tests[0];

  // Randomize questions on initial load
  const randomizedQuestions = useMemo(() => {
    return [...test.questions].sort(() => 0.5 - Math.random());
  }, [test.id]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(test.durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isOfflineQueued, setIsOfflineQueued] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [generatedCert, setGeneratedCert] = useState<Certificate | null>(null);

  // Countdown timer
  useEffect(() => {
    if (isSubmitted || isOfflineQueued) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, isOfflineQueued]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex
    });
  };

  const handleSubmitTest = () => {
    let correctCount = 0;
    randomizedQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        correctCount += 1;
      }
    });

    const totalQ = randomizedQuestions.length;
    const scorePct = Math.round((correctCount / totalQ) * 100);
    const passed = scorePct >= test.passPercentage;

    // Check if offline
    if (isOffline) {
      queueOfflineTest({
        testId: test.id,
        courseId: test.courseId,
        userId: currentUser?.id || 'usr-trainee-1',
        userName: currentUser?.name || 'Trainee Officer',
        userOffice: currentUser?.office || 'New Delhi HQ',
        answers: selectedAnswers
      });
      setIsOfflineQueued(true);
      return;
    }

    // Online submission
    const { result, certificate } = submitTestResult({
      testId: test.id,
      courseId: test.courseId,
      userId: currentUser?.id || 'usr-trainee-1',
      userName: currentUser?.name || 'Dr. Rajesh Sharma',
      office: currentUser?.office || 'New Delhi HQ',
      score: scorePct,
      percentage: scorePct,
      passed,
      totalQuestions: totalQ,
      correctAnswers: correctCount
    });

    setExamResult(result);
    setGeneratedCert(certificate);
    setIsSubmitted(true);

    if (passed) {
      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Award points and badges
      if (currentUser) {
        const newPoints = currentUser.points + 250;
        const newBadges = [...currentUser.badges];
        if (!newBadges.includes('Test Ace')) newBadges.push('Test Ace');
        updateProfile({
          points: newPoints,
          badges: newBadges
        });
      }
    }
  };

  const currentQ = randomizedQuestions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Test Title and Status Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 uppercase tracking-wider">
            {test.courseTitle}
          </span>
          <h1 className="text-lg font-bold text-slate-900 mt-1">
            {i18n.language === 'hi' && test.titleHi ? test.titleHi : test.title}
          </h1>
        </div>

        {/* Live Countdown Timer */}
        {!isSubmitted && !isOfflineQueued && (
          <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm shadow-xs ${
              secondsRemaining < 180
                ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                : 'bg-slate-50 text-slate-800 border-slate-200'
            }`}
          >
            <Clock size={16} className={secondsRemaining < 180 ? 'text-red-600' : 'text-slate-500'} />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>
        )}
      </div>

      {/* OFFLINE QUEUED STATE */}
      {isOfflineQueued && (
        <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-amber-300 text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <WifiOff size={32} />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
              Queued Offline (Pending Sync)
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Exam Responses Stored Locally
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              {t('test.offlineNotice')}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl max-w-sm mx-auto border border-slate-200 text-xs space-y-1 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Test Paper:</span>
              <span className="font-bold text-slate-800">{test.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Questions Answered:</span>
              <span className="font-bold text-emerald-700">
                {Object.keys(selectedAnswers).length} of {randomizedQuestions.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Local Timestamp:</span>
              <span className="font-medium text-slate-700">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/trainee/catalog"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Return to Catalog
            </Link>
            <button
              onClick={() => {
                navigate('/');
              }}
              className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs transition-colors"
            >
              View Sync Queue
            </button>
          </div>
        </div>
      )}

      {/* ONLINE TEST RESULTS STATE */}
      {isSubmitted && examResult && (
        <div className="space-y-6 animate-in fade-in">
          {/* Result Card */}
          <div
            className={`p-6 sm:p-8 rounded-3xl shadow-lg border text-center space-y-5 ${
              examResult.passed
                ? 'bg-gradient-to-b from-emerald-50 to-white border-emerald-300'
                : 'bg-gradient-to-b from-red-50 to-white border-red-300'
            }`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-md ${
                examResult.passed
                  ? 'bg-emerald-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {examResult.passed ? <Award size={36} /> : <XCircle size={36} />}
            </div>

            <div className="space-y-1">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  examResult.passed
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {examResult.passed ? t('test.passed') : t('test.failed')}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                Score: {examResult.percentage}% ({examResult.correctAnswers} / {examResult.totalQuestions} Correct)
              </h2>
              <p className="text-xs text-slate-500">
                Minimum qualification passing threshold: {test.passPercentage}%
              </p>
            </div>

            {/* Generated Certificate Banner */}
            {generatedCert && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl max-w-lg mx-auto space-y-3">
                <div className="flex items-center justify-center space-x-2 text-emerald-900 font-bold text-xs">
                  <Sparkles size={16} className="text-amber-500" />
                  <span>{t('test.certificateGenerated')} — {generatedCert.id}</span>
                </div>
                <p className="text-xs text-emerald-800">
                  Your official competency credential has been minted with an encrypted verification QR code.
                </p>
                <div className="flex justify-center gap-2 pt-1">
                  <Link
                    to={`/verify/${generatedCert.id}`}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{t('test.viewCertificate')}</span>
                    <ExternalLink size={13} />
                  </Link>
                  <Link
                    to="/trainee/certificates"
                    className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold rounded-xl text-xs"
                  >
                    All My Certificates
                  </Link>
                </div>
              </div>
            )}

            {!examResult.passed && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setSelectedAnswers({});
                    setSecondsRemaining(test.durationMinutes * 60);
                  }}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 mx-auto"
                >
                  <RotateCcw size={14} />
                  <span>{t('test.retake')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Scientific Explanations Review */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-6">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Award size={18} className="text-sky-700" />
              <span>{t('test.reviewAnswers')}</span>
            </h3>

            <div className="space-y-5">
              {randomizedQuestions.map((q, idx) => {
                const userAns = selectedAnswers[q.id];
                const isCorrect = userAns === q.correctAnswerIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border text-xs space-y-3 ${
                      isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-red-50/30 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-500">Q{idx + 1}.</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {i18n.language === 'hi' && q.questionHi ? q.questionHi : q.question}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
                          isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                      </span>
                    </div>

                    <div className="space-y-1.5 pl-4">
                      {q.options.map((opt, oIdx) => {
                        const optText = i18n.language === 'hi' && q.optionsHi ? q.optionsHi[oIdx] : opt;
                        const isSelected = userAns === oIdx;
                        const isTargetCorrect = q.correctAnswerIndex === oIdx;

                        return (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                              isTargetCorrect
                                ? 'bg-emerald-100/70 border-emerald-300 font-bold text-emerald-950'
                                : isSelected
                                ? 'bg-red-100/70 border-red-300 text-red-950 font-semibold'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <span>{optText}</span>
                            {isTargetCorrect && (
                              <span className="text-[10px] text-emerald-700 font-bold">
                                ✓ Correct Key
                              </span>
                            )}
                            {isSelected && !isTargetCorrect && (
                              <span className="text-[10px] text-red-600 font-bold">
                                ✗ Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Scientific Explanation */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 text-xs">
                      <strong className="text-sky-900 block mb-0.5">
                        Scientific Explanation:
                      </strong>
                      <p>{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE TEST QUESTION INTERFACE */}
      {!isSubmitted && !isOfflineQueued && currentQ && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200 space-y-6">
          {/* Question Stepper Indicator */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <span className="font-bold text-slate-500">
              {t('test.question')} <strong className="text-slate-900">{currentIndex + 1}</strong> {t('test.of')} {randomizedQuestions.length}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
              Difficulty: {currentQ.difficulty}
            </span>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {i18n.language === 'hi' && currentQ.questionHi ? currentQ.questionHi : currentQ.question}
            </h2>
          </div>

          {/* Options List */}
          <div className="space-y-2.5 text-xs">
            {currentQ.options.map((opt, oIdx) => {
              const optText = i18n.language === 'hi' && currentQ.optionsHi ? currentQ.optionsHi[oIdx] : opt;
              const isSelected = selectedAnswers[currentQ.id] === oIdx;

              return (
                <button
                  type="button"
                  key={oIdx}
                  onClick={() => handleSelectOption(currentQ.id, oIdx)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center space-x-3 transition-all ${
                    isSelected
                      ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-400 font-bold text-sky-950 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isSelected
                        ? 'bg-sky-600 text-white'
                        : 'border border-slate-300 text-slate-500 bg-white'
                    }`}
                  >
                    {String.fromCharCode(65 + oIdx)}
                  </div>
                  <span className="flex-1 text-xs leading-relaxed">{optText}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Stepper Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>{t('test.previous')}</span>
            </button>

            {currentIndex < randomizedQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
              >
                <span>{t('test.next')}</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              >
                <CheckCircle2 size={15} />
                <span>{t('test.submit')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
