import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Edit3, Download, ChevronDown, ChevronUp, User } from 'lucide-react';
import type { Student } from '../../types';
import CategoryBadge from '../ui/CategoryBadge';

interface StudentTableProps {
  students: Student[];
  onViewProfile: (student: Student) => void;
  onEdit: (student: Student) => void;
}

export default function StudentTable({ students, onViewProfile, onEdit }: StudentTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(students.length / perPage);
  const paginated = students.slice((currentPage - 1) * perPage, currentPage * perPage);

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-surface-border p-12 text-center">
        <User size={48} className="mx-auto text-text-muted mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-1">No students found</h3>
        <p className="text-sm text-text-secondary">Try adjusting your filters or search criteria</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-surface-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-gray-50/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Sl No</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">USN</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Branch</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Quota</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Gender</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((student) => (
              <motion.tr
                key={student.id ?? student.usn}
                layout
                className="table-row-hover border-b border-gray-50 cursor-pointer"
                onClick={() => setExpandedId(expandedId === (student.id ?? student.usn) ? null : (student.id ?? student.usn))}
              >
                <td className="px-4 py-3 text-text-secondary">{student.sl_no || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {(student.name || '?').split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{student.name || 'Unknown'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary font-mono text-xs">{student.usn}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-surface-bg rounded-lg text-xs font-medium text-text-secondary">{student.branch}</span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{student.quota}</td>
                <td className="px-4 py-3"><CategoryBadge category={student.category} /></td>
                <td className="px-4 py-3 text-text-muted text-xs">{student.gender || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => onViewProfile(student)} className="p-1.5 rounded-lg hover:bg-primary-50 text-text-muted hover:text-primary transition-colors" title="View Profile">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => onEdit(student)} className="p-1.5 rounded-lg hover:bg-blue-50 text-text-muted hover:text-accent-blue transition-colors" title="Edit">
                      <Edit3 size={16} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-green-50 text-text-muted hover:text-accent-green transition-colors" title="Download PDF">
                      <Download size={16} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-text-muted transition-colors" onClick={() => setExpandedId(expandedId === (student.id ?? student.usn) ? null : (student.id ?? student.usn))}>
                      {expandedId === (student.id ?? student.usn) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Inline Expanded Preview */}
        <AnimatePresence>
          {expandedId && paginated.find(s => (s.id ?? s.usn) === expandedId) && (() => {
            const s = paginated.find(st => (st.id ?? st.usn) === expandedId)!;
            return (
              <motion.div
                key={`expand-${s.id ?? s.usn}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-primary-100 bg-primary-50/20 px-6 py-4"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-text-secondary">
                  <div>
                    <span className="text-text-muted text-xs">Sl No</span>
                    <p className="font-medium text-text-primary">{s.sl_no ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">Branch</span>
                    <p className="font-medium text-text-primary">{s.branch}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">Quota</span>
                    <p className="font-medium text-text-primary">{s.quota}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">Category</span>
                    <p className="mt-1"><CategoryBadge category={s.category} /></p>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border">
          <p className="text-sm text-text-muted">
            Showing {(currentPage-1)*perPage+1}–{Math.min(currentPage*perPage, students.length)} of {students.length}
          </p>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === i + 1 ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
