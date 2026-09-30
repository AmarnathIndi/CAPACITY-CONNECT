import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  UploadCloud,
  FileText,
  CheckCircle2,
  XCircle,
  Edit3,
  Save,
  Check,
  X,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Award
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { useAuthStore } from '../../store/useAuthStore';
import { MCQQuestion, MCQTest } from '../../types';

interface DraftQuestion extends MCQQuestion {
  status: 'pending' | 'approved' | 'rejected';
}

const INITIAL_DRAFT_QUESTIONS: DraftQuestion[] = [
  {
    id: "ai-q-1",
    question: "What is the primary physical cause of radar beam attenuation in C-Band radars during intense monsoon squalls?",
    questionHi: "तीव्र मानसून स्क्वॉल के दौरान सी-बैंड रडार में रडार बीम क्षीणन का प्राथमिक भौतिक कारण क्या है?",
    options: [
      "Extinction of microwave energy by dense liquid water droplets along the propagation path",
      "Earth curvature diffraction",
      "Thermal expansion of antenna feedhorn",
      "Solar flare magnetic interference"
    ],
    optionsHi: [
      "प्रसार पथ के साथ घने तरल पानी की बूंदों द्वारा माइक्रोवेव ऊर्जा का विलुप्त होना",
      "पृथ्वी वक्रता विवर्तन",
      "एंटीना फीडहॉर्न का थर्मल विस्तार",
      "सौर चमक चुंबकीय हस्तक्षेप"
    ],
    correctAnswerIndex: 0,
    explanation: "At C-band wavelengths (5 cm), droplet absorption and scattering substantially attenuate radar pulse power through heavy rain cores.",
    difficulty: "Medium",
    status: "approved"
  },
  {
    id: "ai-q-2",
    question: "Which dual-polarization parameter provides an estimate of hydrometeor shape independent of radar calibration bias?",
    questionHi: "कौन सा दोहरा ध्रुवीकरण पैरामीटर रडार अंशांकन पूर्वाग्रह से स्वतंत्र हाइड्रोमिटिओर आकार का अनुमान प्रदान करता है?",
    options: [
      "Differential Phase Shift (PhiDP) and Specific Differential Phase (Kdp)",
      "Horizontal Reflectivity (Zh)",
      "Radial Velocity Spectrum Width",
      "Signal-to-Noise Ratio (SNR)"
    ],
    optionsHi: [
      "डिफरेंशियल फेज शिफ्ट (PhiDP) और विशिष्ट डिफरेंशियल फेज (Kdp)",
      "क्षैतिज परावर्तकता (Zh)",
      "रेडियल वेलोसिटी स्पेक्ट्रम चौड़ाई",
      "सिग्नल-टू-नॉइज़ अनुपात (SNR)"
    ],
    correctAnswerIndex: 0,
    explanation: "Phase measurements (PhiDP and Kdp) are propagation phase shifts and are completely immune to radar power calibration drifts and rain attenuation.",
    difficulty: "Hard",
    status: "approved"
  },
  {
    id: "ai-q-3",
    question: "What is the standard velocity de-aliasing technique applied when radial winds exceed the Nyquist velocity?",
    questionHi: "जब रेडियल हवाएं नाइक्विस्ट वेग से अधिक हो जाती हैं तो कौन सी मानक वेग डी-अलियासिंग तकनीक लागू की जाती है?",
    options: [
      "Dual Pulse Repetition Frequency (Dual-PRF) ratio method",
      "Increasing transmitter wattage",
      "Turning off receiver low noise amplifier",
      "Switching from S-band to X-band"
    ],
    optionsHi: [
      "दोहरा पल्स पुनरावृत्ति आवृत्ति (Dual-PRF) अनुपात विधि",
      "ट्रांसमीटर वाटेज बढ़ाना",
      "रिसीवर कम शोर एम्पलीफायर बंद करना",
      "एस-बैंड से एक्स-बैंड में बदलना"
    ],
    correctAnswerIndex: 0,
    explanation: "Staggered or dual-PRF operational modes resolve phase ambiguity by combining two distinct pulse rates to extend the unambiguous velocity interval.",
    difficulty: "Medium",
    status: "pending"
  },
  {
    id: "ai-q-4",
    question: "What does a high Correlation Coefficient (RhoHV > 0.98) in a convective radar cell indicate?",
    questionHi: "संवहनी रडार सेल में उच्च सहसंबंध गुणांक (RhoHV > 0.98) क्या दर्शाता है?",
    options: [
      "Pure, uniform meteorological precipitation (homogeneous raindrops)",
      "Giant tumbling dry hailstones mixed with debris",
      "Flock of migratory birds",
      "Radar electronic receiver jamming"
    ],
    optionsHi: [
      "शुद्ध, एकसमान मौसम संबंधी वर्षा (सजातीय वर्षा की बूंदें)",
      "मलबे के साथ विशाल सूखे ओले",
      "प्रवासी पक्षियों का झुंड",
      "रडार इलेक्ट्रॉनिक रिसीवर जैमिंग"
    ],
    correctAnswerIndex: 0,
    explanation: "Correlation coefficients above 0.98 demonstrate uniform spherical raindrops; non-meteorological targets or mixed phase hail cause RhoHV to plunge below 0.85.",
    difficulty: "Easy",
    status: "approved"
  },
  {
    id: "ai-q-5",
    question: "Under WMO and IMD protocols, what is the maximum recommended time interval between volumetric radar scans during severe cyclonic surveillance?",
    questionHi: "WMO और IMD प्रोटोकॉल के तहत, गंभीर चक्रवाती निगरानी के दौरान वॉल्यूमेट्रिक रडार स्कैन के बीच अधिकतम अनुशंसित समय अंतराल क्या है?",
    options: [
      "10 to 15 minutes (Volume Scan Strategy)",
      "60 minutes",
      "120 minutes",
      "Once every 6 hours"
    ],
    optionsHi: [
      "10 से 15 मिनट (वॉल्यूम स्कैन रणनीति)",
      "60 मिनट",
      "120 मिनट",
      "प्रत्येक 6 घंटे में एक बार"
    ],
    correctAnswerIndex: 0,
    explanation: "Operational Volume Scan Strategies (VCP) run complete elevation sweeps in 10 to 15 minute cycles to capture fast-evolving eyewalls and rainbands.",
    difficulty: "Easy",
    status: "approved"
  },
  {
    id: "ai-q-6",
    question: "What signature on the Plan Position Indicator (PPI) Velocity indicates a severe microburst downdraft approaching ground level?",
    questionHi: "प्लान पोजिशन इंडिकेटर (PPI) वेग पर कौन सा हस्ताक्षर जमीन के करीब पहुंचने वाले गंभीर माइक्रोबर्स्ट डाउनड्राफ्ट को इंगित करता है?",
    options: [
      "Strong divergent radial velocity pattern centered near the surface",
      "Convergent cyclonic rotation aloft at 12 km",
      "Uniform zero velocity across all azimuths",
      "Random speckle noise"
    ],
    optionsHi: [
      "सतह के पास केंद्रित मजबूत अपसारी रेडियल वेग पैटर्न",
      "12 किमी पर ऊपर अभिसारी चक्रवाती घूर्णन",
      "सभी अज़ीमुथों में एकसमान शून्य वेग",
      "यादृच्छिक धब्बा शोर"
    ],
    correctAnswerIndex: 0,
    explanation: "When a downdraft impacts the surface, it spreads out radially, creating strong divergent velocity signatures (inbound on one side, outbound on the opposite).",
    difficulty: "Medium",
    status: "approved"
  },
  {
    id: "ai-q-7",
    question: "What is the primary function of the Radar Clutter Map filter?",
    questionHi: "रडार क्लटर मैप फ़िल्टर का प्राथमिक कार्य क्या है?",
    options: [
      "To suppress stationary ground echoes (buildings, hills, towers) using zero-Doppler notch filtering",
      "To artificially increase echo reflectivity",
      "To eliminate cloud returns",
      "To track aircraft transponders"
    ],
    optionsHi: [
      "शून्य-डॉपलर पायदान फ़िल्टरिंग का उपयोग करके स्थिर जमीनी गूँज (इमारतों, पहाड़ियों, टावरों) को दबाने के लिए",
      "प्रतिध्वनि परावर्तकता को कृत्रिम रूप से बढ़ाने के लिए",
      "बादलों की वापसी को समाप्त करने के लिए",
      "विमान ट्रांसपोंडर को ट्रैक करने के लिए"
    ],
    correctAnswerIndex: 0,
    explanation: "Ground clutter filters remove stationary targets characterized by near-zero radial velocity and zero spectrum width without distorting moving precipitation echoes.",
    difficulty: "Easy",
    status: "approved"
  },
  {
    id: "ai-q-8",
    question: "Which thermodynamic level in the tropical troposphere is identified by the 'Bright Band' on vertical radar cross-sections?",
    questionHi: "ऊर्ध्वाधर रडार क्रॉस-सेक्शन पर 'ब्राइट बैंड' द्वारा उष्णकटिबंधीय क्षोभमंडल में कौन सा थर्मोडायनामिक स्तर पहचाना जाता है?",
    options: [
      "The Melting Layer (0°C Isotherm) where falling snowflakes melt into liquid-coated particles",
      "The Tropopause inversion level",
      "The Lifted Condensation Level (LCL)",
      "The planetary boundary layer cap"
    ],
    optionsHi: [
      "मेल्टिंग लेयर (0°C इज़ोथर्म) जहां गिरते हुए बर्फ के टुकड़े तरल-लेपित कणों में पिघलते हैं",
      "क्षोभसीमा व्युत्क्रमण स्तर",
      "उठाया संघनन स्तर (LCL)",
      "ग्रहीय सीमा परत कैप"
    ],
    correctAnswerIndex: 0,
    explanation: "Water-coated melting snowflakes have a large dielectric constant and aggregate size, causing high radar reflectivity in a narrow band just below 0°C.",
    difficulty: "Medium",
    status: "approved"
  }
];

