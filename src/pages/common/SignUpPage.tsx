import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  Building,
  Mail,
  User,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { UserRole } from '../../types';

export const SignUpPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [office, setOffice] = useState('New Delhi HQ');
  const [designation, setDesignation] = useState('Scientific Assistant');
  const [role, setRole] = useState<UserRole>('trainee');
  const [submitted, setSubmitted] = useState(false);
  const [createdUser, setCreatedUser] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    const res = await signup({
      name: fullName,
      email,
      office,
      designation,
      role
    });

    // Notify admins of new pending registration
    addNotification({
      userId: 'usr-admin-1',
      title: 'New Staff Registration Awaiting Clearance',
      titleHi: 'नया कर्मचारी पंजीकरण स्वीकृति हेतु लंबित',
      message: `${fullName} (${designation}, ${office}) registered and requires role clearance.`,
      type: 'approval',
      link: '/admin/approvals'
    });

    setCreatedUser(res.user);
    setSubmitted(true);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-lg w-full space-y-6">
        {!submitted ? (
          <>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#002D62] text-amber-400 flex items-center justify-center shadow-md">
                <UserCheck size={24} />
              </div>
              <h2 className="text-2xl font-extrabold text-[#002D62] tracking-tight">
                {t('auth.signupTitle')}
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t('auth.signupDesc')}
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('auth.fullName')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra Verma"
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-900"
                    />
                    <User size={15} className="absolute left-3 top-3 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ramesh.verma@imd.gov.in"
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-900"
                    />
                    <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Must use official government or organizational email ID.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('auth.office')}
                    </label>
                    <select
                      value={office}
                      onChange={(e) => setOffice(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-900 bg-white"
                    >
                      <option value="New Delhi HQ">New Delhi HQ</option>
                      <option value="Chennai RMC">Chennai RMC (Southern)</option>
                      <option value="Guwahati NEC">Guwahati NEC (North Eastern)</option>
                      <option value="Kolkata RMC">Kolkata RMC (Eastern)</option>
                      <option value="Mumbai RMC">Mumbai RMC (Western)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('auth.role')}
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-900 bg-white"
                    >
                      <option value="trainee">Trainee / Operational Staff</option>
                      <option value="trainer">Trainer / Subject Specialist</option>
                      <option value="admin">Regional Administrator</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('auth.designation')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Scientific Assistant (Radar/AWS)"
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-900"
                    />
                    <Briefcase size={15} className="absolute left-3 top-3 text-slate-400" />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start space-x-2">
                  <ShieldAlert size={15} className="text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>
                    New accounts remain in <strong>"Pending Approval"</strong> status until sanctioned by the National Training Directorate in New Delhi.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-xl shadow-md transition-colors"
                >
                  Submit Registration Request
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
                <span>Already have an active account? </span>
                <Link to="/login" className="font-bold text-sky-700 hover:underline">
                  Sign In
                </Link>
              </div>
            </div>
          </>
        ) : (
          /* Submission Confirmation Card: Lands in Pending Approval */
          <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-amber-300 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto border-4 border-amber-200">
              <Clock size={32} />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
                Status: Pending Approval
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                Registration Request Logged
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                {t('auth.pendingApprovalNotice')}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-900">{createdUser?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Official Email:</span>
                <span className="font-medium text-slate-800">{createdUser?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Station Office:</span>
                <span className="font-medium text-slate-800">{createdUser?.office}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Role:</span>
                <span className="font-bold text-purple-700 uppercase">{createdUser?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submission Timestamp:</span>
                <span className="font-medium text-slate-800">{new Date().toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Link
                to="/login"
                className="flex-1 py-2.5 px-4 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Back to Sign In
              </Link>
              <button
                onClick={() => {
                  // Switch to Admin persona so user can immediately experience approving this user!
                  navigate('/admin/approvals');
                }}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors"
              >
                Inspect in Admin Approvals Queue →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
