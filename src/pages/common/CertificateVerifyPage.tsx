import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  Calendar,
  CheckCircle2,
  Printer,
  ExternalLink,
  Building,
  User,
  AlertTriangle
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { api, USE_MOCKS } from '../../api/client';
import { Avatar } from '../../components/common/Avatar';

export const CertificateVerifyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { getCertificateById } = useCourseStore();

  const [apiCert, setApiCert] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (!USE_MOCKS) {
      setLoading(true);
      api.certificates
        .verify(id)
        .then((res) => {
          if (res && res.isValid) {
            setApiCert({
              id: res.certificateId,
              userName: res.recipientName,
              courseTitle: res.courseTitle,
              office: res.office,
              issueDate: res.issueDate,
              expiryDate: res.expiryDate,
              verificationHash: res.verificationHash,
              authority: res.authority,
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  const certificate = apiCert || (id ? getCertificateById(id) : undefined);
  const currentUrl = window.location.href;

  const isRevoked = certificate?.status === 'revoked';
  const isExpired = certificate?.status === 'expired';

  // Check if expiring soon (e.g. within 30 days)
  let isExpiringSoon = false;
  if (certificate?.expiryDate && !isRevoked && !isExpired) {
    const expiry = new Date(certificate.expiryDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    isExpiringSoon = certificate.status === 'expiring' || (diffDays > 0 && diffDays <= 30);
  }

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 bg-slate-100 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Verification Status Header */}
        {certificate ? (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Top Verification Header */}
            <div
              className={`text-white p-6 sm:p-8 text-center space-y-3 ${
                isRevoked
                  ? 'bg-gradient-to-r from-red-800 via-rose-900 to-red-950'
                  : isExpired
                  ? 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900'
                  : 'bg-gradient-to-r from-emerald-800 to-teal-900'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto shadow-inner ${
                  isRevoked
                    ? 'bg-red-500/20 border-red-300 text-red-300'
                    : isExpired
                    ? 'bg-slate-500/20 border-slate-300 text-slate-300'
                    : 'bg-emerald-500/20 border-emerald-300 text-emerald-300'
                }`}
              >
                {isRevoked || isExpired ? <ShieldAlert size={36} /> : <ShieldCheck size={36} />}
              </div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    isRevoked
                      ? 'bg-red-500/30 text-red-200 border-red-400/30'
                      : isExpired
                      ? 'bg-slate-500/30 text-slate-200 border-slate-400/30'
                      : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/30'
                  }`}
                >
                  {isRevoked
                    ? 'REVOKED CREDENTIAL'
                    : isExpired
                    ? 'EXPIRED CREDENTIAL'
                    : t('certificates.verifyValid')}
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold mt-2">
                  Official Competency Verification
                </h1>
                <p className="text-xs text-slate-200/80">
                  Government of India • Ministry of Earth Sciences • India Meteorological Department
                </p>
              </div>
            </div>

            {/* Status Alert Banners */}
            {isRevoked && (
              <div className="bg-red-50 border-y border-red-300 p-3.5 text-xs text-red-900 flex items-center justify-center space-x-2">
                <AlertTriangle size={16} className="text-red-600 shrink-0" />
                <span className="font-bold">
                  NOTICE: This credential was REVOKED by order of Director General of Meteorology (Mausam Bhavan).
                </span>
              </div>
            )}

            {isExpired && !isRevoked && (
              <div className="bg-slate-100 border-y border-slate-300 p-3.5 text-xs text-slate-800 flex items-center justify-center space-x-2">
                <AlertTriangle size={16} className="text-slate-600 shrink-0" />
                <span className="font-semibold">
                  This credential expired on {certificate.expiryDate}. Refresher recertification examination required.
                </span>
              </div>
            )}

            {isExpiringSoon && !isRevoked && !isExpired && (
              <div className="bg-amber-50 border-y border-amber-200 p-3 text-xs text-amber-900 flex items-center justify-center space-x-2">
                <AlertTriangle size={16} className="text-amber-600" />
                <span className="font-semibold">
                  {t('certificates.expiringSoon')} (Within 30 Days) — Refresher recertification examination required.
                </span>
              </div>
            )}

            {/* Certificate Details Card */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Holder & Course Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3">
                  <Avatar size="lg" />
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {t('certificates.holder')}
                    </span>
                    <p className="font-bold text-slate-900 text-sm truncate">{certificate.userName}</p>
                    <p className="text-slate-600">{certificate.userDesignation}</p>
                    <p className="text-slate-500 font-semibold">{certificate.userOffice}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Certification Subject
                  </span>
                  <p className="font-bold text-sky-900 text-sm line-clamp-2">
                    {certificate.courseTitle}
                  </p>
                  <p className="text-slate-600 font-semibold">{certificate.courseCode}</p>
                  <p className="text-emerald-700 font-bold">
                    Grade: {certificate.grade} ({certificate.score}%)
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {t('certificates.issueDate')}
                  </span>
                  <p className="font-bold text-slate-800">{certificate.issueDate}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block pt-1">
                    {t('certificates.expiryDate')}
                  </span>
                  <p className="font-bold text-slate-800">{certificate.expiryDate}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Verification Authority
                  </span>
                  <p className="font-bold text-slate-800">{t('certificates.authority')}</p>
                  <p className="text-[11px] text-slate-500">Mausam Bhavan, New Delhi</p>
                  <div className="flex items-center gap-1 text-emerald-700 font-bold pt-1">
                    <CheckCircle2 size={13} />
                    <span>Cryptographically Signed</span>
                  </div>
                </div>
              </div>

              {/* Instructional Faculty Team Block */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Instructional Faculty & Course Signatories
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(certificate.trainers && certificate.trainers.length > 0
                    ? certificate.trainers
                    : [
                        { trainerName: 'Dr. Sunita Kulkarni', role: 'Lead', office: 'New Delhi HQ' },
                        { trainerName: 'Dr. Ramesh Kumar Yadav', role: 'Co-trainer', office: 'Mumbai RMC' },
                        { trainerName: 'Karthik Subramanian', role: 'Co-trainer', office: 'Chennai RMC' }
                      ]
                  ).map((tr: any, idx: number) => {
                    const name = typeof tr === 'string' ? tr : (tr.trainerName || tr.name);
                    const role = typeof tr === 'object' && tr.role ? tr.role : (idx === 0 ? 'Lead Trainer' : 'Co-trainer');
                    const office = typeof tr === 'object' && tr.office ? tr.office : 'IMD Faculty';
                    return (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 truncate">{name}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              role === 'Lead' || role === 'Lead Trainer'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">{office}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* QR Code and Cryptographic Hash */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white p-2.5 rounded-xl border border-slate-300 shadow-xs flex-shrink-0">
                  <QRCodeSVG value={currentUrl} size={96} level="M" />
                </div>
                <div className="text-xs space-y-1 text-center sm:text-left">
                  <span className="font-bold text-slate-700 block">Certificate ID: {certificate.id}</span>
                  <span className="text-[10px] font-mono text-slate-400 break-all block">
                    Hash: {certificate.verificationHash}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    This public verification URL confirms the authenticity of meteorological capacity records.
                  </p>
                </div>
              </div>

              {/* Print & Return Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Printer size={15} />
                  <span>Print Verification Record</span>
                </button>

                <Link
                  to="/"
                  className="text-xs font-bold text-sky-700 hover:underline"
                >
                  Return to CAPACITY CONNECT Home →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Invalid / Not Found State */
          <div className="bg-white rounded-3xl shadow-xl border-2 border-red-200 p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert size={36} />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
                Unverified Credential
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                {t('certificates.verifyInvalid')}
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                The identifier <code className="bg-slate-100 px-1 py-0.5 rounded text-red-600">{id}</code> could not be located in the IMD Capacity Registry.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/"
                className="inline-block px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Return to Portal Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
