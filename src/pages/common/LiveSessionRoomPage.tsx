import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  MessageSquare,
  Users,
  Hand,
  CheckCircle2,
  Sparkles,
  Volume2,
  FileText,
  Send,
  Radio
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { useAuthStore } from '../../store/useAuthStore';

export const LiveSessionRoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { sessions } = useCourseStore();
  const { currentUser } = useAuthStore();

  const session = sessions.find((s) => s.id === id) || sessions[0];

  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<'chat' | 'participants'>('chat');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Dr. Sunita Kulkarni', text: 'Welcome colleagues. We are examining the radar sweep from Chennai S-band radar.', time: '14:31' },
    { sender: 'Dr. Ramesh Kumar Yadav', text: 'Co-trainer checking in. Velocity de-aliasing is enabled for 0.5 m/s resolution.', time: '14:32' },
    { sender: 'Priya Nair', text: 'The reflectivity couplet is showing 55 dBZ aloft at 8km height.', time: '14:33' }
  ]);
  const [newMsg, setNewMsg] = useState('');
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(145);

  useEffect(() => {
    const timer = setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setChatMessages([
      ...chatMessages,
      {
        sender: currentUser?.name || 'Observer Officer',
        text: newMsg.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setNewMsg('');
  };

  const handleEndSession = () => {
    setShowSavedModal(true);
  };

  const sessionTrainers = session.trainers && session.trainers.length > 0
    ? session.trainers
    : [
        {
          trainerId: session.trainerId || 'tr1',
          trainerName: session.trainerName || 'Dr. Sunita Kulkarni',
          role: 'Lead' as const,
          office: session.office || 'New Delhi HQ'
        },
        {
          trainerId: 'tr2',
          trainerName: 'Dr. Ramesh Kumar Yadav',
          role: 'Co-trainer' as const,
          office: 'Mumbai RMC'
        },
        {
          trainerId: 'tr3',
          trainerName: 'Karthik Subramanian',
          role: 'Co-trainer' as const,
          office: 'Chennai RMC'
        }
      ];

  const leadTrainer = sessionTrainers.find((t) => t.role === 'Lead') || sessionTrainers[0];
  const coTrainers = sessionTrainers.filter((t) => (t.trainerId || t.name) !== (leadTrainer.trainerId || leadTrainer.name));

  const participantList = [
    // Lead Trainer & Moderator
    {
      name: leadTrainer.trainerName || leadTrainer.name,
      role: 'Moderator (Lead Trainer)',
      office: leadTrainer.office || 'HQ',
      isLead: true,
      isCoTrainer: false,
      mic: true,
      isSpeaking: true
    },
    // Co-Trainers
    ...coTrainers.map((tr, idx) => ({
      name: tr.trainerName || tr.name,
      role: 'Co-trainer (Faculty)',
      office: tr.office || 'Regional Centre',
      isLead: false,
      isCoTrainer: true,
      mic: idx === 0,
      isSpeaking: false
    })),
    // Trainees
    { name: 'Priya Nair', role: 'Trainee', office: 'Chennai RMC', isLead: false, isCoTrainer: false, mic: false, isSpeaking: false },
    { name: 'Rituparna Bora', role: 'Trainee', office: 'Guwahati NEC', isLead: false, isCoTrainer: false, mic: false, isSpeaking: false },
    { name: 'Vikram Chauhan', role: 'Trainee', office: 'Kolkata RMC', isLead: false, isCoTrainer: false, mic: false, isSpeaking: false },
    { name: currentUser?.name || 'Current Officer', role: 'Participant', office: currentUser?.office || 'HQ', isLead: false, isCoTrainer: false, mic: micOn, isSpeaking: false }
  ];

  return (
    <div className="h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] flex flex-col bg-slate-950 text-white overflow-hidden relative">
      {/* Top Session Bar */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full text-xs font-bold border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>LIVE</span>
            <span className="font-mono text-slate-300">{formatTimer(elapsedSeconds)}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-1">
                {session.title}
              </h2>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                Moderator: {leadTrainer.trainerName || leadTrainer.name}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Assigned Faculty ({sessionTrainers.length}): {sessionTrainers.map((t) => t.trainerName || t.name).join(', ')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
            ● Auto-Attendance Enabled
          </span>
          <button
            onClick={handleEndSession}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <PhoneOff size={14} />
            <span>Leave Session</span>
          </button>
        </div>
      </div>

      {/* Main Video Grid and Side Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Jitsi-Style Video Grid: Plain blank boxes with name labels only */}
        <div className="flex-1 p-3 sm:p-4 grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto bg-slate-950">
          {participantList.map((p, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl overflow-hidden bg-slate-900 border flex flex-col items-center justify-center shadow-lg transition-all min-h-[160px] ${
                p.isSpeaking ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-800'
              }`}
            >
              {/* Plain blank box with subtle neutral center circle - NO photos */}
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/95 p-4">
                <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700/80" />
                {p.isSpeaking && (
                  <div className="absolute top-3 right-3 p-1.5 rounded-full bg-emerald-500 text-white shadow-md">
                    <Volume2 size={13} className="animate-pulse" />
                  </div>
                )}
              </div>

              {/* Bottom Label Overlay */}
              <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded-lg bg-black/75 backdrop-blur-xs flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="font-bold text-slate-100 truncate">{p.name}</span>
                  {p.isLead && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Moderator
                    </span>
                  )}
                  {p.isCoTrainer && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      Faculty
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0 text-slate-300">
                  {p.mic ? (
                    <Mic size={12} className="text-emerald-400" />
                  ) : (
                    <MicOff size={12} className="text-red-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Collapsible Side Panel (Chat & Attendance) */}
        <div className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col flex-shrink-0">
          {/* Panel Tabs */}
          <div className="flex border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveSidePanel('chat')}
              className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeSidePanel === 'chat'
                  ? 'border-sky-500 text-sky-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare size={14} />
              <span>Session Chat</span>
            </button>
            <button
              onClick={() => setActiveSidePanel('participants')}
              className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeSidePanel === 'participants'
                  ? 'border-sky-500 text-sky-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users size={14} />
              <span>Attendance ({participantList.length})</span>
            </button>
          </div>

          {/* Panel Content */}
          {activeSidePanel === 'chat' ? (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 p-3 space-y-3 overflow-y-auto text-xs">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-sky-400">{msg.sender}</span>
                      <span className="text-slate-400">{msg.time}</span>
                    </div>
                    <p className="text-slate-200 leading-snug">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Send a technical query to host..."
                  className="flex-1 text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition-colors"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          ) : (
            /* Automatic Attendance List */
            <div className="flex-1 p-4 space-y-3 overflow-y-auto text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>Real-time Attendance Registry</span>
                </p>
                <p className="text-[10px] text-emerald-200/80">
                  Staff participation is automatically recorded towards annual IMD competency compliance.
                </p>
              </div>

              <div className="space-y-2">
                {participantList.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-100">{p.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {p.office} • {p.role}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      Present
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="h-18 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-center space-x-3 sm:space-x-4 flex-shrink-0 z-10">
        <button
          onClick={() => setMicOn(!micOn)}
          className={`p-3 rounded-full text-white transition-all ${
            micOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
          }`}
          title={micOn ? 'Mute' : 'Unmute'}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        <button
          onClick={() => setVideoOn(!videoOn)}
          className={`p-3 rounded-full text-white transition-all ${
            videoOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
          }`}
          title={videoOn ? 'Stop Camera' : 'Start Camera'}
        >
          {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        <button
          onClick={() => setScreenSharing(!screenSharing)}
          className={`p-3 rounded-full text-white transition-all ${
            screenSharing ? 'bg-sky-600' : 'bg-slate-700 hover:bg-slate-600'
          }`}
          title="Share Screen"
        >
          <ScreenShare size={20} />
        </button>

        <button
          onClick={() => setHandRaised(!handRaised)}
          className={`p-3 rounded-full text-white transition-all ${
            handRaised ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-700 hover:bg-slate-600'
          }`}
          title="Raise Hand"
        >
          <Hand size={20} />
        </button>

        <button
          onClick={handleEndSession}
          className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-md"
          title="End Session"
        >
          <PhoneOff size={20} />
        </button>
      </div>

      {/* Confirmation Modal when Leaving / Ending */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">Session Concluded</h3>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 leading-relaxed font-semibold">
                {t('live.recordingNotice')}
              </div>
              <p className="text-xs text-slate-400">
                Attendance register with 6 verified officers has been transmitted to National HQ Training Registry.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate('/trainee/catalog')}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
              >
                Return to Course Catalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
