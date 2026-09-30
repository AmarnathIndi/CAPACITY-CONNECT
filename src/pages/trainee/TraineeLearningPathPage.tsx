import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Layers,
  Lock,
  Unlock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  ChevronRight
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { useAuthStore } from '../../store/useAuthStore';

interface LearningPathStep {
  courseId: string;
  code: string;
  title: string;
  titleHi: string;
  category: string;
  stepNumber: number;
  prerequisiteId?: string;
}

export const TraineeLearningPathPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { courses } = useCourseStore();
  const { currentUser } = useAuthStore();

  const [activeTrack, setActiveTrack] = useState<'radar' | 'telemetry' | 'aviation'>('radar');

  const radarTrack: LearningPathStep[] = [
    {
      courseId: 'crs-dwr-101',
      code: 'CRS-DWR-101',
      title: 'Doppler Weather Radar (DWR) Principles & Severe Storm Nowcasting',
      titleHi: 'डॉपलर मौसम रडार (DWR) सिद्धांत एवं नाउकास्टिंग',
      category: 'Radar',
      stepNumber: 1
    },
    {
      courseId: 'crs-cyc-201',
      code: 'CRS-CYC-201',
      title: 'Tropical Cyclone Monitoring, Tracking & Dvorak Technique',
      titleHi: 'उष्णकटिबंधीय चक्रवात निगरानी, ट्रैकिंग एवं ड्वोरक तकनीक',
      category: 'Cyclone',
      stepNumber: 2,
      prerequisiteId: 'crs-dwr-101'
    },
    {
      courseId: 'crs-nwp-301',
      code: 'CRS-NWP-301',
      title: 'Numerical Weather Prediction (NWP) Models & Ensemble Forecasting',
      titleHi: 'संख्यात्मक मौसम भविष्यवाणी (NWP) मॉडल एवं एन्सेम्बल',
      category: 'NWP',
      stepNumber: 3,
      prerequisiteId: 'crs-cyc-201'
    },
    {
      courseId: 'crs-mon-302',
      code: 'CRS-MON-302',
      title: 'South Asian Summer Monsoon Dynamics & Extreme Precipitation Forecasting',
      titleHi: 'दक्षिण एशियाई ग्रीष्मकालीन मानसून गतिकी एवं अत्यधिक वर्षा',
      category: 'Radar',
      stepNumber: 4,
      prerequisiteId: 'crs-nwp-301'
    }
  ];

  const telemetryTrack: LearningPathStep[] = [
    {
      courseId: 'crs-aws-102',
      code: 'CRS-AWS-102',
      title: 'Automatic Weather Station (AWS) Maintenance & Sensor Calibration',
      titleHi: 'स्वचालित मौसम स्टेशन (AWS) रखरखाव एवं सेंसर अंशांकन',
      category: 'AWS',
      stepNumber: 1
    },
    {
      courseId: 'crs-sat-202',
      code: 'CRS-SAT-202',
      title: 'Satellite Meteorology with INSAT-3D & 3DR Imagers/Sounders',
      titleHi: 'इनसैट-3डी एवं 3डीआर इमेजर्स/साउंडर्स के साथ उपग्रह मौसम विज्ञान',
      category: 'Satellite',
      stepNumber: 2,
      prerequisiteId: 'crs-aws-102'
    },
    {
      courseId: 'crs-agr-103',
      code: 'CRS-AGR-103',
      title: 'District Agrometeorological Advisory Services (DAMAS) & GKMS',
      titleHi: 'जिला कृषि मौसम विज्ञान सलाहकार सेवाएं एवं ग्रामीण कृषि मौसम सेवा',
      category: 'Agromet',
      stepNumber: 3,
      prerequisiteId: 'crs-sat-202'
    }
  ];

  const currentSteps = activeTrack === 'radar' ? radarTrack : telemetryTrack;

  const isStepCompleted = (courseId: string) => {
    const crs = courses.find((c) => c.id === courseId);
    return currentUser && crs?.completedUsers.includes(currentUser.id);
  };

  const isStepUnlocked = (step: LearningPathStep, index: number) => {
    if (index === 0) return true;
    const prevStep = currentSteps[index - 1];
    return isStepCompleted(prevStep.courseId);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002D62] via-slate-900 to-sky-900 rounded-3xl p-6 sm:p-8 text-white shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles size={16} />
          <span>Role-Based Career Progression</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Personalized Meteorological Learning Path
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Sequential competency mastery: Complete foundational certifications to unlock advanced operational training courses.
        </p>

        {/* Track Selector Tabs */}
        <div className="pt-3 flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setActiveTrack('radar')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTrack === 'radar'
                ? 'bg-sky-500 text-white shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            Track A: Severe Weather Nowcasting & Cyclones
          </button>
          <button
            onClick={() => setActiveTrack('telemetry')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTrack === 'telemetry'
                ? 'bg-sky-500 text-white shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            Track B: Observational Telemetry & Satellite Remote Sensing
          </button>
        </div>
      </div>

      {/* Sequential Roadmap */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200 space-y-8">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {activeTrack === 'radar'
              ? 'Severe Storm Nowcaster & Cyclone Specialist Roadmap'
              : 'Surface Telemetry & Remote Sensing Specialist Roadmap'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step curriculum with prerequisite enforcement
          </p>
        </div>

        {/* Step Nodes */}
        <div className="relative space-y-6 before:absolute before:inset-0 before:left-6 before:w-1 before:bg-slate-200 before:z-0">
          {currentSteps.map((step, idx) => {
            const completed = isStepCompleted(step.courseId);
            const unlocked = isStepUnlocked(step, idx);

            return (
              <div
                key={step.courseId}
                className={`relative z-10 flex items-start space-x-4 p-5 rounded-2xl border transition-all ${
                  completed
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : unlocked
                    ? 'bg-white border-sky-400 shadow-md ring-2 ring-sky-100'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                {/* Node Indicator */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0 ${
                    completed
                      ? 'bg-emerald-600 text-white'
                      : unlocked
                      ? 'bg-sky-600 text-white animate-pulse'
                      : 'bg-slate-300 text-slate-600'
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 size={24} />
                  ) : unlocked ? (
                    <Unlock size={22} />
                  ) : (
                    <Lock size={20} />
                  )}
                </div>

                {/* Step Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/5 text-slate-600 uppercase">
                        Step {step.stepNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                        {step.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{step.category}</span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        completed
                          ? 'bg-emerald-100 text-emerald-800'
                          : unlocked
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {completed ? '✓ Mastered' : unlocked ? '● In Progress' : '🔒 Locked'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {i18n.language === 'hi' && step.titleHi ? step.titleHi : step.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {completed
                      ? 'You have successfully satisfied the competency requirements and passed the qualification test.'
                      : unlocked
                      ? 'All prerequisites fulfilled. Enroll and complete study modules to proceed to the next milestone.'
                      : `Requires completion of previous course (${step.prerequisiteId?.toUpperCase()}) before unlocking.`}
                  </p>

                  <div className="pt-2">
                    {unlocked ? (
                      <Link
                        to={`/trainee/course/${step.courseId}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        <BookOpen size={14} />
                        <span>{completed ? 'Review Course Material' : 'Launch Course'}</span>
                        <ArrowRight size={13} />
                      </Link>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-500 italic">
                        Prerequisite Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
