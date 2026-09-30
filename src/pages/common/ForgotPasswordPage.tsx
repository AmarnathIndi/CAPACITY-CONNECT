import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, CheckCircle2, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const { resetPassword } = useAuthStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    resetPassword(email);
    setSent(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#002D62] text-amber-400 flex items-center justify-center shadow-md">
            <KeyRound size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-[#002D62] tracking-tight">
            {t('auth.resetPassword')}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Enter your official @imd.gov.in email address to receive password recovery instructions.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. trainee@imd.gov.in"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                  <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-xl shadow-md transition-colors"
              >
                Send Password Reset Link
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:underline"
                >
                  <ArrowLeft size={14} />
                  <span>{t('auth.backToLogin')}</span>
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4 py-2 animate-in fade-in duration-150">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recovery Instructions Sent</h3>
                <p className="text-xs text-slate-500 mt-1">
                  A secure password reset link has been dispatched to <strong>{email}</strong>.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-block w-full py-2.5 px-4 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Return to Login Screen
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
