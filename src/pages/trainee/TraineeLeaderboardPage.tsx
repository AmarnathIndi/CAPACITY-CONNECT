import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Trophy,
  Building,
  Award,
  Users,
  Star,
  TrendingUp,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

import { Avatar } from '../../components/common/Avatar';

export const TraineeLeaderboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { users, currentUser } = useAuthStore();
  const [filterOffice, setFilterOffice] = useState<string>('all');

  // Office rankings computation across all 6 regions
  const officeStats = [
    {
      office: 'New Delhi HQ',
      region: 'Northern & National Headquarters',
      totalPoints: 18450,
      certCount: 52,
      completionRate: 92,
      rank: 1,
      badge: 'National Shield'
    },
    {
      office: 'Chennai RMC',
      region: 'Southern Regional Meteorological Centre',
      totalPoints: 17820,
      certCount: 48,
      completionRate: 94,
      rank: 2,
      badge: 'Cyclone Excellence'
    },
    {
      office: 'Mumbai RMC',
      region: 'Western Regional Meteorological Centre',
      totalPoints: 14900,
      certCount: 39,
      completionRate: 89,
      rank: 3,
      badge: 'Urban Flood Shield'
    },
    {
      office: 'Kolkata RMC',
      region: 'Eastern Regional Meteorological Centre',
      totalPoints: 13850,
      certCount: 36,
      completionRate: 88,
      rank: 4,
      badge: 'Bay Sentinel'
    },
    {
      office: 'Guwahati NEC',
      region: 'North Eastern Regional Centre',
      totalPoints: 11240,
      certCount: 31,
      completionRate: 85,
      rank: 5,
      badge: 'Mountain Telemetry'
    },
    {
      office: 'Nagpur RMC',
      region: 'Central Regional Meteorological Centre',
      totalPoints: 9680,
      certCount: 26,
      completionRate: 84,
      rank: 6,
      badge: 'Calibration Pioneer'
    }
  ];

  // Individual staff sorted by points
  const sortedUsers = [...users]
    .filter((u) => u.status === 'active')
    .filter((u) => (filterOffice === 'all' ? true : u.office.includes(filterOffice)))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002D62] via-slate-900 to-sky-950 p-6 sm:p-8 rounded-3xl text-white shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Trophy size={16} />
          <span>IMD National Capacity Champions</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Regional Office & Individual Leaderboards
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Celebrating scientific excellence, course completion milestones, and examination distinctions across all Regional Meteorological Centres.
        </p>
      </div>

      {/* Office vs Office Podium Cards */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
          <Building size={20} className="text-sky-700" />
          <h2 className="text-lg font-bold text-slate-900">Regional Centre Standings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {officeStats.map((off) => (
            <div
              key={off.office}
              className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden transition-all ${
                off.rank === 1
                  ? 'bg-gradient-to-b from-amber-50 to-white border-amber-300 ring-2 ring-amber-200'
                  : 'bg-white border-slate-200 hover:border-sky-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      off.rank === 1
                        ? 'bg-amber-400 text-amber-950'
                        : off.rank === 2
                        ? 'bg-slate-200 text-slate-800'
                        : off.rank === 3
                        ? 'bg-amber-700/50 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Rank #{off.rank}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-2">{off.office}</h3>
                  <p className="text-xs text-slate-500">{off.region}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xl">
                  {off.rank === 1 ? '🥇' : off.rank === 2 ? '🥈' : off.rank === 3 ? '🥉' : '🎖️'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">
                    Cumulative Points
                  </span>
                  <p className="font-extrabold text-sky-800 text-sm mt-0.5">
                    {off.totalPoints.toLocaleString()}
                  </p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">
                    Pass Rate
                  </span>
                  <p className="font-extrabold text-emerald-700 text-sm mt-0.5">
                    {off.completionRate}%
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 font-semibold flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>Honor: {off.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Leaderboard Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              <span>National Individual Staff Rankings</span>
            </h2>
            <p className="text-xs text-slate-500">Points awarded for completed courses & passed exams</p>
          </div>

          {/* Regional Filter */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold">Filter Office:</span>
            <select
              value={filterOffice}
              onChange={(e) => setFilterOffice(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
            >
              <option value="all">All Regional Stations</option>
              <option value="Delhi">New Delhi HQ</option>
              <option value="Chennai">Chennai RMC</option>
              <option value="Guwahati">Guwahati NEC</option>
              <option value="Mumbai">Mumbai RMC</option>
              <option value="Kolkata">Kolkata RMC</option>
              <option value="Nagpur">Nagpur RMC</option>
            </select>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-3">Rank</th>
                <th className="pb-3">Staff Officer</th>
                <th className="pb-3">Station / Office</th>
                <th className="pb-3">Designation</th>
                <th className="pb-3">Verified Badges</th>
                <th className="pb-3 pr-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedUsers.map((u, idx) => {
                const isCurrent = currentUser && currentUser.id === u.id;

                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isCurrent ? 'bg-sky-50/70 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3.5 pl-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          idx === 0
                            ? 'bg-amber-400 text-amber-950 shadow-xs'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-800'
                            : idx === 2
                            ? 'bg-amber-700/50 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </div>
                    </td>

                    <td className="py-3.5">
                      <div className="flex items-center space-x-3">
                        <Avatar size="sm" name={u.name} />
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-600 text-white font-bold">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 text-slate-700 font-medium">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{u.office}</span>
                      </div>
                    </td>

                    <td className="py-3.5 text-slate-600">{u.designation}</td>

                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {u.badges.slice(0, 2).map((b) => (
                          <span
                            key={b}
                            className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold"
                          >
                            🎖️ {b}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 pr-3 text-right">
                      <span className="text-sm font-extrabold text-sky-800">
                        {u.points.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-normal">pts</span>
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