export const TrainerAITestGenPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addTest } = useCourseStore();

  const [step, setStep] = useState<'upload' | 'generating' | 'review'>('upload');
  const [selectedFile, setSelectedFile] = useState<string>('IMD_Doppler_Weather_Radar_Manual_Rev4.pdf');
  const [progress, setProgress] = useState(0);
  const [generationMsg, setGenerationMsg] = useState('Extracting meteorological specifications...');
  const [draftQuestions, setDraftQuestions] = useState<DraftQuestion[]>(INITIAL_DRAFT_QUESTIONS);
  const [editingQuestion, setEditingQuestion] = useState<DraftQuestion | null>(null);
  const [testSavedModal, setTestSavedModal] = useState(false);
  const [savedTestId, setSavedTestId] = useState('');

  const handleStartGeneration = () => {
    setStep('generating');
    setProgress(15);
    setGenerationMsg('Reading technical meteorological manual...');

    setTimeout(() => {
      setProgress(40);
      setGenerationMsg('Extracting radar equations, Dvorak metrics, and calibration theorems...');
    }, 1000);

    setTimeout(() => {
      setProgress(75);
      setGenerationMsg('Drafting 8 IMD standard MCQs with verified answer keys...');
    }, 2000);

    setTimeout(() => {
      setProgress(100);
      setGenerationMsg('Completed! Formatting review cards with difficulty levels...');
      setTimeout(() => setStep('review'), 500);
    }, 3000);
  };

  const handleApprove = (id: string) => {
    setDraftQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'approved' } : q))
    );
  };

  const handleReject = (id: string) => {
    setDraftQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'rejected' } : q))
    );
  };

  const handleSaveQuestionEdit = (updated: DraftQuestion) => {
    setDraftQuestions((prev) =>
      prev.map((q) => (q.id === updated.id ? updated : q))
    );
    setEditingQuestion(null);
  };

  const handleCommitTestPaper = () => {
    const approvedOnly = draftQuestions.filter((q) => q.status === 'approved');
    if (approvedOnly.length === 0) return;

    const newTestId = `tst-ai-${Date.now()}`;
    const newTest: MCQTest = {
      id: newTestId,
      courseId: 'crs-dwr-101',
      courseTitle: 'Doppler Weather Radar (DWR) Principles & Severe Storm Nowcasting',
      title: 'AI Generated: Advanced Radar & Severe Storm Assessment Paper',
      titleHi: 'एआई निर्मित: उन्नत रडार एवं गंभीर तूफान मूल्यांकन प्रश्नपत्र',
      durationMinutes: 15,
      totalQuestions: approvedOnly.length,
      passPercentage: 70,
      deadline: '2026-12-31',
      isAIgenerated: true,
      questions: approvedOnly.map(({ status, ...q }) => q)
    };

    addTest(newTest);
    setSavedTestId(newTestId);
    setTestSavedModal(true);
  };

  const approvedCount = draftQuestions.filter((q) => q.status === 'approved').length;
  const rejectedCount = draftQuestions.filter((q) => q.status === 'rejected').length;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-[#002D62] p-6 sm:p-8 rounded-3xl text-white shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
          <Sparkles size={16} className="text-amber-400" />
          <span>IMD Intelligent Curriculum Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          AI Examination Paper Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Upload an operational manual, technical bulletin, or research paper. The AI extracts scientific concepts, formulates 8-10 validated multiple-choice questions with answer keys, and lets you approve or edit them.
        </p>
      </div>

      {/* STEP 1: UPLOAD PDF STEP */}
      {step === 'upload' && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xs border border-slate-200 text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto border-2 border-purple-300">
              <UploadCloud size={32} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Upload Technical Document or Choose IMD Manual
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Supports PDF, DOCX, and meteorological text bulletins up to 50 MB
              </p>
            </div>

            {/* Document Select Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <label className="block font-bold text-slate-700">
                Select Meteorological Source Document:
              </label>
              <select
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800"
              >
                <option value="IMD_Doppler_Weather_Radar_Manual_Rev4.pdf">
                  📄 IMD_Doppler_Weather_Radar_Manual_Rev4.pdf (14.2 MB)
                </option>
                <option value="INSAT_3D_Cyclone_Tracking_Handbook_2024.pdf">
                  📄 INSAT_3D_Cyclone_Tracking_Handbook_2024.pdf (22.5 MB)
                </option>
                <option value="AWS_Surface_Telemetry_Calibration_SOP.pdf">
                  📄 AWS_Surface_Telemetry_Calibration_SOP.pdf (8.1 MB)
                </option>
              </select>
            </div>

            <button
              onClick={handleStartGeneration}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-700 to-sky-700 hover:from-purple-800 hover:to-sky-800 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all mx-auto"
            >
              <Sparkles size={16} />
              <span>Generate Examination Questions with AI</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: GENERATING STATE ANIMATION */}
      {step === 'generating' && (
        <div className="bg-white p-12 sm:p-16 rounded-3xl shadow-lg border border-purple-200 text-center space-y-6 max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center mx-auto border-4 border-purple-300 animate-spin">
            <Sparkles size={36} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              Generating Competency Questions...
            </h2>
            <p className="text-xs text-purple-800 font-semibold">{generationMsg}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
            <div
              className="bg-gradient-to-r from-purple-600 to-sky-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <span className="text-xs font-mono font-bold text-slate-500">{progress}% Completed</span>
        </div>
      )}

      {/* STEP 3: REVIEW, EDIT, APPROVE / REJECT DRAFT QUESTIONS */}
      {step === 'review' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Review Bar */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Review & Approve Draft Questions ({draftQuestions.length} Formulated)
              </h2>
              <p className="text-xs text-slate-500">
                Source Document: <strong className="text-purple-900">{selectedFile}</strong>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-xs font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                  Approved: {approvedCount}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800">
                  Rejected: {rejectedCount}
                </span>
              </div>

              <button
                onClick={handleCommitTestPaper}
                disabled={approvedCount === 0}
                className="px-5 py-2.5 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md disabled:opacity-40 transition-colors"
              >
                <Save size={15} />
                <span>Save Approved ({approvedCount}) to Test</span>
              </button>
            </div>
          </div>

          {/* Questions Cards List */}
          <div className="space-y-4">
            {draftQuestions.map((q, idx) => {
              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all text-xs space-y-3 ${
                    q.status === 'approved'
                      ? 'bg-white border-emerald-300 ring-2 ring-emerald-100'
                      : q.status === 'rejected'
                      ? 'bg-slate-100 border-slate-300 opacity-50'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-400">Q{idx + 1}.</span>
                      <span className="font-bold text-slate-900 text-sm">{q.question}</span>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.difficulty === 'Easy'
                            ? 'bg-emerald-100 text-emerald-800'
                            : q.difficulty === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {q.difficulty}
                      </span>

                      {/* Approval Status Badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          q.status === 'approved'
                            ? 'bg-emerald-600 text-white'
                            : q.status === 'rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                          oIdx === q.correctAnswerIndex
                            ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>
                          <strong className="text-slate-400 mr-1.5">{String.fromCharCode(65 + oIdx)}.</strong>
                          {opt}
                        </span>
                        {oIdx === q.correctAnswerIndex && (
                          <span className="text-[10px] text-emerald-700 font-bold">✓ Key</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-600 text-xs">
                    <strong className="text-slate-800 block mb-0.5">Scientific Key Explanation:</strong>
                    <p>{q.explanation}</p>
                  </div>

                  {/* Trainer Approval Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setEditingQuestion(q)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1"
                    >
                      <Edit3 size={13} />
                      <span>Edit Question</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReject(q.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                          q.status === 'rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        <X size={13} />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleApprove(q.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                          q.status === 'approved'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <Check size={13} />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Edit Draft Question
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question Text</label>
                <textarea
                  rows={2}
                  value={editingQuestion.question}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>

              {editingQuestion.options.map((opt, oIdx) => (
                <div key={oIdx}>
                  <label className="block font-semibold text-slate-600 mb-0.5">
                    Option {String.fromCharCode(65 + oIdx)}
                  </label>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...editingQuestion.options];
                      newOpts[oIdx] = e.target.value;
                      setEditingQuestion({ ...editingQuestion, options: newOpts });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Correct Option Index
                  </label>
                  <select
                    value={editingQuestion.correctAnswerIndex}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        correctAnswerIndex: Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value={0}>Option A</option>
                    <option value={1}>Option B</option>
                    <option value={2}>Option C</option>
                    <option value={3}>Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={editingQuestion.difficulty}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        difficulty: e.target.value as any
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveQuestionEdit(editingQuestion)}
                className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Saved Confirmation Modal */}
      {testSavedModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Examination Paper Published!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your AI-generated paper containing {approvedCount} approved questions is now active in the National Test Registry.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                to={`/trainee/test/${savedTestId}`}
                className="w-full py-2.5 px-4 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-xl text-xs shadow-md transition-colors"
              >
                Take Test as Trainee Now →
              </Link>
              <button
                onClick={() => navigate('/trainer/dashboard')}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs"
              >
                Back to Trainer Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
