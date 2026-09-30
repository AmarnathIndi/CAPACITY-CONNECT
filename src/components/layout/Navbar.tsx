import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CloudLightning,
  BookOpen,
  Award,
  TrendingUp,
  BarChart2,
  Users,
  UserCheck,
  Calendar,
  Sparkles,
  FileSpreadsheet,
  Compass,
  FileText,
  Radio,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Layers,
  MapPin,
  Clock
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { Avatar } from '../common/Avatar';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, demoLogin, users } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const pendingApprovalsCount = users.filter((u) => u.status === 'pending').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDemoSwitch = (role: 'trainee' | 'trainer' | 'admin') => {
    demoLogin(role);
    setUserMenuOpen(false);
    if (role === 'trainee') navigate('/trainee/catalog');
    else if (role === 'trainer') navigate('/trainer/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center space-x-3 group">
            {/* Government Emblem / IMD Logo placeholder */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#002D62] text-white flex items-center justify-center shadow-md border-2 border-sky-400 group-hover:scale-105 transition-transform flex-shrink-0">
              <CloudLightning size={24} className="text-amber-400" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#002D62]">
                  {i18n.language === 'hi' ? 'क्षमता कनेक्ट' : 'CAPACITY CONNECT'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 uppercase tracking-wider">
                  IMD MoES
                </span>
              </div>
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
                {i18n.language === 'hi'
                  ? 'भारत मौसम विज्ञान विभाग | राष्ट्रीय प्रशिक्षण मंच'
                  : 'India Meteorological Department | Training & Capacity Building'}
              </span>
            </div>
          </Link>

          {/* Desktop Role-Based Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                isActive('/') ? 'bg-sky-50 text-[#002D62]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('nav.home')}
            </Link>

            {/* Trainee Navigation */}
            {currentUser?.role === 'trainee' && (
              <>
                <Link
                  to="/trainee/catalog"
                  className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive('/trainee/catalog')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen size={15} />
                  <span>{t('nav.catalog')}</span>
                </Link>
                <Link
                  to="/trainee/learning-path"
                  className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive('/trainee/learning-path')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Layers size={15} />
                  <span>{t('nav.learningPath')}</span>
                </Link>
                <Link
                  to="/trainee/progress"
                  className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive('/trainee/progress')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <TrendingUp size={15} />
                  <span>{t('nav.myProgress')}</span>
                </Link>
                <Link
                  to="/trainee/certificates"
                  className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive('/trainee/certificates')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Award size={15} />
                  <span>{t('nav.certificates')}</span>
                </Link>
                <Link
                  to="/trainee/leaderboard"
                  className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive('/trainee/leaderboard')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart2 size={15} />
                  <span>{t('nav.leaderboard')}</span>
                </Link>
              </>
            )}

            {/* Trainer Navigation */}
            {currentUser?.role === 'trainer' && (
              <>
                <Link
                  to="/trainer/dashboard"
                  className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                    isActive('/trainer/dashboard')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t('nav.trainerDashboard')}
                </Link>
                <Link
                  to="/trainer/ai-test-generator"
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold bg-gradient-to-r from-purple-50 to-sky-50 text-purple-900 border border-purple-200 flex items-center gap-1.5 hover:shadow-xs transition-all`}
                >
                  <Sparkles size={14} className="text-purple-600" />
                  <span>{t('nav.aiTestGen')}</span>
                </Link>
                <Link
                  to="/trainer/courses/new"
                  className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                    isActive('/trainer/courses/new')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t('nav.createCourse')}
                </Link>
                <Link
                  to="/trainer/library"
                  className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                    isActive('/trainer/library')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t('nav.trainerLibrary')}
                </Link>
                <Link
                  to="/trainer/results"
                  className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                    isActive('/trainer/results')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t('nav.trainerResults')}
                </Link>
                <Link
                  to="/trainer/availability"
                  className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                    isActive('/trainer/availability')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t('nav.trainerAvailability')}
                </Link>
                <Link
                  to="/trainer/invitations"
                  className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                    isActive('/trainer/invitations')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t('nav.trainerInvitations')}
                </Link>
              </>
            )}

            {/* Admin Navigation */}
            {currentUser?.role === 'admin' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    isActive('/admin/dashboard')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t('nav.adminDashboard')}
                </Link>
                <Link
                  to="/admin/approvals"
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold relative flex items-center gap-1 transition-colors ${
                    isActive('/admin/approvals')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck size={14} />
                  <span>{t('nav.approvals')}</span>
                  {pendingApprovalsCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold animate-pulse">
                      {pendingApprovalsCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/admin/expert-finder"
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                    isActive('/admin/expert-finder')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Compass size={14} />
                  <span>Expert Finder</span>
                </Link>
                <Link
                  to="/admin/trainer-matching"
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                    isActive('/admin/trainer-matching')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles size={14} className="text-sky-600" />
                  <span>Trainer Match</span>
                </Link>
                <Link
                  to="/admin/bulk-upload"
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                    isActive('/admin/bulk-upload')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileSpreadsheet size={14} />
                  <span>Bulk Upload</span>
                </Link>
                <Link
                  to="/admin/audit-log"
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                    isActive('/admin/audit-log')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText size={14} />
                  <span>{t('nav.auditLog')}</span>
                </Link>
                <Link
                  to="/admin/sessions"
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                    isActive('/admin/sessions')
                      ? 'bg-sky-50 text-[#002D62] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Radio size={14} />
                  <span>{t('nav.liveSessions')}</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Header Utilities & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notification Bell */}
            <NotificationDropdown />

            {/* If logged in: User Info & Persona switcher */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="User account menu"
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <Avatar size="sm" name={currentUser.name} />
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1 leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium capitalize flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {currentUser.role} • {currentUser.office.split(' ')[0]}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {/* Profile & Persona Switcher Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-10 z-50 divide-y divide-slate-100 animate-in fade-in duration-150">
                    <div className="p-3 bg-slate-50 rounded-t-lg">
                      <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold uppercase tracking-wider">
                          {currentUser.role}
                        </span>
                        <span className="text-amber-700 font-bold">★ {currentUser.points} pts</span>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded font-medium"
                      >
                        <UserIcon size={14} className="text-slate-500" />
                        <span>Edit My Profile</span>
                      </Link>
                      {currentUser.role === 'trainee' && (
                        <Link
                          to="/trainee/profile-builder"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded font-medium"
                        >
                          <Compass size={14} className="text-slate-500" />
                          <span>Qualifications & Skills Builder</span>
                        </Link>
                      )}
                    </div>

                    {/* Quick Demo Switcher Section */}
                    <div className="p-2.5 bg-slate-50/60">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Quick Demo Persona Switch
                      </p>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => handleDemoSwitch('trainee')}
                          className={`px-1.5 py-1 text-[11px] rounded font-semibold border ${
                            currentUser.role === 'trainee'
                              ? 'bg-sky-600 text-white border-sky-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          Trainee
                        </button>
                        <button
                          onClick={() => handleDemoSwitch('trainer')}
                          className={`px-1.5 py-1 text-[11px] rounded font-semibold border ${
                            currentUser.role === 'trainer'
                              ? 'bg-sky-600 text-white border-sky-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          Trainer
                        </button>
                        <button
                          onClick={() => handleDemoSwitch('admin')}
                          className={`px-1.5 py-1 text-[11px] rounded font-semibold border ${
                            currentUser.role === 'admin'
                              ? 'bg-sky-600 text-white border-sky-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          Admin
                        </button>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded font-semibold"
                      >
                        <LogOut size={14} />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#002D62] hover:bg-[#0A2540] rounded shadow-xs"
                >
                  {t('nav.login')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2 text-sm">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-medium text-slate-700 hover:text-sky-700"
          >
            {t('nav.home')}
          </Link>

          {currentUser?.role === 'trainee' && (
            <>
              <Link
                to="/trainee/catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 font-medium text-slate-700 hover:text-sky-700"
              >
                {t('nav.catalog')}
              </Link>
              <Link
                to="/trainee/learning-path"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 font-medium text-slate-700 hover:text-sky-700"
              >
                {t('nav.learningPath')}
              </Link>
              <Link
                to="/trainee/progress"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 font-medium text-slate-700 hover:text-sky-700"
              >
                {t('nav.myProgress')}
              </Link>
              <Link
                to="/trainee/certificates"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 font-medium text-slate-700 hover:text-sky-700"
              >
                {t('nav.certificates')}
              </Link>
              <Link
                to="/trainee/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 font-medium text-slate-700 hover:text-sky-700"
              >
                {t('nav.leaderboard')}
              </Link>
            </>
          )}

          {currentUser?.role === 'trainer' && (
            <>
              <Link
                to="/trainer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 font-medium text-slate-700 hover:text-sky-700"
              >
                {t('nav.trainerDashboard')}
              </Link>
              <Link
                to="/trainer/ai-test-generator"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 font-bold text-purple-700"
              >
                ✨ {t('nav.aiTestGen')}
              </Link>
              <Link
                to="/trainer/courses/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 font-medium text-slate-700 hover:text-sky-700"
              >
                {t('nav.createCourse')}
              </Link>
              <Link
                to="/trainer/library"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 font-medium text-slate-700 hover:text-sky-700"
              >
                {t('nav.trainerLibrary')}
              </Link>
              <Link
                to="/trainer/results"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 font-medium text-slate-700 hover:text-sky-700"
              >
                {t('nav.trainerResults')}
              </Link>
            </>
          )}

          {currentUser?.role === 'admin' && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 font-medium text-slate-700 hover:text-sky-700"
              >
                {t('nav.adminDashboard')}
              </Link>
              <Link
                to="/admin/approvals"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 font-medium text-slate-700 hover:text-sky-700"
              >
                {t('nav.approvals')} ({pendingApprovalsCount})
              </Link>
              <Link
                to="/admin/expert-finder"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 font-medium text-slate-700 hover:text-sky-700"
              >
                Expert Finder & Skill Graph
              </Link>
              <Link
                to="/admin/trainer-matching"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 font-medium text-slate-700 hover:text-sky-700"
              >
                Trainer Matching & Scheduling
              </Link>
              <Link
                to="/admin/bulk-upload"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 font-medium text-slate-700 hover:text-sky-700"
              >
                Bulk Staff Upload
              </Link>
              <Link
                to="/admin/audit-log"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 font-medium text-slate-700 hover:text-sky-700"
              >
                {t('nav.auditLog')}
              </Link>
            </>
          )}

          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Switch Demo Persona</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleDemoSwitch('trainee');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-1.5 text-xs bg-slate-100 rounded font-semibold text-slate-800"
              >
                Trainee
              </button>
              <button
                onClick={() => {
                  handleDemoSwitch('trainer');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-1.5 text-xs bg-slate-100 rounded font-semibold text-slate-800"
              >
                Trainer
              </button>
              <button
                onClick={() => {
                  handleDemoSwitch('admin');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-1.5 text-xs bg-slate-100 rounded font-semibold text-slate-800"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
