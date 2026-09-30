import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Search,
  Filter,
  ShieldCheck,
  Clock,
  User,
  Activity,
  ArrowDownToLine
} from 'lucide-react';
import { useAuditStore } from '../../store/useAuditStore';

export const AdminAuditLogPage: React.FC = () => {
  const { t } = useTranslation();
  const { auditLogs } = useAuditStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const actionTypes = [
    'all',
    'ROLE_ASSIGNMENT',
    'COURSE_PUBLISHED',
    'CERTIFICATE_MINTED',
    'USER_APPROVAL',
    'TRAINER_INVITE_DISPATCHED',
    'BULK_USER_ONBOARDING'
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
          Compliance & Security Trail
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900">
          {t('admin.auditLogTitle')}
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Immutable event ledger recording operational role clearances, certificate issuance, course modifications, and training assignments across the India Meteorological Department.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by operator, target officer, or operational detail..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800"
          />
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 no-scrollbar">
          <span className="text-slate-400 font-bold mr-1 flex items-center gap-1 flex-shrink-0">
            <Filter size={13} />
            <span>Filter Event:</span>
          </span>
          {actionTypes.map((act) => (
            <button
              key={act}
              onClick={() => setSelectedAction(act)}
              className={`px-3 py-1.5 rounded-lg font-semibold flex-shrink-0 transition-all ${
                selectedAction === act
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {act === 'all' ? 'All Operations' : act}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity size={16} className="text-sky-700" />
            <span>Chronological Event Records ({filteredLogs.length})</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">ISO 27001 Audited</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-3">Timestamp</th>
                <th className="pb-3">Operator / Actor</th>
                <th className="pb-3">Action Type</th>
                <th className="pb-3">Target Asset / Officer</th>
                <th className="pb-3">Operational Details</th>
                <th className="pb-3 pr-3 text-right">Gateway IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pl-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 font-sans font-bold text-slate-900">{log.actorName}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 font-sans text-sky-900 font-semibold">{log.target}</td>
                  <td className="py-3 font-sans text-slate-600 max-w-xs truncate">{log.details}</td>
                  <td className="py-3 pr-3 text-right text-slate-400">{log.ipAddress || '10.42.1.22'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
