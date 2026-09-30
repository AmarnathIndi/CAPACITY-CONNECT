import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Building,
  Mail,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuditStore } from '../../store/useAuditStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { UserRole } from '../../types';
import { Avatar } from '../../components/common/Avatar';

export const AdminUserApprovalsPage: React.FC = () => {
  const { t } = useTranslation();
  const { users, approveUser, rejectUser, currentUser } = useAuthStore();
  const { logAction } = useAuditStore();
  const { addNotification } = useNotificationStore();

  const [assignedRoles, setAssignedRoles] = useState<Record<string, UserRole>>({});
  const [actionNotice, setActionNotice] = useState('');

  const pendingUsers = users.filter((u) => u.status === 'pending');

  const handleRoleChange = (userId: string, role: UserRole) => {
    setAssignedRoles({
      ...assignedRoles,
      [userId]: role
    });
  };

  const handleApprove = (userId: string, applicantName: string) => {
    const roleToAssign = assignedRoles[userId] || 'trainee';
    approveUser(userId, roleToAssign);

    logAction(
      currentUser?.name || 'Dr. M. Mohapatra',
      'Admin',
      'USER_APPROVAL',
      applicantName,
      `Approved registration and assigned role: ${roleToAssign.toUpperCase()}`
    );

    addNotification({
      userId,
      title: 'IMD Portal Registration Approved',
      titleHi: 'आईएमडी पोर्टल पंजीकरण स्वीकृत',
      message: `Your registration request has been approved. You are assigned as ${roleToAssign.toUpperCase()}.`,
      type: 'approval'
    });

    setActionNotice(`Applicant "${applicantName}" approved with role: ${roleToAssign.toUpperCase()}`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleReject = (userId: string, applicantName: string) => {
    rejectUser(userId);

    logAction(
      currentUser?.name || 'Dr. M. Mohapatra',
      'Admin',
      'USER_REJECTION',
      applicantName,
      'Rejected account request due to unverified departmental credentials'
    );

    setActionNotice(`Applicant "${applicantName}" registration request rejected.`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
            Clearance Queue
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            {pendingUsers.length} Pending Verifications
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Staff Account Approvals & Role Clearance
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Verify employee identity, review regional station postings, assign appropriate operational portal privileges (Trainee, Trainer, or Regional Admin), and authorize access.
        </p>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Pending Applicants List */}
      <div className="space-y-4">
        {pendingUsers.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Clearance Queue Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All staff registration requests across all Regional Meteorological Centres have been processed.
            </p>
          </div>
        ) : (
          pendingUsers.map((u) => {
            const currentSelectedRole = assignedRoles[u.id] || u.role;

            return (
              <div
                key={u.id}
                className="bg-white p-6 rounded-3xl border border-amber-200 shadow-xs space-y-4 hover:border-amber-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <Avatar size="lg" name={u.name} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-extrabold text-base text-slate-900">{u.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 uppercase">
                          Pending Approval
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {u.designation} • {u.office}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                    </div>
                  </div>

                  {/* Role Assignment Selector */}
                  <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700">Assign Privilege:</span>
                    <select
                      value={currentSelectedRole}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-sky-900 text-xs"
                    >
                      <option value="trainee">Trainee / Operational Staff</option>
                      <option value="trainer">Trainer / Subject Specialist</option>
                      <option value="admin">Regional Administrator</option>
                    </select>
                  </div>
                </div>

                {/* Extended Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Phone Contact
                    </span>
                    <span className="font-medium text-slate-800">{u.phone || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Experience
                    </span>
                    <span className="font-medium text-slate-800">{u.experienceYears} Year(s)</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Academic Background
                    </span>
                    <span className="font-medium text-slate-800 truncate block">
                      {u.qualifications[0] || 'Meteorological Diploma'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Application Date
                    </span>
                    <span className="font-medium text-slate-800">{u.joinedDate}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleReject(u.id, u.name)}
                    className="px-4 py-2 border border-red-300 bg-white hover:bg-red-50 text-red-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle size={14} />
                    <span>{t('admin.rejectUser')}</span>
                  </button>

                  <button
                    onClick={() => handleApprove(u.id, u.name)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors"
                  >
                    <CheckCircle2 size={14} />
                    <span>{t('admin.approveUser')} as {currentSelectedRole.toUpperCase()}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
