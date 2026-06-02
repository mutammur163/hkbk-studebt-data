import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, BookOpen, Award, TrendingUp, CheckCircle, AlertCircle, Info } from 'lucide-react';
import OrbBackground from '../components/ui/OrbBackground';
import StatCard from '../components/ui/StatCard';
import BranchDistributionChart from '../components/charts/BranchDistributionChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import { insights } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';
import { studentService } from '../api/studentService';
import type { Student } from '../types';
import { normalizeGender } from '../utils/gender';

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ').slice(0, 2).join(' ') || 'User';
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await studentService.getStudents();
        setStudents(data || []);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalStudents = students.length;
  const maleCount = students.filter((s) => normalizeGender(s.gender) === 'Male').length;
  const femaleCount = students.filter((s) => normalizeGender(s.gender) === 'Female').length;
  
  const kcetCount = students.filter(s => s.quota === 'KCET').length;
  const mgmtCount = students.filter(s => s.quota === 'MANAGEMENT').length;
  const snqCount = students.filter(s => s.quota === 'SNQ').length;

  const insightIcons: Record<string, React.ReactNode> = {
    'trending-up': <TrendingUp size={16} />,
    'award': <Award size={16} />,
    'users': <Users size={16} />,
    'alert-circle': <AlertCircle size={16} />,
    'check-circle': <CheckCircle size={16} />,
  };

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary-50 via-white to-blue-50 border border-surface-border p-8">
        <OrbBackground />
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-text-primary"
          >
            Welcome back, {firstName} 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary mt-1"
          >
            Here's an overview of HKBKCE admissions
          </motion.p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Students"
          value={loading ? '...' : totalStudents}
          icon={<Users size={22} className="text-white" />}
          color="bg-gradient-to-br from-primary to-primary-hover"
          delay={0}
        />
        <StatCard
          label="Male Students"
          value={loading ? '...' : maleCount}
          icon={<Users size={22} className="text-white" />}
          color="bg-gradient-to-br from-accent-blue to-blue-600"
          delay={0.1}
        />
        <StatCard
          label="Female Students"
          value={loading ? '...' : femaleCount}
          icon={<Users size={22} className="text-white" />}
          color="bg-gradient-to-br from-pink-400 to-pink-600"
          delay={0.2}
        />
        <StatCard
          label="Management Quota"
          value={loading ? '...' : mgmtCount}
          icon={<BookOpen size={22} className="text-white" />}
          color="bg-gradient-to-br from-accent-orange to-amber-600"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BranchDistributionChart data={students} />
        <CategoryPieChart data={students} />
      </div>

      {/* Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-card border border-surface-border"
      >
        <div className="flex items-center gap-2 mb-4">
          <Info size={18} className="text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Intelligent Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((insight, idx) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className={`flex items-start gap-3 p-4 rounded-xl border transition-colors hover:shadow-sm ${
                insight.type === 'success' ? 'border-green-200 bg-green-50/50' :
                insight.type === 'warning' ? 'border-amber-200 bg-amber-50/50' :
                'border-primary-200 bg-primary-50/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                insight.type === 'success' ? 'bg-green-100 text-green-600' :
                insight.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                'bg-primary-100 text-primary'
              }`}>
                {insightIcons[insight.icon] || <Info size={16} />}
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{insight.message}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
