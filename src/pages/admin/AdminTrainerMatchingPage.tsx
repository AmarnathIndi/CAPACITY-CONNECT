import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Star,
  CheckCircle2,
  XCircle,
  Radio,
  Send,
  UserCheck,
  Award,
  ChevronRight,
  Users,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuditStore } from '../../store/useAuditStore';
import { LiveSession, CourseTrainer } from '../../types';
import { Avatar } from '../../components/common/Avatar';

export const AdminTrainerMatchingPage: React.FC = () => {
  const { t } = useTranslation();
  const { sessions, addSession } = useCourseStore();
  const { users, currentUser } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { logAction } = useAuditStore();

  const [topic, setTopic] = useState('Doppler Radar Operations');
  const [sessionDate, setSessionDate] = useState('2026-10-18');
  const [sessionTime, setSessionTime] = useState('14:00 - 16:00 IST');
  const [targetRegion, setTargetRegion] = useState('Southern & Coastal Region');
  const [language, setLanguage] = useState('English');
  const [successNotice, setSuccessNotice] = useState('');
  const [validationError, setValidationError] = useState('');

  // Find all trainers
  const trainers = users.filter((u) => u.role === 'trainer' && u.status === 'active');

  // Compute matching score for each trainer
  const rankedTrainers = trainers.map((tr) => {
    let score = 72;
    // Skill match
    if (tr.skills.some((s) => s.name.toLowerCase().includes(topic.toLowerCase().split(' ')[0]))) {
      score += 18;
    }
    // Language match
    if (tr.languagePreferences.includes(language)) {
      score += 5;
    }
    // High rating
    if (tr.rating && tr.rating >= 4.8) {
      score += 4;
    }

    return {
      ...tr,
      matchScore: Math.min(99, score)
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  // Selected trainer team (default to top 3)
  const [selectedTrainerIds, setSelectedTrainerIds] = useState<string[]>(() =>
    rankedTrainers.slice(0, 3).map((t) => t.id)
  );
  const [leadTrainerId, setLeadTrainerId] = useState<string>(() =>
    rankedTrainers[0]?.id || ''
  );

  const toggleTrainerSelection = (trainerId: string) => {
    setValidationError('');
    if (selectedTrainerIds.includes(trainerId)) {
      const updated = selectedTrainerIds.filter((id) => id !== trainerId);
      setSelectedTrainerIds(updated);
      if (leadTrainerId === trainerId && updated.length > 0) {
        setLeadTrainerId(updated[0]);
      }
    } else {
      setSelectedTrainerIds([...selectedTrainerIds, trainerId]);
    }
  };

  // Calculate composite team score
  const selectedTrainerObjects = rankedTrainers.filter((t) => selectedTrainerIds.includes(t.id));
  const teamScore = selectedTrainerObjects.length > 0
    ? Math.round(selectedTrainerObjects.reduce((acc, t) => acc + t.matchScore, 0) / selectedTrainerObjects.length)
    : 0;

  const handleInviteTeam = () => {
    setValidationError('');
    if (selectedTrainerIds.length < 3) {
      setValidationError('Select at least 3 trainers.');
      return;
    }

    const sessionTrainers: CourseTrainer[] = selectedTrainerObjects.map((tr) => ({
      trainerId: tr.id,
      trainerName: tr.name,
      role: tr.id === leadTrainerId ? 'Lead' : 'Co-trainer',
      designation: tr.designation,
      office: tr.office,
      rating: tr.rating || 4.8,
      skills: tr.skills.map((s) => s.name),
      status: 'invited'
    }));

    const leadTrainer = sessionTrainers.find((t) => t.role === 'Lead') || sessionTrainers[0];
    const newSessionId = `ses-${Date.now()}`;
    const newSession: LiveSession = {
      id: newSessionId,
      title: `${topic} Masterclass`,
      titleHi: `${topic} मास्टरक्लास`,
      trainerId: leadTrainer.trainerId,
      trainerName: leadTrainer.trainerName || '',
      trainers: sessionTrainers,
      date: sessionDate,
      time: sessionTime,
      duration: '90 mins',
      office: leadTrainer.office || 'IMD HQ',
      status: 'invited',
      attendees: ['usr-trainee-1', 'usr-trainee-2', 'usr-trainee-3'],
      hasTranscript: false,
      topic,
      targetRegion,
      language
    };

    addSession(newSession);

    // Notify all selected trainers
    sessionTrainers.forEach((tr) => {
      addNotification({
        userId: tr.trainerId,
        title: `Masterclass Team Assignment: ${topic}`,
        titleHi: `मास्टरक्लास टीम असाइनमेंट: ${topic}`,
        message: `National Training Directorate has invited you as ${tr.role} for "${topic}" on ${sessionDate}. Please respond.`,
        type: 'session',
        link: '/trainer/invitations'
      });
    });

    logAction(
      currentUser?.name || 'Dr. M. Mohapatra',
      'Admin',
      'TRAINER_TEAM_INVITE_DISPATCHED',
      sessionTrainers.map((t) => t.trainerName).join(', '),
      `Dispatched live training team invitation to ${sessionTrainers.length} trainers for: ${topic} on ${sessionDate}`
    );

    setSuccessNotice(`Official team invitation dispatched to ${sessionTrainers.length} faculty members (Lead: ${leadTrainer.trainerName})! Status: INVITED.`);
    setTimeout(() => setSuccessNotice(''), 5000);
  };

  // Helper to toggle trainer status inside session (for demo/simulation)
  const toggleTrainerStatusInSession = (sessionId: string, trainerId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'accepted' ? 'declined' : currentStatus === 'invited' ? 'accepted' : 'invited';
    const targetSession = sessions.find((s) => s.id === sessionId);
    if (!targetSession || !targetSession.trainers) return;

    const updatedTrainers = targetSession.trainers.map((t) =>
      t.trainerId === trainerId ? { ...t, status: nextStatus as any } : t
    );
    const acceptedCount = updatedTrainers.filter((t) => t.status === 'accepted').length;
    targetSession.trainers = updatedTrainers;
    targetSession.status = acceptedCount >= 3 ? 'scheduled' : 'invited';

    // persist to localStorage
    const saved = localStorage.getItem('capacity_connect_sessions');
    if (saved) {
      try {
        const parsed: LiveSession[] = JSON.parse(saved);
        const updated = parsed.map((s) => (s.id === sessionId ? targetSession : s));
        localStorage.setItem('capacity_connect_sessions', JSON.stringify(updated));
      } catch (e) {}
    }
    setSuccessNotice(`Updated trainer status to ${nextStatus.toUpperCase()}. Session status recalculated.`);
    setTimeout(() => setSuccessNotice(''), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#002D62] via-slate-900 to-sky-950 p-6 sm:p-8 rounded-3xl text-white shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles size={16} />
          <span>Faculty Multi-Trainer Allocation System</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Automated Trainer Matching & Team Session Scheduling
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Plan upcoming regional capacity workshops. The system matches a multi-faculty team of 3+ instructors, calculates composite team competency scores, and coordinates multi-trainer session confirmations.
        </p>
      </div>

      {successNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {validationError && (
        <div className="p-3.5 bg-red-50 border border-red-300 rounded-2xl text-xs text-red-900 flex items-center gap-2 animate-in fade-in">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Plan Training Parameters Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Calendar size={18} className="text-sky-700" />
          <span>{t('admin.planTraining')}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Training Subject / Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium"
            >
              <option value="Doppler Radar Operations">Doppler Radar Operations</option>
              <option value="Tropical Cyclone Tracking">Tropical Cyclone Tracking</option>
              <option value="AWS Calibration & Maintenance">AWS Calibration & Maintenance</option>
              <option value="Numerical Weather Prediction">Numerical Weather Prediction</option>
              <option value="Aviation METAR Hazard Reporting">Aviation METAR Hazard Reporting</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Regional Audience</label>
            <select
              value={targetRegion}
              onChange={(e) => setTargetRegion(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium"
            >
              <option value="Northern Region">Northern Region (Delhi / HP / J&K)</option>
              <option value="Southern & Coastal Region">Southern & Coastal Region (Chennai RMC)</option>
              <option value="North Eastern Region">North Eastern Region (Guwahati NEC)</option>
              <option value="Western Region">Western Region (Mumbai RMC)</option>
              <option value="Eastern Region">Eastern Region (Kolkata RMC)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Instruction Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Tamil">Tamil</option>
              <option value="Bengali">Bengali</option>
              <option value="Assamese">Assamese</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Planned Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Team Composite Score & One-Click Invite Bar */}
      <div className="bg-gradient-to-r from-sky-900 via-[#002D62] to-slate-900 p-6 rounded-3xl text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Users size={18} className="text-amber-400" />
            <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
              Selected Instructional Team: {selectedTrainerIds.length} Faculty Members
            </span>
          </div>
          <h3 className="text-xl font-bold">
            Team Composite Match Score: <span className="text-amber-400">{teamScore}%</span>
          </h3>
          <p className="text-xs text-slate-300">
            {selectedTrainerIds.length >= 3
              ? '✓ Team meets mandatory 3+ faculty policy. One-click invitation will notify all selected trainers.'
              : '⚠️ Policy requires at least 3 trainers before dispatching official session invites.'}
          </p>
        </div>

        <button
          onClick={handleInviteTeam}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-md transition-all flex-shrink-0"
        >
          <Send size={15} />
          <span>One-Click Invite Faculty Team ({selectedTrainerIds.length})</span>
        </button>
      </div>

      {/* Ranked Trainer Matches */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            <span>Suggested Faculty Matches ({rankedTrainers.length} Evaluated)</span>
          </h2>
          <span className="text-xs text-slate-500">Pick 3 or more trainers to form the session instructional team</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rankedTrainers.map((tr, idx) => {
            const isSelected = selectedTrainerIds.includes(tr.id);
            const isLead = leadTrainerId === tr.id;

            return (
              <div
                key={tr.id}
                className={`p-6 rounded-3xl border shadow-xs flex flex-col justify-between space-y-4 bg-white transition-all ${
                  isSelected
                    ? 'border-sky-500 ring-2 ring-sky-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar size="md" />
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900">{tr.name}</h3>
                        <p className="text-[11px] text-slate-500">{tr.designation}</p>
                        <p className="text-[10px] text-sky-700 font-semibold">{tr.office}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                          tr.matchScore >= 90
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {tr.matchScore}% Match
                      </span>
                    </div>
                  </div>

                  {/* Score Breakdown Pills */}
                  <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Instructor Rating:</span>
                      <span className="font-bold text-amber-600">★ {tr.rating || 4.9} / 5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Languages:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                        {tr.languagePreferences.join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Weekly Availability:</span>
                      <span className="text-emerald-700 font-bold">Slot Available</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Domain Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {tr.skills.slice(0, 4).map((s) => (
                        <span
                          key={s.name}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleTrainerSelection(tr.id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-sky-50 text-sky-800 border border-sky-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ In Team' : '+ Add to Team'}
                  </button>

                  {isSelected && (
                    <button
                      type="button"
                      onClick={() => setLeadTrainerId(tr.id)}
                      className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-colors ${
                        isLead
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isLead ? 'Lead' : 'Make Lead'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dispatched Sessions Status Tracker */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Session Invitations Status Tracker ({sessions.length})
            </h2>
            <p className="text-xs text-slate-500">
              Sessions are confirmed on the National Calendar when at least 3 trainers have accepted.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Real-time sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3 pl-3">Session Title</th>
                <th className="pb-3">Instructional Team (Status per Trainer)</th>
                <th className="pb-3">Date & Time</th>
                <th className="pb-3">Calendar Status</th>
                <th className="pb-3 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((ses) => {
                const trainersList = ses.trainers && ses.trainers.length > 0
                  ? ses.trainers
                  : [
                      {
                        trainerId: ses.trainerId,
                        trainerName: ses.trainerName,
                        role: 'Lead' as const,
                        status: ses.status === 'scheduled' ? 'accepted' as const : 'invited' as const
                      }
                    ];

                const acceptedCount = trainersList.filter((t) => t.status === 'accepted').length;
                const isConfirmed = acceptedCount >= 3 || ses.status === 'scheduled';

                return (
                  <tr key={ses.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 pl-3">
                      <p className="font-bold text-slate-900">{ses.title}</p>
                      <p className="text-[10px] text-slate-500">{ses.topic || 'Meteorological Training'}</p>
                    </td>

                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {trainersList.map((tr, i) => {
                          const trStatus = tr.status || (ses.status === 'scheduled' ? 'accepted' : 'invited');
                          return (
                            <button
                              key={tr.trainerId || i}
                              type="button"
                              onClick={() => toggleTrainerStatusInSession(ses.id, tr.trainerId, trStatus)}
                              title="Click to toggle status (Demo simulation)"
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 cursor-pointer transition-colors ${
                                trStatus === 'accepted'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : trStatus === 'declined'
                                  ? 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
                                  : 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100'
                              }`}
                            >
                              <span>{tr.trainerName || tr.name}</span>
                              <span className="font-bold">
                                ({tr.role === 'Lead' ? 'Lead: ' : ''}{trStatus})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 text-slate-500">
                      {ses.date} ({ses.time})
                    </td>

                    <td className="py-3.5">
                      {isConfirmed ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-fit">
                          <CheckCircle2 size={12} className="text-emerald-700" />
                          <span>Confirmed on Calendar ({acceptedCount}/3+ accepted)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 w-fit">
                          <AlertCircle size={12} className="text-amber-700" />
                          <span>Needs more trainers ({acceptedCount}/3 accepted)</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 pr-3 text-right">
                      <Link
                        to={`/live-session/${ses.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        <Radio size={12} />
                        <span>Enter Room</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
