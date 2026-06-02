import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  change?: number;
  icon: ReactNode;
  color: string;
  delay?: number;
}

export default function StatCard({ label, value, change, icon, color, delay = 0 }: StatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(124,58,237,0.08)' }}
      className="bg-white rounded-2xl p-6 shadow-card border border-surface-border cursor-pointer transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary mb-1">{label}</p>
          <p className="text-3xl font-bold text-text-primary">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{isPositive ? '+' : ''}{change}%</span>
              <span className="text-text-muted font-normal ml-1">vs last year</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
