import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Video,
  FileText,
  UploadCloud,
  ChevronLeft,
  Users,
  AlertCircle,
  Star
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Course, CourseModule, CourseTrainer } from '../../types';
import { Avatar } from '../../components/common/Avatar';

export const TrainerCourseCreatePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addCourse } = useCourseStore();
  const { currentUser, users } = useAuthStore();

  const availableTrainers = users.filter((u) => u.role === 'trainer');

  const [title, setTitle] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [code, setCode] = useState('CRS-RAD-105');
  const [category, setCategory] = useState<'Radar' | 'Cyclone' | 'NWP' | 'AWS' | 'Aviation' | 'Satellite' | 'Agromet'>('Radar');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [duration, setDuration] = useState('12 hours');
  const [description, setDescription] = useState('');
  const [descriptionHi, setDescriptionHi] = useState('');

  // Trainer team selection (minimum 3 required)
  const [selectedTrainerIds, setSelectedTrainerIds] = useState<string[]>(() => {
    if (currentUser?.role === 'trainer') {
      return [currentUser.id];
    }
    return availableTrainers.slice(0, 1).map((t) => t.id);
  });
  const [leadTrainerId, setLeadTrainerId] = useState<string>(() => {
    return currentUser?.role === 'trainer' ? currentUser.id : availableTrainers[0]?.id || 'usr-trainer-1';
  });
  const [trainerError, setTrainerError] = useState<string>('');

  const [modules, setModules] = useState<CourseModule[]>([
    {
      id: 'mod-new-1',
      title: 'Module 1: Meteorological Fundamentals & Sensor Principles',
      type: 'video',
      contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: '45 mins',
      transcript: [
        { time: '00:00', text: 'Introduction to standard operational procedures.', textHi: 'मानक परिचालन प्रक्रियाओं का परिचय।' }
      ]
    }
  ]);

  const [newModTitle, setNewModTitle] = useState('');
  const [newModType, setNewModType] = useState<'video' | 'pdf' | 'notes'>('video');
  const [newModDuration, setNewModDuration] = useState('30 mins');
  const [success, setSuccess] = useState(false);

  const toggleTrainerSelection = (trainerId: string) => {
    setTrainerError('');
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

  const handleAddModule = () => {
    if (!newModTitle.trim()) return;
    const newMod: CourseModule = {
      id: `mod-${Date.now()}`,
      title: newModTitle.trim(),
      type: newModType,
      contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration: newModDuration,
      notesContent: 'Operational guidelines and scientific notes.'
    };
    setModules([...modules, newMod]);
    setNewModTitle('');
  };

  const handleRemoveModule = (id: string) => {
    setModules(modules.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (selectedTrainerIds.length < 3) {
      setTrainerError('Select at least 3 trainers.');
      return;
    }

    const courseTrainers: CourseTrainer[] = selectedTrainerIds.map((tid) => {
      const trUser = availableTrainers.find((u) => u.id === tid);
      const isLead = tid === leadTrainerId;
      return {
        trainerId: tid,
        trainerName: trUser?.name || 'Trainer Faculty',
        role: isLead ? 'Lead' : 'Co-trainer',
        designation: trUser?.designation || 'Meteorologist',
        office: trUser?.office || 'IMD Office',
        skills: trUser?.skills ? trUser.skills.map((s: any) => typeof s === 'string' ? s : s.name) : ['Meteorology'],
        rating: 4.8
      };
    });

    const leadTrainer = courseTrainers.find((t) => t.role === 'Lead') || courseTrainers[0];

    const newCourse: Course = {
      id: `crs-${Date.now()}`,
      code,
      title: title.trim(),
      titleHi: titleHi.trim() || title.trim(),
      description: description.trim(),
      descriptionHi: descriptionHi.trim() || description.trim(),
      category,
      level,
      duration,
      trainerId: leadTrainer.trainerId,
      trainerName: leadTrainer.trainerName,
      trainers: courseTrainers,
      thumbnail: 'https://images.unsplash.com/photo-1590552515252-3a5a1bce7bed?w=600&auto=format&fit=crop&q=80',
      enrolledUsers: [],
      completedUsers: [],
      modules,
      ratings: [],
      tags: [category, 'Operational Training', 'IMD']
    };

    addCourse(newCourse);
    setSuccess(true);
    setTimeout(() => navigate('/trainer/dashboard'), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
            Curriculum Authoring
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Publish New Meteorological Course
          </h1>
          <p className="text-xs text-slate-500">
            Define curriculum, upload study material, and configure lessons for IMD staff.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Course successfully registered and published to the National Course Catalog!</span>
        </div>
      )}

      {/* Main Course Form */}
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Course Metadata & Classification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Course Title (English)</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced C-Band Radar Calibration Protocols"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Course Title (हिन्दी)</label>
              <input
                type="text"
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                placeholder="e.g. उन्नत सी-बैंड रडार अंशांकन प्रोटोकॉल"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Discipline</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="Radar">Radar</option>
                  <option value="Cyclone">Cyclone</option>
                  <option value="NWP">NWP</option>
                  <option value="AWS">AWS</option>
                  <option value="Satellite">Satellite</option>
                  <option value="Aviation">Aviation</option>
                  <option value="Agromet">Agromet</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 14 hours"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-700">
                  Instructional Faculty Team ({selectedTrainerIds.length} selected, minimum 3 required) *
                </label>
                <span className={`text-[11px] font-bold ${selectedTrainerIds.length >= 3 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {selectedTrainerIds.length >= 3 ? '✓ Minimum requirement met' : 'Requires at least 3 trainers'}
                </span>
              </div>

              {trainerError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2">
                  <AlertCircle size={15} className="text-red-600 shrink-0" />
                  <span>{trainerError}</span>
                </div>
              )}

              <p className="text-[11px] text-slate-500">
                Select 3 or more IMD faculty members. Mark one as the Lead Trainer who will moderate live sessions and sign certificates.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-slate-50">
                {availableTrainers.map((tr) => {
                  const isSelected = selectedTrainerIds.includes(tr.id);
                  const isLead = leadTrainerId === tr.id;
                  return (
                    <div
                      key={tr.id}
                      className={`p-2.5 rounded-xl border text-xs transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white border-sky-500 shadow-xs'
                          : 'bg-white/60 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center space-x-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleTrainerSelection(tr.id)}
                            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 mt-0.5 cursor-pointer"
                            id={`trainer-chk-${tr.id}`}
                          />
                          <Avatar size="sm" />
                          <label htmlFor={`trainer-chk-${tr.id}`} className="cursor-pointer min-w-0">
                            <p className="font-bold text-slate-900 truncate">{tr.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{tr.designation || 'Faculty'}</p>
                            <p className="text-[10px] text-sky-700 font-semibold truncate">{tr.office}</p>
                          </label>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                          {isLead ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              Lead Trainer
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setLeadTrainerId(tr.id)}
                              className="text-[10px] text-slate-500 hover:text-sky-700 underline font-medium"
                            >
                              Set as Lead
                            </button>
                          )}
                          <span className="text-[10px] text-slate-400">Selected</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Technical Overview (English)</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline operational competencies, radar physics principles, and forecasting exercises..."
              className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 text-xs"
            />
          </div>
        </div>

        {/* Modules Builder */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <BookOpen size={16} className="text-sky-700" />
            <span>Curriculum Modules & Lessons ({modules.length})</span>
          </h2>

          <div className="space-y-2">
            {modules.map((m, idx) => (
              <div
                key={m.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-slate-400">#{idx + 1}</span>
                  <div>
                    <p className="font-bold text-slate-900">{m.title}</p>
                    <p className="text-[10px] text-slate-500 capitalize">
                      {m.type} • {m.duration}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveModule(m.id)}
                  className="text-slate-400 hover:text-red-600 p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Module Row */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 block text-xs">+ Add Lesson Module</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={newModTitle}
                onChange={(e) => setNewModTitle(e.target.value)}
                placeholder="Lesson title (e.g. PPI Velocity Interpretation)..."
                className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
              <select
                value={newModType}
                onChange={(e) => setNewModType(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
              >
                <option value="video">Video Lecture</option>
                <option value="pdf">PDF Manual</option>
                <option value="notes">Station Notes</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddModule}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Add Lesson to Syllabus</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
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
            <span>Publish Course to Portal</span>
          </button>
        </div>
      </form>
    </div>
  );
};
