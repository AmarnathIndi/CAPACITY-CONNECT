import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Award,
  Lock,
  Plus,
  Trash2,
  CheckCircle,
  Save,
  KeyRound,
  ShieldCheck,
  Star
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { UserSkill } from '../../types';
import { Avatar } from '../../components/common/Avatar';

export const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, updateProfile } = useAuthStore();

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-slate-600">Please sign in to view your profile.</p>
      </div>
    );
  }

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [office, setOffice] = useState(currentUser.office);
  const [designation, setDesignation] = useState(currentUser.designation);
  const [experienceYears, setExperienceYears] = useState(currentUser.experienceYears);
  const [skills, setSkills] = useState<UserSkill[]>(currentUser.skills || []);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const added: UserSkill = {
      name: newSkillName.trim(),
      level: newSkillLevel,
      verified: false
    };
    setSkills([...skills, added]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkills(skills.filter((s) => s.name !== skillName));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      phone,
      office,
      designation,
      experienceYears: Number(experienceYears),
      skills
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) return;
    setPasswordSuccess(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <Avatar size="xl" className="w-24 h-24 min-w-24 min-h-24 shadow-md" name={currentUser.name} />
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">{currentUser.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
              {currentUser.role}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              ● Active Staff
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            {currentUser.designation} • {currentUser.office}
          </p>
          <p className="text-xs text-slate-400">Official ID: {currentUser.email}</p>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              <span>{currentUser.points} Capacity Points</span>
            </div>
            <div className="flex items-center gap-1.5 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
              <Award size={14} className="text-sky-600" />
              <span>{currentUser.badges.length} Earned Badges</span>
            </div>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
          <span>Profile changes updated and synced across IMD Staff Directory.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details Form (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User size={18} className="text-sky-700" />
              <span>Official Details & Station Assignment</span>
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Mobile Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Station / Regional Office</label>
                  <select
                    value={office}
                    onChange={(e) => setOffice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-900 bg-white"
                  >
                    <option value="New Delhi HQ">New Delhi HQ (Mausam Bhavan)</option>
                    <option value="Chennai RMC">Chennai RMC (Southern Region)</option>
                    <option value="Guwahati NEC">Guwahati NEC (North Eastern)</option>
                    <option value="Kolkata RMC">Kolkata RMC (Eastern Region)</option>
                    <option value="Mumbai RMC">Mumbai RMC (Western Region)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Years of Operational Experience</label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Joined Service Date</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.joinedDate}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
                  />
                </div>
              </div>

              {/* Skills Editor */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block font-bold text-slate-800 mb-2">
                  Meteorological Skills & Instrument Competencies
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((s) => (
                    <span
                      key={s.name}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 text-xs font-medium"
                    >
                      <span>{s.name}</span>
                      <span className="text-[10px] text-sky-600 font-bold">({s.level})</span>
                      {s.verified ? (
                        <span title="IMD Verified Skill">
                          <ShieldCheck size={13} className="text-emerald-600" />
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s.name)}
                        className="text-slate-400 hover:text-red-600 ml-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Skill Row */}
                <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Add skill (e.g. Dvorak Technique, AWS Calibration)..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value as any)}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-xl shadow-xs flex items-center gap-2"
                >
                  <Save size={15} />
                  <span>Save Profile Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar: Change Password & Earned Badges (1 Col) */}
        <div className="space-y-6">
          {/* Change Password Card */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
              <KeyRound size={16} className="text-sky-700" />
              <span>Change Portal Password</span>
            </h3>

            {passwordSuccess && (
              <div className="p-3 mb-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-600" />
                <span>Password changed successfully.</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-xs transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Milestone Badges Card */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Award size={16} className="text-amber-500" />
              <span>Earned Milestone Badges</span>
            </h3>

            <div className="space-y-2">
              {currentUser.badges.map((badge) => (
                <div
                  key={badge}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center space-x-2.5"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                    🎖️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-950">{badge}</p>
                    <p className="text-[10px] text-amber-800">Verified IMD Competency Standard</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
