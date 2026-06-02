import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, BookOpen, Award } from 'lucide-react';
import { studentService } from '../api/studentService';
import type { Student } from '../types';
import { normalizeGender } from '../utils/gender';
import CategoryBadge from '../components/ui/CategoryBadge';

export default function Admissions() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await studentService.getStudents();
        setStudents(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const byType = {
      KCET: students.filter(s => s.quota === 'KCET'),
      MANAGEMENT: students.filter(s => s.quota === 'MANAGEMENT'),
      KRLMPCA: students.filter(s => s.quota === 'KRLMPCA'),
      SNQ: students.filter(s => s.quota === 'SNQ'),
      DIPLOMA: students.filter(s => s.quota === 'DIPLOMA'),
    };
    return Object.entries(byType).map(([type, list]) => ({
      type,
      total: list.length,
      male: list.filter((s) => normalizeGender(s.gender) === 'Male').length,
      female: list.filter((s) => normalizeGender(s.gender) === 'Female').length,
    })).filter(s => s.total > 0);
  }, [students]);

  const icons: any = { KCET: <GraduationCap size={20} />, MANAGEMENT: <BookOpen size={20} />, KRLMPCA: <Award size={20} />, DIPLOMA: <Users size={20} />, SNQ: <Award size={20} /> };
  const colors: any = { KCET: 'from-primary to-primary-hover', MANAGEMENT: 'from-accent-blue to-blue-600', KRLMPCA: 'from-accent-green to-emerald-600', DIPLOMA: 'from-accent-orange to-amber-600', SNQ: 'from-pink-500 to-rose-600' };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Admissions Overview</h1>
        <p className="text-sm text-text-secondary mt-0.5">Admission quota breakdown and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {stats.map((s, idx) => (
          <motion.div
            key={s.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-5 shadow-card border border-surface-border"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colors[s.type] || 'from-gray-500 to-gray-700'} text-white`}>
                {icons[s.type] || <Users size={20} />}
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">{s.type}</h3>
                <p className="text-2xl font-bold text-text-primary">{s.total}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm border-t border-surface-border pt-3">
              <div className="flex justify-between">
                <span className="text-text-muted">Male</span>
                <span className="font-medium text-text-primary">{s.male}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Female</span>
                <span className="font-medium text-text-primary">{s.female}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-card border border-surface-border overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border">
          <h3 className="text-lg font-semibold text-text-primary">Recent Admissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-surface-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">USN</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Quota</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Branch</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Gender</th>
              </tr>
            </thead>
            <tbody>
              {students.slice(0, 20).map(s => (
                <tr key={s.id ?? s.usn} className="table-row-hover border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-text-primary">{s.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">{s.usn}</td>
                  <td className="px-4 py-3 text-text-secondary font-semibold">{s.quota}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-surface-bg rounded-lg text-xs font-medium">{s.branch}</span></td>
                  <td className="px-4 py-3"><CategoryBadge category={s.category} /></td>
                  <td className="px-4 py-3 text-text-secondary">{s.gender || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
