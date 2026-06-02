import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Student } from '../../types';

interface Props {
  data: Student[];
}

export default function BranchDistributionChart({ data }: Props) {
  // Aggregate data
  const branchCounts: Record<string, number> = {};
  data.forEach(s => {
    if (s.branch) {
      branchCounts[s.branch] = (branchCounts[s.branch] || 0) + 1;
    }
  });

  const chartData = Object.entries(branchCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#818cf8', '#6366f1', '#4f46e5'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white p-6 rounded-2xl shadow-card border border-surface-border"
    >
      <h3 className="text-lg font-semibold text-text-primary mb-6">Branch Distribution</h3>
      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">No data available</div>
        )}
      </div>
    </motion.div>
  );
}
