import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserPlus,
  Trash2,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Mail,
  MapPin,
  Building
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuditStore } from '../../store/useAuditStore';
import { User, UserRole } from '../../types';
import { Avatar } from '../../components/common/Avatar';

export const AdminUserManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { users, signup, deleteUser } = useAuthStore();
  const { logAction } = useAuditStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New staff form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [office, setOffice] = useState('New Delhi HQ');
  const [designation, setDesignation] = useState('Meteorologist');
  const [role, setRole] = useState<UserRole>('trainee');
  const [notice, setNotice] = useState('');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    signup({
      name: name.trim(),
      email: email.trim(),
      office,
      designation: designation.trim(),
      role
    });

    logAction('Dr. M. Mohapatra', 'Admin', 'USER_CREATED', name, `Added ${name} to ${office} as ${role}`);

    setShowAddModal(false);
    setName('');
    setEmail('');
    setNotice(`Staff officer "${name}" registered successfully.`);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to remove ${userName} from the IMD Registry?`)) {
      deleteUser(userId);
      logAction('Dr. M. Mohapatra', 'Admin', 'USER_DELETED', userName, `Removed staff member from system`);
      setNotice(`Officer ${userName} removed from registry.`);
      setTimeout(() => setNotice(''), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
            HR Capacity Directory
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Staff Directory & Access Controls
          </h1>
          <p className="text-xs text-slate-500">
            Maintain authorized departmental personnel rosters, station allocations, and role permissions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-md transition-colors flex-shrink-0"
        >
          <UserPlus size={16} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter and Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or designation..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
            >
              <option value="all">All Roles</option>
              <option value="trainee">Trainee</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-3">Staff Officer</th>
                <th className="pb-3">Regional Office</th>
                <th className="pb-3">Designation</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 pl-3">
                    <div className="flex items-center space-x-3">
                      <Avatar size="sm" name={u.name} />
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-slate-700 font-medium">{u.office}</td>
                  <td className="py-3.5 text-slate-600">{u.designation}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold uppercase text-[10px]">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : u.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove Staff"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Add New Staff Officer
            </h3>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Harish Chandra"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Government Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. harish.chandra@imd.gov.in"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Office</label>
                  <select
                    value={office}
                    onChange={(e) => setOffice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="New Delhi HQ">New Delhi HQ</option>
                    <option value="Chennai RMC">Chennai RMC</option>
                    <option value="Guwahati NEC">Guwahati NEC</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="trainee">Trainee</option>
                    <option value="trainer">Trainer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Assistant Meteorologist"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-xl shadow-xs"
                >
                  Save Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
