import { motion } from 'framer-motion';
import { X, User, GraduationCap, Award } from 'lucide-react';
import type { Student } from '../../types';
import CategoryBadge from '../ui/CategoryBadge';

interface StudentProfileProps {
  student: Student;
  onClose: () => void;
}

export default function StudentProfile({ student, onClose }: StudentProfileProps) {
  const s = student;
  const sections = [
    {
      title: 'Basic Information',
      icon: <User size={18} />,
      fields: [
        { label: 'Full Name', value: s.name },
        { label: 'Gender', value: s.gender },
      ],
    },
    {
      title: 'Admission Details',
      icon: <GraduationCap size={18} />,
      fields: [
        { label: 'Sl No', value: s.sl_no },
        { label: 'USN', value: s.usn },
        { label: 'Branch', value: s.branch },
        { label: 'Quota', value: s.quota },
      ],
    },
    {
      title: 'Category',
      icon: <Award size={18} />,
      fields: [
        { label: 'Category', value: s.category, isBadge: true },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-modal w-full max-w-2xl mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
              <span className="text-white font-bold">{s.name.split(' ').map(n=>n[0]).join('')}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">{s.name}</h2>
              <p className="text-sm text-text-muted">{s.usn} • {s.branch}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Sections */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-primary">{section.icon}</span>
                <h3 className="text-sm font-semibold text-text-primary">{section.title}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.fields.map(field => (
                  <div key={field.label} className="bg-surface-bg rounded-xl px-4 py-3">
                    <p className="text-xs text-text-muted mb-0.5">{field.label}</p>
                    {'isBadge' in field && field.isBadge ? (
                      <CategoryBadge category={s.category} />
                    ) : (
                      <p className="text-sm font-medium text-text-primary">{field.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
