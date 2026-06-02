import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Users, UserCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { studentService } from '../api/studentService';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import type { Student, Branch } from '../types';
import { normalizeGender } from '../utils/gender';

const defaultBranches: Branch[] = ['CSE', 'ECE', 'ME', 'CE', 'EEE', 'ISE', 'AIML', 'CV'];

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b', '#ec4899', '#06b6d4'];

export default function CutoffAnalysis() {
  const [selectedBranch, setSelectedBranch] = useState<string>('CSE');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await studentService.getStudents();
        if (!cancelled) setStudents(data || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('Could not load student data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const branchTabs = useMemo(() => {
    const fromDb = [...new Set(students.map((s) => s.branch).filter(Boolean))] as string[];
    const merged = [...new Set([...defaultBranches, ...fromDb])];
    return merged.sort();
  }, [students]);

  const branchData = useMemo(() => students.filter((s) => s.branch === selectedBranch), [students, selectedBranch]);

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    branchData.forEach((s) => {
      if (s.category) counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [branchData]);

  const quotaStats = useMemo(() => {
    const counts: Record<string, number> = {};
    branchData.forEach((s) => {
      if (s.quota) counts[s.quota] = (counts[s.quota] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [branchData]);

  const genderStats = useMemo(() => {
    let male = 0;
    let female = 0;
    let other = 0;
    branchData.forEach((s) => {
      const g = normalizeGender(s.gender);
      if (g === 'Male') male += 1;
      else if (g === 'Female') female += 1;
      else other += 1;
    });
    const total = branchData.length;
    const pct = (n: number) => (total ? (n / total) * 100 : 0);
    return { male, female, other, total, malePct: pct(male), femalePct: pct(female), otherPct: pct(other) };
  }, [branchData]);

  const genderPieData = useMemo(() => {
    const rows = [
      { name: 'Male', value: genderStats.male },
      { name: 'Female', value: genderStats.female },
      { name: 'Other', value: genderStats.other },
    ];
    return rows.filter((r) => r.value > 0);
  }, [genderStats]);

  const genderBarData = useMemo(
    () => [
      { name: 'Male', count: genderStats.male },
      { name: 'Female', count: genderStats.female },
      { name: 'Other', count: genderStats.other },
    ],
    [genderStats]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Branch Analysis</h1>
          <p className="text-sm text-text-secondary mt-0.5">Category, quota, and gender distributions per branch</p>
        </div>
        <LoadingSkeleton type="card" />
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Branch Analysis</h1>
        <p className="text-sm text-text-secondary mt-0.5">Category, quota, and gender distributions per branch</p>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {branchTabs.map((branch) => (
          <button
            key={branch}
            onClick={() => setSelectedBranch(branch)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedBranch === branch
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-text-secondary border border-surface-border hover:bg-gray-50'
            }`}
          >
            {branch}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedBranch}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Table */}
            <div className="bg-white rounded-2xl shadow-card border border-surface-border overflow-hidden">
              <div className="px-6 py-4 border-b border-surface-border flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-50">
                  <Users size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Category Distribution</h3>
                  <p className="text-xs text-text-muted">
                    {selectedBranch} — Total: {branchData.length}
                  </p>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-surface-border">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Category</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase">Students</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryStats.map((entry) => (
                    <tr key={entry.name} className="table-row-hover border-b border-gray-50">
                      <td className="px-6 py-4 font-semibold text-text-primary">{entry.name}</td>
                      <td className="px-6 py-4 text-right font-mono text-text-secondary">{entry.count}</td>
                    </tr>
                  ))}
                  {categoryStats.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-text-muted">
                        No students for this branch.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Quota Table */}
            <div className="bg-white rounded-2xl shadow-card border border-surface-border overflow-hidden">
              <div className="px-6 py-4 border-b border-surface-border flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent-blue/10">
                  <Award size={18} className="text-accent-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Quota Distribution</h3>
                  <p className="text-xs text-text-muted">
                    {selectedBranch} — Total: {branchData.length}
                  </p>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-surface-border">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Quota</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase">Students</th>
                  </tr>
                </thead>
                <tbody>
                  {quotaStats.map((entry) => (
                    <tr key={entry.name} className="table-row-hover border-b border-gray-50">
                      <td className="px-6 py-4 font-semibold text-text-primary">{entry.name}</td>
                      <td className="px-6 py-4 text-right font-mono text-text-secondary">{entry.count}</td>
                    </tr>
                  ))}
                  {quotaStats.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-text-muted">
                        No students for this branch.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gender distribution */}
          <div className="bg-white rounded-2xl shadow-card border border-surface-border overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-border flex items-center gap-3">
              <div className="p-2 rounded-xl bg-pink-50">
                <UserCircle2 size={18} className="text-pink-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Gender Distribution</h3>
                <p className="text-xs text-text-muted">{selectedBranch} — live counts from Supabase</p>
              </div>
            </div>

            {branchData.length === 0 ? (
              <div className="px-6 py-12 text-center text-text-muted text-sm">No students in this branch yet.</div>
            ) : (
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <table className="w-full text-sm mb-4">
                    <thead>
                      <tr className="border-b border-surface-border text-left text-xs text-text-muted uppercase">
                        <th className="py-2">Gender</th>
                        <th className="py-2 text-right">Count</th>
                        <th className="py-2 text-right">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-50">
                        <td className="py-3 font-medium text-text-primary">Male</td>
                        <td className="py-3 text-right font-mono">{genderStats.male}</td>
                        <td className="py-3 text-right text-text-secondary">{genderStats.malePct.toFixed(1)}%</td>
                      </tr>
                      <tr className="border-b border-gray-50">
                        <td className="py-3 font-medium text-text-primary">Female</td>
                        <td className="py-3 text-right font-mono">{genderStats.female}</td>
                        <td className="py-3 text-right text-text-secondary">{genderStats.femalePct.toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-text-primary">Other / unspecified</td>
                        <td className="py-3 text-right font-mono">{genderStats.other}</td>
                        <td className="py-3 text-right text-text-secondary">{genderStats.otherPct.toFixed(1)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="h-56">
                    {genderPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={genderPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                            {genderPieData.map((_, index) => (
                              <Cell key={`g-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#0f172a' }}
                          />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-text-muted text-xs">No gender breakdown</div>
                    )}
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={genderBarData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
