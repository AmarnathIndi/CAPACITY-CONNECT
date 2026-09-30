import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileQuestion,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { MCQQuestion, MCQTest } from '../../types';

export const TrainerTestCreatePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { courses, addTest } = useCourseStore();

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || 'crs-dwr-101');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [passPercentage, setPassPercentage] = useState(70);
  const [deadline, setDeadline] = useState('2026-12-31');

  const [questions, setQuestions] = useState<MCQQuestion[]>([
    {
      id: 'q-manual-1',
      question: 'What is the operational frequency range of IMD S-Band Doppler Radars?',
      questionHi: 'आईएमडी एस-बैंड डॉपलर रडार की परिचालन आवृत्ति सीमा क्या है?',
      options: ['2.7 to 3.0 GHz', '9.3 to 9.5 GHz', '5.2 to 5.4 GHz', '1.2 to 1.4 GHz'],
      optionsHi: ['2.7 से 3.0 GHz', '9.3 से 9.5 GHz', '5.2 से 5.4 GHz', '1.2 से 1.4 GHz'],
      correctAnswerIndex: 0,
      explanation: 'Coastal S-band radar stations operate in the 2.7 to 3.0 GHz window for minimal atmospheric attenuation.',
      difficulty: 'Easy'
    }
  ]);

  const [newQText, setNewQText] = useState('');
  const [newOptA, setNewOptA] = useState('');
  const [newOptB, setNewOptB] = useState('');
  const [newOptC, setNewOptC] = useState('');
  const [newOptD, setNewOptD] = useState('');
  const [newCorrectIdx, setNewCorrectIdx] = useState(0);
  const [newExplanation, setNewExplanation] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [success, setSuccess] = useState(false);

  const handleAddQuestion = () => {
    if (!newQText.trim() || !newOptA.trim() || !newOptB.trim()) return;

    const newQ: MCQQuestion = {
      id: `q-man-${Date.now()}`,
      question: newQText.trim(),
      questionHi: newQText.trim(),
      options: [newOptA.trim(), newOptB.trim(), newOptC.trim() || 'Option C', newOptD.trim() || 'Option D'],
      optionsHi: [newOptA.trim(), newOptB.trim(), newOptC.trim() || 'Option C', newOptD.trim() || 'Option D'],
      correctAnswerIndex: newCorrectIdx,
      explanation: newExplanation.trim() || 'Scientific verification key.',
      difficulty: newDifficulty
    };

    setQuestions([...questions, newQ]);
    setNewQText('');
    setNewOptA('');
    setNewOptB('');
    setNewOptC('');
    setNewOptD('');
    setNewExplanation('');
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || questions.length === 0) return;

    const targetCourse = courses.find((c) => c.id === courseId);

    const testId = `tst-man-${Date.now()}`;
    const newTest: MCQTest = {
      id: testId,
      courseId,
      courseTitle: targetCourse?.title || 'Operational Meteorological Course',
      title: title.trim(),
      titleHi: title.trim(),
      durationMinutes: Number(durationMinutes),
      totalQuestions: questions.length,
      passPercentage: Number(passPercentage),
      deadline,
      questions
    };

    addTest(newTest);
    setSuccess(true);
    setTimeout(() => navigate('/trainer/dashboard'), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
            Examination Designer
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Design Multiple-Choice Examination Paper
          </h1>
          <p className="text-xs text-slate-500">
            Author questions, set passing percentage thresholds, and establish operational deadlines.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>MCQ Examination Paper registered and published to the National Assessment Registry!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Metadata Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Assessment Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Examination Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. S-Band Radar Calibration & Clutter Mapping Qualification Exam"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Associated Course</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Examination Deadline</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Time Limit (Minutes)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Passing Mark (%)</label>
              <input
                type="number"
                value={passPercentage}
                onChange={(e) => setPassPercentage(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Existing Questions List */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Configured Questions ({questions.length})</span>
          </h2>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <span className="font-bold text-slate-900 text-xs">
                    Q{idx + 1}. {q.question}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-slate-400 hover:text-red-600 ml-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-1.5 rounded-lg border ${
                        oIdx === q.correctAnswerIndex
                          ? 'bg-emerald-100/70 border-emerald-300 font-bold text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + oIdx)}. {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Row */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 block">+ Add New Question</span>

            <div>
              <label className="block text-slate-600 mb-1">Question Text</label>
              <input
                type="text"
                value={newQText}
                onChange={(e) => setNewQText(e.target.value)}
                placeholder="e.g. What is the standard beam elevation angle for CAPPI 1.0 km?"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newOptA}
                onChange={(e) => setNewOptA(e.target.value)}
                placeholder="Option A"
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
              />
              <input
                type="text"
                value={newOptB}
                onChange={(e) => setNewOptB(e.target.value)}
                placeholder="Option B"
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
              />
              <input
                type="text"
                value={newOptC}
                onChange={(e) => setNewOptC(e.target.value)}
                placeholder="Option C"
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
              />
              <input
                type="text"
                value={newOptD}
                onChange={(e) => setNewOptD(e.target.value)}
                placeholder="Option D"
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Correct Answer</label>
                <select
                  value={newCorrectIdx}
                  onChange={(e) => setNewCorrectIdx(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                  <option value={2}>Option C</option>
                  <option value={3}>Option D</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Difficulty</label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <input
              type="text"
              value={newExplanation}
              onChange={(e) => setNewExplanation(e.target.value)}
              placeholder="Scientific rationale / manual reference..."
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Add Question</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/trainer/dashboard')}
            className="px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#002D62] hover:bg-[#0A2540] text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
          >
            <Save size={15} />
            <span>Publish Examination Paper</span>
          </button>
        </div>
      </form>
    </div>
  );
};
