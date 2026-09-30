import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Compass,
  Search,
  Filter,
  ShieldCheck,
  Star,
  MapPin,
  Globe,
  Award,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import skillsData from '../../data/skills.json';
import { Avatar } from '../../components/common/Avatar';

export const AdminSkillExpertFinderPage: React.FC = () => {
  const { t } = useTranslation();
  const { users } = useAuthStore();

  const [query, setQuery] = useState('Who knows Doppler radar?');
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);

  // Search matching algorithm
  const sampleQueries = [
    'Who knows Doppler radar?',
    'Who knows Tropical Cyclone Tracking?',
    'AWS Station Calibration specialist',
    'Numerical Weather Prediction (NWP)'
  ];

  const cleanQuery = query.toLowerCase().replace(/who knows|who has|specialist|\?/g, '').trim();

  const rankedExperts = users
    .filter((u) => u.status === 'active')
    .map((u) => {
      // Calculate match score
      let matchScore = 0;
      let matchedSkillName = '';

      u.skills.forEach((s) => {
        if (
          cleanQuery &&
          (s.name.toLowerCase().includes(cleanQuery) ||
            cleanQuery.includes(s.name.toLowerCase().split(' ')[0]))
        ) {
          matchScore += s.level === 'Expert' ? 95 : s.level === 'Intermediate' ? 80 : 65;
          if (s.verified) matchScore += 5;
          matchedSkillName = s.name;
        }
      });

      // Bonus for trainers or high ratings
      if (u.role === 'trainer') matchScore += 10;
      if (u.rating && u.rating >= 4.8) matchScore += 5;

      // Default base score for broad exploration
      if (!cleanQuery) {
        matchScore = Math.round(75 + (u.points / 5000) * 20);
      }

      return {
        ...u,
        matchScore: Math.min(99, Math.max(45, matchScore)),
        primaryMatchedSkill: matchedSkillName || u.skills[0]?.name || 'Meteorology'
      };
    })
    .filter((u) => (selectedOffice === 'all' ? true : u.office.includes(selectedOffice)))
    .filter((u) => (selectedLanguage === 'all' ? true : u.languagePreferences.includes(selectedLanguage)))
    .filter((u) => (minRating > 0 ? (u.rating || 4.5) >= minRating : true))
    .sort((a, b) => b.matchScore - a.matchScore);

  const getHeatmapColor = (score: number, target: number) => {
    const gap = target - score;
    if (gap <= 0) return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    if (gap <= 10) return 'bg-amber-100 text-amber-900 border-amber-300';
    return 'bg-red-100 text-red-900 border-red-300 font-bold';
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002D62] via-slate-900 to-sky-950 p-6 sm:p-8 rounded-3xl text-white shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles size={16} />
          <span>IMD National Talent Intelligence & Skill Matrix</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Meteorological Skill Graph & Expert Finder
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Instantly query technical competencies across all Regional Centres. Find verified radar operators, cyclone specialists, and identify regional skill-gaps.
        </p>
      </div>

      {/* Query Search Bar */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search expertise (e.g. 'Who knows Doppler radar?', 'Tropical Cyclone Tracking')..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-sky-300 focus:ring-2 focus:ring-sky-500 font-medium text-xs sm:text-sm text-slate-900 shadow-xs"
          />
          <Search size={18} className="absolute left-3.5 top-3.5 text-sky-700" />
        </div>

        {/* Suggested Queries Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 no-scrollbar">
          <span className="text-slate-400 font-semibold mr-1 flex-shrink-0">Try Query:</span>
          {sampleQueries.map((sq) => (
            <button
              key={sq}
              onClick={() => setQuery(sq)}
              className="px-3 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-800 rounded-lg text-slate-700 font-medium flex-shrink-0 border border-slate-200"
            >
              💡 {sq}
            </button>
          ))}
        </div>

        {/* Multi-Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-slate-500 font-bold mb-1">Regional Office</label>
            <select
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="all">All Regional Centres</option>
              <option value="New Delhi">New Delhi HQ</option>
              <option value="Chennai">Chennai RMC</option>
              <option value="Guwahati">Guwahati NEC</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Operational Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="all">Any Language</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Tamil">Tamil</option>
              <option value="Bengali">Bengali</option>
              <option value="Assamese">Assamese</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Minimum Instructor Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value={0}>Any Rating</option>
              <option value={4.5}>★ 4.5+ Stars</option>
              <option value={4.8}>★ 4.8+ Stars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ranked Search Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass size={18} className="text-sky-700" />
            <span>Ranked Meteorological Experts ({rankedExperts.length} Found)</span>
          </h2>
          <span className="text-xs text-slate-500">Sorted by verified skill match score</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rankedExperts.map((exp, idx) => (
            <div
              key={exp.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-sky-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar size="md" name={exp.name} />
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{exp.name}</h3>
                      <p className="text-[11px] text-slate-500">{exp.designation}</p>
                      <p className="text-[10px] text-sky-700 font-semibold">{exp.office}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                      {exp.matchScore}% Match
                    </span>
                  </div>
                </div>

                {/* Verified Skills Pills */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Verified Competencies
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {exp.skills.map((s) => (
                      <span
                        key={s.name}
                        className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-medium"
                      >
                        {s.name} ({s.level})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex justify-between">
                    <span>Languages:</span>
                    <span className="font-semibold text-slate-800">
                      {exp.languagePreferences.join(', ')}
                    </span>
                  </div>
                  {exp.rating && (
                    <div className="flex justify-between">
                      <span>Trainer Rating:</span>
                      <span className="font-bold text-amber-600">★ {exp.rating} / 5</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => alert(`Connecting with expert ${exp.name} (${exp.email})`)}
                  className="w-full py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Initiate Consultation / Schedule</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Skill-Gap Heatmap Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown size={18} className="text-amber-600" />
              <span>Regional Office Skill-Gap Heatmap</span>
            </h2>
            <p className="text-xs text-slate-500">
              Evaluated current score vs mandated target competency score (Target = 85 - 95)
            </p>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-emerald-800">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400"></span> Target Met
            </span>
            <span className="flex items-center gap-1 text-amber-800">
              <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400"></span> Moderate Gap
            </span>
            <span className="flex items-center gap-1 text-red-800">
              <span className="w-3 h-3 rounded bg-red-100 border border-red-400"></span> Critical Deficit
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                <th className="p-3">Station Office</th>
                <th className="p-3 text-center">Doppler Radar</th>
                <th className="p-3 text-center">Cyclone Tracking</th>
                <th className="p-3 text-center">NWP Models</th>
                <th className="p-3 text-center">AWS Telemetry</th>
                <th className="p-3 text-center">Aviation Weather</th>
                <th className="p-3 text-center">Satellite INSAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {skillsData.officeSkillGaps.map((row) => (
                <tr key={row.office} className="hover:bg-slate-50/70">
                  <td className="p-3 font-extrabold text-slate-900 flex items-center gap-1.5">
                    <MapPin size={13} className="text-sky-700" />
                    <span>{row.office}</span>
                  </td>

                  {/* Doppler Radar */}
                  <td className="p-2 text-center">
                    <div
                      className={`p-2 rounded-xl border text-xs ${getHeatmapColor(
                        row.radarScore,
                        row.radarTarget
                      )}`}
                    >
                      <span>{row.radarScore}%</span>
                      <span className="text-[10px] block opacity-75">Target: {row.radarTarget}</span>
                    </div>
                  </td>

                  {/* Cyclone Tracking */}
                  <td className="p-2 text-center">
                    <div
                      className={`p-2 rounded-xl border text-xs ${getHeatmapColor(
                        row.cycloneScore,
                        row.cycloneTarget
                      )}`}
                    >
                      <span>{row.cycloneScore}%</span>
                      <span className="text-[10px] block opacity-75">Target: {row.cycloneTarget}</span>
                    </div>
                  </td>

                  {/* NWP Models */}
                  <td className="p-2 text-center">
                    <div
                      className={`p-2 rounded-xl border text-xs ${getHeatmapColor(
                        row.nwpScore,
                        row.nwpTarget
                      )}`}
                    >
                      <span>{row.nwpScore}%</span>
                      <span className="text-[10px] block opacity-75">Target: {row.nwpTarget}</span>
                    </div>
                  </td>

                  {/* AWS Telemetry */}
                  <td className="p-2 text-center">
                    <div
                      className={`p-2 rounded-xl border text-xs ${getHeatmapColor(
                        row.awsScore,
                        row.awsTarget
                      )}`}
                    >
                      <span>{row.awsScore}%</span>
                      <span className="text-[10px] block opacity-75">Target: {row.awsTarget}</span>
                    </div>
                  </td>

                  {/* Aviation Weather */}
                  <td className="p-2 text-center">
                    <div
                      className={`p-2 rounded-xl border text-xs ${getHeatmapColor(
                        row.aviationScore,
                        row.aviationTarget
                      )}`}
                    >
                      <span>{row.aviationScore}%</span>
                      <span className="text-[10px] block opacity-75">Target: {row.aviationTarget}</span>
                    </div>
                  </td>

                  {/* Satellite INSAT */}
                  <td className="p-2 text-center">
                    <div
                      className={`p-2 rounded-xl border text-xs ${getHeatmapColor(
                        row.satelliteScore,
                        row.satelliteTarget
                      )}`}
                    >
                      <span>{row.satelliteScore}%</span>
                      <span className="text-[10px] block opacity-75">Target: {row.satelliteTarget}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
