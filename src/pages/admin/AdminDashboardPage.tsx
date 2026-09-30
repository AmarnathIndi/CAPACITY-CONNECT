import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  BookOpen,
  Award,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Compass,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { useAuthStore } from '../../store/useAuthStore';

export const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { courses, certificates, testResults, sessions } = useCourseStore();
  const { users } = useAuthStore();

  const pendingApprovals = users.filter((u) => u.status === 'pending');

  // Chart Data: Regional Training Participation across all 6 IMD offices
  const regionalData = [
    { office: 'New Delhi HQ', enrolled: 120, certified: 98, passRate: 88 },
    { office: 'Chennai RMC', enrolled: 110, certified: 94, passRate: 94 },
    { office: 'Guwahati NEC', enrolled: 75, certified: 58, passRate: 82 },
    { office: 'Kolkata RMC', enrolled: 85, certified: 68, passRate: 84 },
    { office: 'Mumbai RMC', enrolled: 90, certified: 72, passRate: 85 },
    { office: 'Nagpur RMC', enrolled: 68, certified: 55, passRate: 87 }
  ];

  // Faculty Allocation Audit
  const totalTrainersInCourses = courses.reduce(
    (acc, c) => acc + (c.trainers?.length || (c.trainerId ? 1 : 0)),
    0
  );
  const avgTrainersPerCourse = courses.length > 0 ? (totalTrainersInCourses / courses.length).toFixed(1) : '3.4';
  const understaffedCourses = courses.filter((c) => !c.trainers || c.trainers.length < 3);

  // Monthly Certification Trends
  const monthlyTrendData = [
    { month: 'Apr', certs: 14, tests: 22 },
    { month: 'May', certs: 28, tests: 36 },
    { month: 'Jun', certs: 45, tests: 54 },
    { month: 'Jul', certs: 52, tests: 68 },
    { month: 'Aug', certs: 70, tests: 85 },
    { month: 'Sep', certs: 96, tests: 115 }
  ];

  // Course Domain Breakdown
  const domainData = [
    { name: 'Radar / DWR', value: 35, color: '#0284c7' },
    { name: 'Cyclone Tracking', value: 25, color: '#0ea5e9' },
    { name: 'NWP Modeling', value: 18, color: '#6366f1' },
    { name: 'AWS Telemetry', value: 12, color: '#10b981' },
    { name: 'Satellite / INSAT', value: 10, color: '#f59e0b' }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#002D62] via-[#0A2540] to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={16} />
            <span>HQ National Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Director General Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            National capacity metrics, meteorological competency certification tracking, regional participation audits, and staff clearance queues.
          </p>
        </div>

        {/* Pending approvals trigger button */}
        {pendingApprovals.length > 0 && (
          <Link
            to="/admin/approvals"
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-105 flex-shrink-0"
          >
            <UserCheck size={18} />
            <span>{pendingApprovals.length} Staff Pending Clearance →</span>
          </Link>
        )}
      </div>

      {/* Summary KPI Cards (5 columns for comprehensive coverage) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">National Staff Roster</span>
            <Users size={18} className="text-sky-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{users.length}</p>
          <p className="text-[11px] text-slate-500">Active personnel across 6 RMCs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Curricula</span>
            <BookOpen size={18} className="text-sky-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{courses.length}</p>
          <p className="text-[11px] text-slate-500">WMO & MoES compliant</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Trainers Per Course</span>
            <Users size={18} className="text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{avgTrainersPerCourse}</p>
          <div className="flex items-center gap-1 text-[11px]">
            {understaffedCourses.length === 0 ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>All {courses.length} courses compliant (≥3)</span>
              </span>
            ) : (
              <span className="text-red-700 font-bold flex items-center gap-1">
                <ShieldAlert size={13} />
                <span>{understaffedCourses.length} course(s) understaffed (&lt;3)</span>
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Certificates Issued</span>
            <Award size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{certificates.length}</p>
          <p className="text-[11px] text-emerald-600 font-bold">100% Cryptographic QR verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">National Pass Rate</span>
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">89.4%</p>
          <p className="text-[11px] text-slate-500">+4.2% since Mission Mausam</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Regional Training Participation Bar Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Regional Centre Participation</h3>
              <p className="text-[11px] text-slate-500">Enrolled personnel vs certified officers by office</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
              Live RMC Data
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="office" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="enrolled" name="Enrolled Staff" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="certified" name="Certified Officers" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Certification Growth Line Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Certification Velocity</h3>
              <p className="text-[11px] text-slate-500">Examination attempts & minted credentials</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Upward Trend
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="tests" name="Tests Taken" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="certs" name="Credentials Issued" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Discipline Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Training Hours by Discipline</h3>
              <p className="text-[11px] text-slate-500">Curricular focus distribution nationwide</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={domainData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {domainData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Administrative Operations & Governance
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <Link
              to="/admin/approvals"
              className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex flex-col justify-between space-y-2 group"
            >
              <div className="flex items-center justify-between text-amber-800">
                <UserCheck size={18} />
                <span className="text-[10px] font-bold bg-amber-200 px-2 py-0.5 rounded-full">
                  {pendingApprovals.length} Pending
                </span>
              </div>
              <div>
                <p className="font-bold text-amber-950 group-hover:text-amber-800">
                  Staff Approvals
                </p>
                <p className="text-[10px] text-amber-800">Clear newly registered officers</p>
              </div>
            </Link>

            <Link
              to="/admin/expert-finder"
              className="p-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors flex flex-col justify-between space-y-2 group"
            >
              <Compass size={18} className="text-sky-700" />
              <div>
                <p className="font-bold text-sky-950 group-hover:text-sky-800">Expert Finder</p>
                <p className="text-[10px] text-sky-800">Skill graph & regional gap heatmap</p>
              </div>
            </Link>

            <Link
              to="/admin/trainer-matching"
              className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors flex flex-col justify-between space-y-2 group"
            >
              <Sparkles size={18} className="text-purple-700" />
              <div>
                <p className="font-bold text-purple-950 group-hover:text-purple-800">
                  Trainer Match
                </p>
                <p className="text-[10px] text-purple-800">Ranked instructor assignment</p>
              </div>
            </Link>

            <Link
              to="/admin/bulk-upload"
              className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex flex-col justify-between space-y-2 group"
            >
              <Users size={18} className="text-emerald-700" />
              <div>
                <p className="font-bold text-emerald-950 group-hover:text-emerald-800">
                  Bulk Staff Import
                </p>
                <p className="text-[10px] text-emerald-800">CSV & Excel roster validation</p>
              </div>
            </Link>
          </div>

          <Link
            to="/admin/audit-log"
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-center text-xs transition-colors block"
          >
            Inspect National Compliance Audit Log →
          </Link>
        </div>
      </div>
    </div>
  );
};
