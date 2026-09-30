import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CloudLightning,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, demoLogin } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your registered government email address.');
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setErrorMsg(res.message || 'Authentication failed. Please verify credentials.');
      return;
    }
    redirectAfterLogin(res.user?.role || 'trainee');
  };

  const handleDemo = (role: UserRole) => {
    const user = demoLogin(role);
    redirectAfterLogin(user.role);
  };

  const redirectAfterLogin = (role: UserRole) => {
    const from = (location.state as any)?.from?.pathname;
    if (from) {
      navigate(from);
      return;
    }

    if (role === 'trainee') navigate('/trainee/catalog');
    else if (role === 'trainer') navigate('/trainer/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Header Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-[#002D62] text-amber-400 flex items-center justify-center shadow-lg border-2 border-sky-400">
            <CloudLightning size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-[#002D62] tracking-tight">
            {t('auth.signInTitle')}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t('auth.signInDesc')}
          </p>
        </div>

        {/* 1-Click Quick Demo Login Box */}
        <div className="bg-gradient-to-br from-sky-50 to-blue-50/60 p-4 sm:p-5 rounded-2xl border-2 border-sky-200 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-sky-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={16} className="text-amber-500" />
            <span>{t('auth.quickDemoLogin')}</span>
          </div>

          <p className="text-[11px] text-slate-600 leading-snug">
            Instantly evaluate the portal using predefined IMD staff profiles:
          </p>

          <div className="grid grid-cols-1 gap-2 pt-1">
            <button
              onClick={() => handleDemo('trainee')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white hover:bg-sky-50 border border-sky-200 hover:border-sky-400 rounded-xl text-left shadow-xs transition-all group"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-sky-800">
                  {t('auth.demoTrainee')}
                </div>
                <div className="text-[10px] text-slate-500">
                  Meteorologist 'A' • New Delhi HQ • ID: trainee@imd.gov.in
                </div>
              </div>
              <ArrowRight size={14} className="text-sky-600 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleDemo('trainer')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white hover:bg-purple-50 border border-purple-200 hover:border-purple-400 rounded-xl text-left shadow-xs transition-all group"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-purple-800">
                  {t('auth.demoTrainer')}
                </div>
                <div className="text-[10px] text-slate-500">
                  Scientist 'E' (Senior Radar Specialist) • trainer@imd.gov.in
                </div>
              </div>
              <ArrowRight size={14} className="text-purple-600 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleDemo('admin')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white hover:bg-amber-50 border border-amber-200 hover:border-amber-400 rounded-xl text-left shadow-xs transition-all group"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800">
                  {t('auth.demoAdmin')}
                </div>
                <div className="text-[10px] text-slate-500">
                  Director General of Meteorology • admin@imd.gov.in
                </div>
              </div>
              <ArrowRight size={14} className="text-amber-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Standard Credentials Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
              Or Sign In with Email
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-800">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('auth.email')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. trainee@imd.gov.in"
                  className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900"
                />
                <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  {t('auth.password')}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-sky-700 hover:underline"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900"
                />
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-xl shadow-md transition-colors"
            >
              {t('auth.loginButton')}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span>{t('auth.newUser')} </span>
            <Link to="/signup" className="font-bold text-sky-700 hover:underline">
              {t('auth.register')}
            </Link>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>NIC Government Single Sign-On (SSO) Ready</span>
        </div>
      </div>
    </div>
  );
};
