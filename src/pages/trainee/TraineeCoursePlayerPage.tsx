import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  BookOpen,
  FileText,
  Video,
  Award,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  DownloadCloud
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { useOfflineStore } from '../../store/useOfflineStore';
import { CourseModule } from '../../types';

export const TraineeCoursePlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { courses } = useCourseStore();
  const { isCourseSavedOffline, toggleSaveOfflineCourse } = useOfflineStore();

  const course = courses.find((c) => c.id === id) || courses[0];
  const [selectedModule, setSelectedModule] = useState<CourseModule>(course.modules[0]);
  const [activeTab, setActiveTab] = useState<'video' | 'pdf' | 'notes'>('video');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('02:30');
  const [transcriptLang, setTranscriptLang] = useState<'en' | 'hi'>('en');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (timestamp: string) => {
    setCurrentTime(timestamp);
    // Parse time MM:SS
    const [min, sec] = timestamp.split(':').map(Number);
    if (videoRef.current) {
      videoRef.current.currentTime = min * 60 + (sec || 0);
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDownloadOffline = () => {
    toggleSaveOfflineCourse(course.id);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const isOfflineSaved = isCourseSavedOffline(course.id);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <Link
            to={`/trainee/course/${course.id}`}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            title="Back to Course Details"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                {course.code}
              </span>
              <span className="text-xs text-slate-500">{course.category}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 line-clamp-1">
              {i18n.language === 'hi' && course.titleHi ? course.titleHi : course.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadOffline}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              isOfflineSaved
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <DownloadCloud size={15} />
            <span>{isOfflineSaved ? 'Downloaded Offline' : 'Save for Offline'}</span>
          </button>

          {course.testId && (
            <Link
              to={`/trainee/test/${course.testId}`}
              className="px-4 py-2 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Award size={15} className="text-amber-400" />
              <span>{t('courses.takeTest')}</span>
            </Link>
          )}
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Module slides, audio stream, and notes successfully saved to local offline cache!</span>
        </div>
      )}

      {/* Main Player Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Player / PDF Viewer (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Viewer Tabs */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'video'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video size={14} />
              <span>Lecture Video Player</span>
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'pdf'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={14} />
              <span>Manuals & Slides Viewer</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'notes'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen size={14} />
              <span>Field Notes & SOPs</span>
            </button>
          </div>

          {/* Tab 1: Video Player */}
          {activeTab === 'video' && (
            <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
              <div className="relative aspect-video flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={selectedModule.contentUrl}
                  poster={course.thumbnail}
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Big Center Play Overlay if paused */}
                {!isPlaying && (
                  <button
                    onClick={togglePlay}
                    className="absolute w-16 h-16 rounded-full bg-[#002D62]/80 hover:bg-[#002D62] text-white flex items-center justify-center shadow-2xl backdrop-blur-xs transition-transform hover:scale-110"
                  >
                    <Play size={28} className="ml-1" />
                  </button>
                )}
              </div>

              {/* Video Controls Bar */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <span className="font-mono text-xs">{currentTime} / 45:00</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-sky-400">
                    1080p HD
                  </span>
                  <a
                    href={selectedModule.downloadUrl || '#'}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDownloadOffline();
                    }}
                    className="p-1.5 hover:text-white rounded hover:bg-slate-800 flex items-center gap-1 text-[11px]"
                    title="Download video lecture for offline use"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Offline</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: PDF Viewer Simulation */}
          {activeTab === 'pdf' && (
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedModule.title}</h3>
                  <p className="text-xs text-slate-500">Document viewer: IMD Operational Technical Manual</p>
                </div>
                <button
                  onClick={handleDownloadOffline}
                  className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Download size={14} />
                  <span>Download PDF Document</span>
                </button>
              </div>

              {/* Document Reader Mockup */}
              <div className="bg-slate-100 rounded-xl p-8 border border-slate-300 min-h-[380px] space-y-4 text-xs font-serif leading-relaxed text-slate-800 shadow-inner">
                <div className="text-center space-y-1 pb-4 border-b border-slate-300">
                  <h2 className="font-extrabold text-base text-[#002D62]">
                    INDIA METEOROLOGICAL DEPARTMENT
                  </h2>
                  <p className="text-[11px] uppercase tracking-wider text-slate-600 font-sans">
                    DIRECTORATE GENERAL OF METEOROLOGY, NEW DELHI
                  </p>
                  <p className="text-xs font-bold text-slate-900 font-sans">{selectedModule.title}</p>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <p className="font-bold text-slate-900">1. Scope and Technical Standard</p>
                  <p>
                    This technical document establishes standard operational protocols for radar calibration, pulse repetition frequency (PRF) adjustment, and velocity de-aliasing across all coastal and inland Doppler Weather Radar stations in India.
                  </p>
                  <p className="font-bold text-slate-900">2. Reflectivity Computation (Rayleigh Regime)</p>
                  <p>
                    Radar backscatter cross section per unit volume is calculated using Rayleigh approximation where raindrop diameter D is much smaller than wavelength lambda. Reflectivity factor Z = sum(D^6).
                  </p>
                  <p className="font-bold text-slate-900">3. Severe Squall Line Warning Protocol</p>
                  <p>
                    Whenever radar core reflectivity exceeds 50 dBZ with echo tops extending above 10 km, duty meteorologists are mandated to trigger color-coded Orange or Red nowcasts to district disaster authorities within 15 minutes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Notes Viewer */}
          {activeTab === 'notes' && (
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Station Notes & Operational SOPs</h3>
                <button
                  onClick={handleDownloadOffline}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Save Notes Offline</span>
                </button>
              </div>

              <div className="bg-amber-50/70 p-5 rounded-xl border border-amber-200 text-xs text-amber-950 font-mono whitespace-pre-wrap leading-relaxed">
                {selectedModule.notesContent ||
                  'STANDARD OPERATING PROCEDURE (SOP) FOR ISSUING 3-HOUR NOWCAST:\n1. Monitor radar echoes exceeding 40 dBZ moving toward urban centers.\n2. Verify surface AWS station wind gusts (>45 km/h) and rapid pressure drops.\n3. Issue color-coded alert: Orange (Be Prepared) if echo tops > 10 km, Red (Take Action) if hail core detected (>55 dBZ).'}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Modules List & Interactive Synchronized Transcript (1 Col) */}
        <div className="space-y-6">
          {/* Synchronized Transcript Box */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles size={14} className="text-sky-600" />
                <span>{t('courses.transcript')}</span>
              </h3>

              {/* Transcript Language Toggle */}
              <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-[11px] font-semibold">
                <button
                  onClick={() => setTranscriptLang('en')}
                  className={`px-2 py-0.5 rounded ${
                    transcriptLang === 'en' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setTranscriptLang('hi')}
                  className={`px-2 py-0.5 rounded ${
                    transcriptLang === 'hi' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            {/* Transcript Snippets */}
            <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
              {selectedModule.transcript && selectedModule.transcript.length > 0 ? (
                selectedModule.transcript.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSeek(item.time)}
                    className="p-2.5 rounded-xl hover:bg-sky-50 transition-colors cursor-pointer border border-transparent hover:border-sky-200 group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-sky-700 font-mono font-bold mb-1">
                      <span>⏱️ {item.time}</span>
                      <span className="text-slate-400 group-hover:text-sky-700">Click to seek →</span>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed">
                      {transcriptLang === 'hi' ? item.textHi : item.text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 p-3 text-center">
                  Transcript being processed for this lesson.
                </p>
              )}
            </div>
          </div>

          {/* Module Selector List */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
              Course Modules Curriculum
            </h3>

            <div className="space-y-2">
              {course.modules.map((m, idx) => {
                const isCurrent = m.id === selectedModule.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModule(m);
                      if (m.type === 'video') setActiveTab('video');
                      else if (m.type === 'pdf') setActiveTab('pdf');
                      else setActiveTab('notes');
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start space-x-2.5 ${
                      isCurrent
                        ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${
                        isCurrent ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold">{m.title}</p>
                      <p className="text-[10px] text-slate-500 capitalize">
                        {m.type} • {m.duration}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
