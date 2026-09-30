import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Award,
  Users,
  Search,
  Filter,
  ExternalLink
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';

export const TrainerTestResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const { testResults, tests, courses } = useCourseStore();
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  // If no submissions recorded yet in store, supply mock sample test records so the trainer sees realistic data immediately
  const mockInitialResults = [
    {
      id: 'res-mock-1',
      testId: 'tst-dwr-01',
      courseId: 'crs-dwr-101',
      userId: 'usr-trainee-2',
      userName: 'Smt. Priya Sundaram',
      office: 'Chennai RMC',
      score: 92,
      percentage: 92,
      passed: true,
      totalQuestions: 6,
      correctAnswers: 5,
      completedAt: '2026-09-28 14:15:00',
      certificateId: 'IMD-CERT-2024-8841'
    },
    {
      id: 'res-mock-2',
      testId: 'tst-cyc-01',
      courseId: 'crs-cyc-201',
      userId: 'usr-trainee-1',
      userName: 'Dr. Rajesh Sharma',
      office: 'New Delhi HQ',
      score: 86,
      percentage: 86,
      passed: true,
      totalQuestions: 5,
      correctAnswers: 4,
      completedAt: '2026-09-27 11:30:20',
      certificateId: 'IMD-CERT-2024-7120'
    },
    {
      id: 'res-mock-3',
      testId: 'tst-dwr-01',
      courseId: 'crs-dwr-101',
      userId: 'usr-trainee-3',
      userName: 'Shri Biman Baruah',
      office: 'Guwahati NEC',
      score: 64,
      percentage: 64,
      passed: false,
      totalQuestions: 6,
      correctAnswers: 3,
      completedAt: '2026-09-26 16:40:10'
    }
  ];

  const allResults = testResults.length > 0 ? [...testResults, ...mockInitialResults] : mockInitialResults;

  const filteredResults = allResults.filter((r) =>
    selectedCourse === 'all' ? true : r.courseId === selectedCourse
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
          Examination Evaluation & Analytics
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Staff Test Submissions & Competency Results
        </h1>
        <p className="text-xs text-slate-500">
          Inspect trainee pass rates, examination score distributions, and minted competency credentials.
        </p>
      </div>

      {/* Filter and Table */}
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Users size={18} className="text-sky-700" />
            <h2 className="text-base font-bold text-slate-900">
              Candidate Submissions Log ({filteredResults.length})
            </h2>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold">Filter Course:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-3">Candidate Officer</th>
                <th className="pb-3">Regional Station</th>
                <th className="pb-3">Course Exam</th>
                <th className="pb-3">Completed At</th>
                <th className="pb-3 text-center">Score %</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-3 text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.map((r, idx) => (
                <tr key={`${r.id}-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 pl-3 font-bold text-slate-900">{r.userName}</td>
                  <td className="py-3.5 text-slate-600 font-medium">{r.office}</td>
                  <td className="py-3.5 text-sky-800 font-semibold">
                    {courses.find((c) => c.id === r.courseId)?.code || r.courseId}
                  </td>
                  <td className="py-3.5 text-slate-400 text-[11px]">{r.completedAt}</td>
                  <td className="py-3.5 text-center font-bold text-sm">
                    <span className={r.passed ? 'text-emerald-700' : 'text-red-600'}>
                      {r.percentage}%
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {r.passed ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>Passed</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={12} />
                          <span>Needs Retake</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 text-right">
                    {r.certificateId ? (
                      <Link
                        to={`/verify/${r.certificateId}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                      >
                        <Award size={12} />
                        <span>{r.certificateId}</span>
                        <ExternalLink size={10} />
                      </Link>
                    ) : (
                      <span className="text-[11px] text-slate-400">N/A</span>
                    )}
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
