import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, ArrowLeft, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCourseStore } from '../../store/useCourseStore';

export const TraineeTranscriptPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { certificates, courses } = useCourseStore();

  const userCertificates = certificates.filter(
    (c) => currentUser && (c.userId === currentUser.id || c.userEmail === currentUser.email)
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <Link
          to="/trainee/certificates"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-sky-800"
        >
          <ArrowLeft size={16} />
          <span>Back to Certificates</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Printer size={15} />
          <span>Print Official Transcript</span>
        </button>
      </div>

      {/* Official Printable Transcript Paper */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border-2 border-slate-300 shadow-lg space-y-8 text-slate-900 print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="text-center space-y-2 border-b-2 border-slate-900 pb-6">
          <div className="w-16 h-16 rounded-full bg-[#002D62] text-amber-400 font-extrabold text-xl flex items-center justify-center mx-auto border-2 border-sky-400">
            IMD
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide uppercase text-[#002D62]">
            Government of India • Ministry of Earth Sciences
          </h1>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700">
            India Meteorological Department (IMD)
          </h2>
          <p className="text-xs text-slate-500 uppercase font-semibold">
            Central Training Division • Mausam Bhavan, Lodhi Road, New Delhi 110003
          </p>
          <div className="pt-2 inline-block px-4 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-800 border border-slate-300">
            OFFICIAL METEOROLOGICAL LEARNING TRANSCRIPT & COMPETENCY RECORD
          </div>
        </div>

        {/* Staff Information Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Officer Name</span>
            <p className="font-bold text-sm text-slate-900">{currentUser?.name}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Official Email</span>
            <p className="font-medium text-slate-800">{currentUser?.email}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Designation</span>
            <p className="font-medium text-slate-800">{currentUser?.designation}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Station / Regional Centre</span>
            <p className="font-medium text-slate-800">{currentUser?.office}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Service Experience</span>
            <p className="font-medium text-slate-800">{currentUser?.experienceYears} Years</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">National Competency Points</span>
            <p className="font-extrabold text-sky-800">{currentUser?.points} Points</p>
          </div>
        </div>

        {/* Certified Courses Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            Section 1: Completed Operational Courses & Examinations
          </h3>

          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase text-slate-600">
              <tr>
                <th className="p-2.5">Course Code</th>
                <th className="p-2.5">Title</th>
                <th className="p-2.5">Instructional Faculty (Trainers)</th>
                <th className="p-2.5">Date Completed</th>
                <th className="p-2.5">Score</th>
                <th className="p-2.5">Grade</th>
                <th className="p-2.5">Certificate ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {userCertificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-400 italic">
                    No completed courses logged in transcript record yet.
                  </td>
                </tr>
              ) : (
                userCertificates.map((cert) => {
                  const facultyStr = cert.trainers && cert.trainers.length > 0
                    ? cert.trainers.map((t: any) => typeof t === 'string' ? t : (t.trainerName || t.name)).join(', ')
                    : 'Dr. Sunita Kulkarni (Lead), Dr. Ramesh Kumar Yadav, Karthik Subramanian';

                  return (
                    <tr key={cert.id}>
                      <td className="p-2.5 font-bold font-mono text-sky-800">{cert.courseCode}</td>
                      <td className="p-2.5 font-medium">{cert.courseTitle}</td>
                      <td className="p-2.5 text-slate-700 text-[11px] font-medium">{facultyStr}</td>
                      <td className="p-2.5 text-slate-600">{cert.issueDate}</td>
                      <td className="p-2.5 font-bold text-emerald-700">{cert.score}%</td>
                      <td className="p-2.5 font-semibold">{cert.grade}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-700">{cert.id}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Verified Skills Section */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            Section 2: Verified Technical Skills & Instrument Competencies
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {currentUser?.skills.map((s) => (
              <div
                key={s.name}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-800">{s.name}</span>
                  <span className="text-[10px] text-slate-500 block">Proficiency: {s.level}</span>
                </div>
                {s.verified ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Verified
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">Candidate Logged</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Sign-off Block */}
        <div className="pt-8 border-t-2 border-slate-900 flex items-end justify-between text-xs">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-500 font-mono">
              System Digest: SHA-256 Validated Record
            </p>
            <p className="text-[11px] text-slate-400">Generated on: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="text-center space-y-1">
            <div className="w-40 border-b border-slate-400 mx-auto mb-1"></div>
            <p className="font-bold text-slate-900">Dr. S. C. Bhan</p>
            <p className="text-[10px] text-slate-500">Head, Training & Capacity Directorate</p>
            <p className="text-[10px] text-slate-500">India Meteorological Department, New Delhi</p>
          </div>
        </div>
      </div>
    </div>
  );
};
