import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap,
  Award,
  Layers,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Radio,
  FileCheck
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const TraineeProfileBuilderPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, updateProfile } = useAuthStore();

  const [qualifications, setQualifications] = useState<string[]>(
    currentUser?.qualifications || ['M.Sc. Atmospheric Science', 'Ph.D. Radar Meteorology']
  );
  const [newQual, setNewQual] = useState('');

  const [instruments, setInstruments] = useState<string[]>([
    'EEC S-Band Doppler Radar',
    'Vaisala RS41 Radiosonde Ground System',
    'Sutron Automatic Weather Station (AWS)'
  ]);
  const [newInstrument, setNewInstrument] = useState('');

  const [interests, setInterests] = useState<string[]>([
    'Nowcasting Severe Squall Lines',
    'Monsoon Low Pressure Systems',
    'Machine Learning for Precipitation Nowcast'
  ]);
  const [newInterest, setNewInterest] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddQual = () => {
    if (!newQual.trim()) return;
    setQualifications([...qualifications, newQual.trim()]);
    setNewQual('');
  };

  const handleAddInstrument = () => {
    if (!newInstrument.trim()) return;
    setInstruments([...instruments, newInstrument.trim()]);
    setNewInstrument('');
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    setInterests([...interests, newInterest.trim()]);
    setNewInterest('');
  };

  const handleSave = () => {
    if (currentUser) {
      updateProfile({
        qualifications
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
          Meteorological Competency Builder
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Professional Qualifications & Instrumentation Experience
        </h1>
        <p className="text-xs text-slate-500">
          Enrich your national profile to qualify for specialized radar and severe weather operational postings.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Competency details saved and synchronized with National HR Directory!</span>
        </div>
      )}

      {/* Qualifications Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
          <GraduationCap size={18} className="text-sky-700" />
          <span>Academic & Post-Graduate Degrees</span>
        </h2>

        <div className="space-y-2">
          {qualifications.map((q, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
            >
              <span className="font-semibold text-slate-800">{q}</span>
              <button
                type="button"
                onClick={() => setQualifications(qualifications.filter((_, i) => i !== idx))}
                className="text-slate-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newQual}
            onChange={(e) => setNewQual(e.target.value)}
            placeholder="Add qualification (e.g. M.Tech Atmospheric Sciences - IIT Delhi)..."
            className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl"
          />
          <button
            type="button"
            onClick={handleAddQual}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Instruments Handled */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
          <Radio size={18} className="text-sky-700" />
          <span>Meteorological Equipment & Instruments Calibrated</span>
        </h2>

        <div className="space-y-2">
          {instruments.map((inst, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
            >
              <span className="font-semibold text-slate-800">{inst}</span>
              <button
                type="button"
                onClick={() => setInstruments(instruments.filter((_, i) => i !== idx))}
                className="text-slate-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newInstrument}
            onChange={(e) => setNewInstrument(e.target.value)}
            placeholder="Add hardware (e.g. BEL Dual-Pol S-Band Radar, Pt100 RTD)..."
            className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl"
          />
          <button
            type="button"
            onClick={handleAddInstrument}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Operational Interests */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
          <FileCheck size={18} className="text-sky-700" />
          <span>Research Interests & Forecasting Domains</span>
        </h2>

        <div className="space-y-2">
          {interests.map((int, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
            >
              <span className="font-semibold text-slate-800">{int}</span>
              <button
                type="button"
                onClick={() => setInterests(interests.filter((_, i) => i !== idx))}
                className="text-slate-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            placeholder="Add interest (e.g. Flash Flood Guidance System, WRF Nesting)..."
            className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl"
          />
          <button
            type="button"
            onClick={handleAddInterest}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-md transition-colors"
        >
          <Save size={15} />
          <span>Save Competency Profile</span>
        </button>
      </div>
    </div>
  );
};
