import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Download,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuditStore } from '../../store/useAuditStore';
import { User } from '../../types';

interface BulkUserRecord {
  id: string;
  name: string;
  email: string;
  office: string;
  designation: string;
  role: 'trainee' | 'trainer' | 'admin';
  isValid: boolean;
  validationError?: string;
}

const SAMPLE_CSV_DATA: BulkUserRecord[] = [
  { id: 'b-1', name: 'Ramesh Kumar Yadav', email: 'ramesh.yadav@imd.gov.in', office: 'Nagpur RMC', designation: 'Scientific Assistant (Instruments)', role: 'trainee', isValid: true },
  { id: 'b-2', name: 'Sunita Devi', email: 'sunita.devi@imd.gov.in', office: 'New Delhi HQ', designation: 'Assistant Meteorologist', role: 'trainee', isValid: true },
  { id: 'b-3', name: 'Anitha Krishnan', email: 'anitha.k@imd.gov.in', office: 'Chennai RMC', designation: "Meteorologist 'A'", role: 'trainee', isValid: true },
  { id: 'b-4', name: 'Priya Nair', email: 'priya.nair@imd.gov.in', office: 'Mumbai RMC', designation: 'Scientific Assistant', role: 'trainee', isValid: true },
  { id: 'b-5', name: 'Suresh Pillai', email: 'suresh.pillai@imd.gov.in', office: 'Kolkata RMC', designation: "Meteorologist 'B'", role: 'trainee', isValid: true },
  { id: 'b-6', name: 'Pooja Sharma', email: 'pooja.sharma@imd.gov.in', office: 'New Delhi HQ', designation: 'Junior Scientific Assistant', role: 'trainee', isValid: true },
  { id: 'b-7', name: 'Mohan Das', email: 'mohan.das@external-unauthorized.com', office: 'Kolkata RMC', designation: 'Observing Officer Gr-II', role: 'trainee', isValid: false, validationError: 'Invalid government domain: @external-unauthorized.com' },
  { id: 'b-8', name: 'Kiran Deka', email: 'kiran.deka@imd.gov.in', office: 'Guwahati NEC', designation: 'Scientific Assistant', role: 'trainee', isValid: true },
  { id: 'b-9', name: 'Gurpreet Kaur', email: 'gurpreet.kaur@imd.gov.in', office: 'New Delhi HQ', designation: 'Assistant Meteorologist', role: 'trainee', isValid: true },
  { id: 'b-10', name: 'Nandini Reddy', email: 'nandini.reddy@imd.gov.in', office: 'Chennai RMC', designation: "Meteorologist 'A'", role: 'trainee', isValid: true },
  { id: 'b-11', name: 'Harish Chandra Pant', email: 'harish.pant@imd.gov.in', office: 'Nagpur RMC', designation: 'Observing Officer Gr-I', role: 'trainee', isValid: true },
  { id: 'b-12', name: 'Snigdha Roy', email: 'snigdha.roy@imd.gov.in', office: 'Kolkata RMC', designation: 'Scientific Assistant', role: 'trainee', isValid: true },
  { id: 'b-13', name: 'Pradeep Jena', email: 'pradeep.jena@imd.gov.in', office: 'Kolkata RMC', designation: "Meteorologist 'A'", role: 'trainee', isValid: true },
  { id: 'b-14', name: 'Manju Swaminathan', email: 'manju.s@imd.gov.in', office: 'Chennai RMC', designation: '', role: 'trainee', isValid: false, validationError: 'Mandatory field [Designation] is missing' },
  { id: 'b-15', name: 'Alok Ranjan', email: 'alok.ranjan@imd.gov.in', office: 'New Delhi HQ', designation: 'Scientific Assistant', role: 'trainee', isValid: true },
  { id: 'b-16', name: 'Sourav Ganguly', email: 'sourav.g@imd.gov.in', office: 'Kolkata RMC', designation: 'Junior Scientific Assistant', role: 'trainee', isValid: true },
  { id: 'b-17', name: 'Arvind Joshi', email: 'arvind.joshi@imd.gov.in', office: 'Mumbai RMC', designation: "Meteorologist 'A'", role: 'trainee', isValid: true },
  { id: 'b-18', name: 'Tanvi Deshmukh', email: 'tanvi.deshmukh@imd.gov.in', office: 'Nagpur RMC', designation: 'Scientific Assistant', role: 'trainee', isValid: true },
  { id: 'b-19', name: 'Sandeep Patil', email: 'sandeep.patil@imd.gov.in', office: 'Mumbai RMC', designation: 'Assistant Meteorologist', role: 'trainee', isValid: true },
  { id: 'b-20', name: 'Rinchen Norbu', email: 'rinchen.norbu@imd.gov.in', office: 'Guwahati NEC', designation: 'High Altitude Observer', role: 'trainee', isValid: true },
  { id: 'b-21', name: 'Latha Venkatraman', email: 'latha.v@imd.gov.in', office: 'Bangalore Sub-Centre', designation: 'Scientific Assistant', role: 'trainee', isValid: false, validationError: 'Unrecognized office [Bangalore Sub-Centre]: not in 6 official IMD RMCs' },
  { id: 'b-22', name: 'Hemant Bisht', email: 'hemant.bisht@imd.gov.in', office: 'New Delhi HQ', designation: "Meteorologist 'B'", role: 'trainee', isValid: true },
  { id: 'b-23', name: 'Nilanjana Sen', email: 'nilanjana.sen@imd.gov.in', office: 'Kolkata RMC', designation: 'Scientific Assistant', role: 'trainee', isValid: true },
  { id: 'b-24', name: 'Gagandeep Singh', email: 'gagandeep.s@imd.gov.in', office: 'New Delhi HQ', designation: 'Radar Technical Officer', role: 'trainee', isValid: true },
  { id: 'b-25', name: 'Vandana Tripathi', email: 'vandana.t@imd.gov.in', office: 'Nagpur RMC', designation: "Meteorologist 'A'", role: 'trainee', isValid: true }
];

