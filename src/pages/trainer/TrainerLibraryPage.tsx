import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Library,
  Upload,
  Download,
  FileText,
  Video,
  Layers,
  Plus,
  Search,
  CheckCircle2,
  Sparkles,
  UploadCloud
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { useAuthStore } from '../../store/useAuthStore';
import { TrainerLibraryItem } from '../../types';

export const TrainerLibraryPage: React.FC = () => {
  const { t } = useTranslation();
  const { trainerLibrary, addTrainerLibraryItem } = useCourseStore();
  const { currentUser } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New item form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<'slides' | 'pdf' | 'notes' | 'video'>('slides');
  const [newCategory, setNewCategory] = useState('Radar Engineering');
  const [success, setSuccess] = useState(false);

  const categories = ['All', 'Radar Engineering', 'Cyclone Forecasting', 'Instrumentation', 'Nowcasting'];

  const filteredItems = trainerLibrary.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: TrainerLibraryItem = {
      id: `lib-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Official operational training material.',
      type: newType,
      fileSize: '18.4 MB',
      uploadedBy: currentUser?.name || 'Dr. Sunita Kulkarni',
      uploadedDate: new Date().toISOString().substring(0, 10),
      downloads: 1,
      category: newCategory
    };

    addTrainerLibraryItem(newItem);
    setShowUploadModal(false);
    setNewTitle('');
    setNewDescription('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002D62] via-slate-900 to-sky-950 p-6 sm:p-8 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={16} />
            <span>IMD Central Faculty Resource Bank</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Shared Trainer Library & Material Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            A peer-to-peer technical exchange repository where IMD instructors collaborate and share radar slide decks, Dvorak analysis cases, and instrument calibration guides.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all flex-shrink-0"
        >
          <Upload size={16} />
          <span>Upload Teaching Asset</span>
        </button>
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Resource successfully uploaded and synced to shared faculty cloud!</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search manuals, slide decks, or lecture recordings..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800"
          />
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold flex-shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Library Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                  {item.category}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{item.fileSize}</span>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 flex-shrink-0 mt-0.5">
                  {item.type === 'video' ? (
                    <Video size={20} className="text-purple-600" />
                  ) : item.type === 'slides' ? (
                    <Layers size={20} className="text-amber-600" />
                  ) : (
                    <FileText size={20} className="text-sky-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                <p className="font-medium text-slate-700 truncate max-w-[140px]">
                  {item.uploadedBy}
                </p>
                <p className="text-[10px] text-slate-400">{item.uploadedDate}</p>
              </div>

              <button
                onClick={() => {
                  alert(`Downloading asset: ${item.title}`);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download size={13} />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Upload Teaching Resource to Shared Library
            </h3>

            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. INSAT-3DR Rapid Scan Tropical Cyclone Analysis Deck"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Summarize key meteorological concepts covered..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Format Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="slides">PowerPoint Slide Deck</option>
                    <option value="pdf">Technical PDF Manual</option>
                    <option value="notes">Operational Notes & SOPs</option>
                    <option value="video">Recorded Video Case</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Domain</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="Radar Engineering">Radar Engineering</option>
                    <option value="Cyclone Forecasting">Cyclone Forecasting</option>
                    <option value="Instrumentation">Instrumentation</option>
                    <option value="Nowcasting">Nowcasting</option>
                  </select>
                </div>
              </div>

              <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-1 bg-slate-50">
                <UploadCloud size={24} className="text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Choose file or drag here</p>
                <p className="text-[10px] text-slate-400">PDF, PPTX, MP4 up to 250 MB</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Upload & Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
