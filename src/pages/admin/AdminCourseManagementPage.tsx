import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Plus,
  Trash2,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Award,
  ExternalLink
} from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';
import { useAuditStore } from '../../store/useAuditStore';

export const AdminCourseManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { courses, deleteCourse } = useCourseStore();
  const { logAction } = useAuditStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [notice, setNotice] = useState('');

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from the active course registry?`)) {
      deleteCourse(id);
      logAction('Dr. M. Mohapatra', 'Admin', 'COURSE_DELETED', title, `Removed course ${id} from catalog`);
      setNotice(`Course "${title}" removed.`);
      setTimeout(() => setNotice(''), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
            Curriculum Administration
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Master Course Registry & Catalog Oversight
          </h1>
          <p className="text-xs text-slate-500">
            Publish, manage, and audit meteorological modules, lesson materials, and examination links.
          </p>
        </div>

        <Link
          to="/trainer/courses/new"
          className="px-5 py-2.5 bg-[#002D62] hover:bg-[#0A2540] text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-md transition-colors flex-shrink-0"
        >
          <Plus size={16} />
          <span>Publish New Course</span>
        </Link>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Courses List Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="relative max-w-md w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by course code, title, or discipline..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          </div>

          <span className="text-xs text-slate-400 font-semibold">
            {filteredCourses.length} Courses Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-3">Course Code & Title</th>
                <th className="pb-3">Discipline</th>
                <th className="pb-3">Level</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3">Lead Instructor</th>
                <th className="pb-3">Enrolled</th>
                <th className="pb-3 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 pl-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 mr-2">
                      {c.code}
                    </span>
                    <span className="font-bold text-slate-900">{c.title}</span>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-700">{c.category}</td>
                  <td className="py-3.5 text-slate-600">{c.level}</td>
                  <td className="py-3.5 text-slate-500">{c.duration}</td>
                  <td className="py-3.5 text-slate-800 font-medium">{c.trainerName}</td>
                  <td className="py-3.5 font-bold text-sky-700">{c.enrolledUsers.length} staff</td>
                  <td className="py-3.5 pr-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/trainee/course/${c.id}`}
                        className="p-1.5 text-slate-400 hover:text-sky-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="View Course"
                      >
                        <ExternalLink size={15} />
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id, c.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