export const AdminBulkUploadPage: React.FC = () => {
  const { t } = useTranslation();
  const { users, signup } = useAuthStore();
  const { logAction } = useAuditStore();

  const [records, setRecords] = useState<BulkUserRecord[]>(SAMPLE_CSV_DATA);
  const [importedSuccess, setImportedSuccess] = useState(false);
  const [fileName, setFileName] = useState('IMD_Staff_Roster_Q4_2026.csv');

  const validCount = records.filter((r) => r.isValid).length;
  const invalidCount = records.filter((r) => !r.isValid).length;

  const handleSimulateDrop = () => {
    setRecords(SAMPLE_CSV_DATA);
    setFileName('IMD_Staff_Roster_Q4_2026.csv');
    setImportedSuccess(false);
  };

  const handleConfirmImport = () => {
    const validRecords = records.filter((r) => r.isValid);
    validRecords.forEach((rec) => {
      signup({
        name: rec.name,
        email: rec.email,
        office: rec.office,
        designation: rec.designation,
        role: rec.role
      });
    });

    logAction(
      'Dr. M. Mohapatra',
      'Admin',
      'BULK_USER_ONBOARDING',
      `${validRecords.length} Staff Officers`,
      `Successfully validated and imported roster from ${fileName}`
    );

    setImportedSuccess(true);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          HQ Personnel Onboarding
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Bulk Staff Upload & Roster Validation
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Onboard cohorts of scientific assistants and meteorologists by uploading CSV or Excel rosters. The system runs real-time schema validation to catch corrupted email domains and missing station designations.
        </p>
      </div>

      {importedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-bold">Batch Import Complete!</p>
            <p className="text-[11px] text-emerald-800">
              {validCount} staff records were verified and enrolled into the National Staff Registry. (2 invalid records were omitted for HR review).
            </p>
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xs border-2 border-dashed border-slate-300 text-center space-y-4 hover:border-sky-400 transition-colors">
        <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mx-auto border-2 border-sky-200">
          <FileSpreadsheet size={32} />
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">{t('admin.dropzoneText')}</h2>
          <p className="text-xs text-slate-500">
            Current loaded dataset: <strong className="text-sky-900">{fileName}</strong> ({records.length} Records: {validCount} Valid, {invalidCount} Deliberate Errors)
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={handleSimulateDrop}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors"
          >
            Reload Sample IMD Roster ({records.length} Rows)
          </button>
          <a
            href="/samples/bulk-user-sample.csv"
            download="IMD_Staff_Bulk_Upload_Sample.csv"
            className="px-4 py-2 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download size={13} />
            <span>Download Sample CSV (25 Records)</span>
          </a>
        </div>
      </div>

      {/* Preview Table & Validation Error Inspection */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck size={18} className="text-sky-700" />
              <span>{t('admin.validationErrors')}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Previewing parsed records with pre-flight syntax and domain checks
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-bold">
            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>Valid: {validCount}</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-red-100 text-red-800 flex items-center gap-1">
              <XCircle size={13} />
              <span>Errors: {invalidCount}</span>
            </span>
          </div>
        </div>

        {/* Validation Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-3">Full Name</th>
                <th className="pb-3">Government Email</th>
                <th className="pb-3">Office Assignment</th>
                <th className="pb-3">Designation</th>
                <th className="pb-3">Role</th>
                <th className="pb-3 pr-3 text-right">Validation Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((rec) => (
                <tr
                  key={rec.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    !rec.isValid ? 'bg-red-50/40' : ''
                  }`}
                >
                  <td className="py-3.5 pl-3 font-bold text-slate-900">{rec.name}</td>
                  <td className={`py-3.5 font-mono text-[11px] ${!rec.isValid && rec.validationError?.includes('email') ? 'text-red-600 font-bold underline' : 'text-slate-600'}`}>
                    {rec.email}
                  </td>
                  <td className="py-3.5 text-slate-700 font-medium">{rec.office}</td>
                  <td className={`py-3.5 ${!rec.designation ? 'text-red-500 italic font-bold' : 'text-slate-600'}`}>
                    {rec.designation || '[Empty Field]'}
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                      {rec.role}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 text-right">
                    {rec.isValid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 size={12} />
                        <span>Valid Record</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full" title={rec.validationError}>
                        <XCircle size={12} />
                        <span>{rec.validationError}</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Note: Invalid rows with syntax or missing field errors will be skipped during ingestion.
          </p>

          <button
            onClick={handleConfirmImport}
            disabled={validCount === 0 || importedSuccess}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-40 transition-colors"
          >
            <ShieldCheck size={16} />
            <span>Confirm & Import {validCount} Valid Records</span>
          </button>
        </div>
      </div>
    </div>
  );
};
