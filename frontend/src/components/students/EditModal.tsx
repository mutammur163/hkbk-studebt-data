import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Student, Branch, Quota, Category } from '../../types';

interface EditModalProps {
  student: Student;
  onClose: () => void;
  onSave: (updated: Student) => void;
}

const branchOptions: Branch[] = ['CSE', 'ECE', 'ME', 'CE', 'EEE', 'ISE', 'AIML', 'CV'];
const quotaOptions: Quota[] = ['KCET', 'MANAGEMENT', 'KRLMPCA', 'DIPLOMA', 'SNQ'];
const categories: Category[] = ['GM', 'SNQ', 'SC', 'ST', 'OBC-A', 'OBC-B'];

export default function EditModal({ student, onClose, onSave }: EditModalProps) {
  const [form, setForm] = useState<Student>({ ...student });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name?.trim()) errs.name = 'Name is required';
    if (!form.usn?.trim()) errs.usn = 'USN is required';
    if (!form.branch?.trim()) errs.branch = 'Branch is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      toast.error('Please fix the validation errors');
      return;
    }
    onSave({ ...form });
    onClose();
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2 border rounded-xl text-sm text-text-primary bg-white transition-colors ${
      errors[field] ? 'border-red-400 bg-red-50/30' : 'border-surface-border'
    }`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-modal w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-surface-border sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-text-primary">Edit Student Record</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Full Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass('name')} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">USN *</label>
              <input value={form.usn} onChange={(e) => setForm({ ...form, usn: e.target.value })} className={inputClass('usn')} />
              {errors.usn && <p className="text-xs text-red-500 mt-1">{errors.usn}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Serial number</label>
            <input
              value={form.sl_no ?? ''}
              onChange={(e) => setForm({ ...form, sl_no: e.target.value })}
              className={inputClass('')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Branch *</label>
              <select
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                className={inputClass('branch')}
              >
                {form.branch && !branchOptions.includes(form.branch as Branch) && (
                  <option value={form.branch}>{form.branch}</option>
                )}
                {branchOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.branch && <p className="text-xs text-red-500 mt-1">{errors.branch}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Quota</label>
              <select
                value={form.quota}
                onChange={(e) => setForm({ ...form, quota: e.target.value as Quota })}
                className={inputClass('')}
              >
                {quotaOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                className={inputClass('')}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Gender</label>
              <select
                value={form.gender || ''}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className={inputClass('')}
              >
                <option value="">—</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-surface-border sticky bottom-0 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
