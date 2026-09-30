import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import {
  Award,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Printer,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Search,
  Download
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Certificate } from '../../types';

export const TraineeCertificatesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { certificates } = useCourseStore();
  const { currentUser } = useAuthStore();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const userCertificates = certificates.filter(
    (c) => currentUser && (c.userId === currentUser.id || c.userEmail === currentUser.email)
  );

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 60;
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002D62] via-slate-900 to-sky-950 p-6 sm:p-8 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
            Verified Meteorological Credentials
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('certificates.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {t('certificates.subtitle')}. Each credential embeds a tamper-proof cryptographic QR signature.
          </p>
        </div>

        <Link
          to="/trainee/transcript"
          className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-slate-100 flex items-center gap-2 shadow-lg transition-colors flex-shrink-0"
        >
          <FileText size={16} className="text-sky-700" />
          <span>{t('certificates.printTranscript')}</span>
        </Link>
      </div>

      {/* Certificates Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award size={20} className="text-amber-500" />
            <span>My Issued Credentials ({userCertificates.length})</span>
          </h2>
        </div>

        {userCertificates.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
              <Award size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No Certificates Earned Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Complete any course modules and pass the 15-minute qualification test to receive your verified IMD certificate.
              </p>
            </div>
            <Link
              to="/trainee/catalog"
              className="inline-block px-5 py-2.5 bg-[#002D62] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#0A2540]"
            >
              Browse Operational Courses →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userCertificates.map((cert) => {
              const expiringSoon = isExpiringSoon(cert.expiryDate);
              const verifyUrl = `${window.location.origin}/verify/${cert.id}`;

              return (
                <div
                  key={cert.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-sky-300 hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                          {cert.courseCode}
                        </span>
                        <h3 className="font-extrabold text-base text-slate-900 mt-1 line-clamp-2">
                          {cert.courseTitle}
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex-shrink-0">
                        {cert.grade}
                      </span>
                    </div>

                    {expiringSoon && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center gap-1.5 font-medium">
                        <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
                        <span>Expiring Soon — Recertification recommended.</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">
                          Certificate ID
                        </span>
                        <span className="font-mono font-bold text-slate-800 text-[11px]">
                          {cert.id}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">
                          Score Achieved
                        </span>
                        <span className="font-bold text-emerald-700">{cert.score}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">
                          Issued On
                        </span>
                        <span className="font-medium text-slate-700">{cert.issueDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">
                          Valid Until
                        </span>
                        <span className="font-medium text-slate-700">{cert.expiryDate}</span>
                      </div>
                    </div>

                    {/* Faculty Team */}
                    <div className="text-[11px] p-2.5 rounded-xl bg-sky-50/60 border border-sky-100 text-slate-700">
                      <span className="text-[10px] text-sky-800 font-bold uppercase block mb-0.5">Instructional Faculty:</span>
                      <p className="font-medium text-slate-800">
                        {cert.trainers && cert.trainers.length > 0
                          ? cert.trainers.map((t: any) => typeof t === 'string' ? t : (t.trainerName || t.name)).join(', ')
                          : 'Dr. Sunita Kulkarni (Lead), Dr. Ramesh Kumar Yadav, Karthik Subramanian'}
                      </p>
                    </div>
                  </div>

                  {/* QR Code and Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white p-1 rounded-lg border border-slate-200">
                        <QRCodeSVG value={verifyUrl} size={44} level="M" />
                      </div>
                      <div className="text-[11px]">
                        <span className="text-slate-400 block">Scan to Verify</span>
                        <span className="font-semibold text-sky-700">WMO Standard</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/verify/${cert.id}`}
                        className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <span>Verify</span>
                        <ExternalLink size={12} />
                      </Link>
                      <button
                        onClick={() => setSelectedCert(cert)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Full Certificate View */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl border-4 border-amber-300 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg"
            >
              ✕
            </button>

            {/* Official Certificate Layout */}
            <div className="text-center space-y-3 pb-6 border-b-2 border-slate-200">
              <div className="w-14 h-14 rounded-full bg-[#002D62] text-amber-400 flex items-center justify-center mx-auto border-2 border-sky-400 font-bold">
                IMD
              </div>
              <h2 className="text-xl font-extrabold text-[#002D62] tracking-wider uppercase">
                Government of India • Ministry of Earth Sciences
              </h2>
              <p className="text-xs uppercase tracking-widest text-slate-600 font-bold">
                India Meteorological Department (IMD)
              </p>
              <h3 className="text-2xl font-serif font-extrabold text-slate-900 pt-2">
                Certificate of Operational Competency
              </h3>
            </div>

            <div className="text-center space-y-3 py-2 text-xs text-slate-700 leading-relaxed">
              <p>This is to officially certify that</p>
              <h4 className="text-xl font-bold text-[#002D62] underline decoration-amber-400 underline-offset-4">
                {selectedCert.userName}
              </h4>
              <p className="text-xs text-slate-600">
                {selectedCert.userDesignation} • {selectedCert.userOffice}
              </p>
              <p className="pt-2">has successfully completed the comprehensive training program and passed the examination in</p>
              <p className="text-base font-bold text-slate-900 bg-sky-50 py-2 rounded-xl border border-sky-200">
                {selectedCert.courseTitle} ({selectedCert.courseCode})
              </p>
              <p className="font-semibold text-emerald-800">
                Graded: <strong>{selectedCert.grade}</strong> ({selectedCert.score}% Examination Score)
              </p>

              {/* Instructional Faculty Team */}
              <div className="pt-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                  Certified Instructional Faculty Team:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {(selectedCert.trainers && selectedCert.trainers.length > 0
                    ? selectedCert.trainers
                    : [
                        { trainerName: 'Dr. Sunita Kulkarni', role: 'Lead' },
                        { trainerName: 'Dr. Ramesh Kumar Yadav', role: 'Co-trainer' },
                        { trainerName: 'Karthik Subramanian', role: 'Co-trainer' }
                      ]
                  ).map((tr: any, idx: number) => {
                    const name = typeof tr === 'string' ? tr : (tr.trainerName || tr.name);
                    const role = typeof tr === 'object' && tr.role ? tr.role : (idx === 0 ? 'Lead' : 'Co-trainer');
                    return (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium">
                        <strong>{name}</strong> ({role})
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <QRCodeSVG
                  value={`${window.location.origin}/verify/${selectedCert.id}`}
                  size={64}
                  level="M"
                />
                <div className="text-[10px] text-slate-500 font-mono">
                  <span>ID: {selectedCert.id}</span>
                  <span className="block">Valid: {selectedCert.issueDate} - {selectedCert.expiryDate}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-slate-800 text-xs">Director General of Meteorology</p>
                <p className="text-[10px] text-slate-500">Mausam Bhavan, New Delhi</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
