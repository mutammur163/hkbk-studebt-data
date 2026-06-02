import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileDown, FileSpreadsheet, FileText, Filter, BarChart3, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { studentService } from '../api/studentService';
import { fetchGroqInsights, type ReportAnalyticsPayload } from '../api/groqInsights';
import { exportStudentsToCSV } from '../utils/csvHandler';
import { downloadReportPdf } from '../utils/reportPdf';
import type { Branch, Quota, Category, Student } from '../types';
import { normalizeGender } from '../utils/gender';

const branches: Branch[] = ['CSE', 'ECE', 'ME', 'CE', 'EEE', 'ISE', 'AIML', 'CV'];
const quotas: Quota[] = ['KCET', 'MANAGEMENT', 'KRLMPCA', 'DIPLOMA', 'SNQ'];
const categories: Category[] = ['GM', 'SNQ', 'SC', 'ST', 'OBC-A', 'OBC-B'];

const CHART_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b', '#ec4899', '#06b6d4'];

type Filters = { branch: string; category: string; quota: string; gender: string };

function countBy<T extends Student>(rows: T[], key: keyof Student, top = 8) {
  const m: Record<string, number> = {};
  rows.forEach((r) => {
    const v = String(r[key] ?? 'Unknown').trim() || 'Unknown';
    m[v] = (m[v] || 0) + 1;
  });
  return Object.entries(m)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);
}

function buildAnalytics(rows: Student[], filters: Filters): ReportAnalyticsPayload {
  const total = rows.length;
  let male = 0;
  let female = 0;
  let other = 0;
  rows.forEach((s) => {
    const g = normalizeGender(s.gender);
    if (g === 'Male') male += 1;
    else if (g === 'Female') female += 1;
    else other += 1;
  });
  const pct = (n: number) => (total ? (n / total) * 100 : 0);
  return {
    total,
    filters: {
      branch: filters.branch,
      quota: filters.quota,
      category: filters.category,
      gender: filters.gender,
    },
    gender: {
      male,
      female,
      other,
      malePct: pct(male),
      femalePct: pct(female),
    },
    topBranches: countBy(rows, 'branch'),
    topCategories: countBy(rows, 'category'),
    topQuotas: countBy(rows, 'quota'),
  };
}

export default function Reports() {
  const [filters, setFilters] = useState<Filters>({ branch: '', category: '', quota: '', gender: '' });
  const [loading, setLoading] = useState(false);
  const [reportRows, setReportRows] = useState<Student[] | null>(null);
  const [summary, setSummary] = useState<ReportAnalyticsPayload | null>(null);
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const queryFilters = useMemo(
    () => ({
      branch: filters.branch || undefined,
      quota: filters.quota || undefined,
      category: filters.category || undefined,
      gender: filters.gender || undefined,
    }),
    [filters]
  );

  const categoryChart = useMemo(() => (summary ? summary.topCategories.map((c) => ({ name: c.name, count: c.count })) : []), [summary]);
  const quotaPie = useMemo(() => (summary ? summary.topQuotas.map((q) => ({ name: q.name, value: q.count })) : []), [summary]);

  const runFetch = useCallback(async () => {
    const data = await studentService.getStudents({
      branch: queryFilters.branch,
      quota: queryFilters.quota,
      category: queryFilters.category,
      gender: queryFilters.gender,
    });
    return data || [];
  }, [queryFilters.branch, queryFilters.quota, queryFilters.category, queryFilters.gender]);

  const handleGenerate = async () => {
    setLoading(true);
    setAiError(null);
    try {
      const rows = await runFetch();
      setReportRows(rows);
      setSummary(buildAnalytics(rows, filters));
      setAiText(null);
      if (!rows.length) toast.error('No students match the selected filters.');
      else toast.success(`Report ready — ${rows.length} student(s).`);
    } catch {
      toast.error('Failed to build report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!reportRows?.length) {
      toast.error('Generate a report first');
      return;
    }
    try {
      exportStudentsToCSV(reportRows, 'filtered_report.csv');
      toast.success('CSV downloaded');
    } catch {
      toast.error('CSV export failed');
    }
  };

  const handleDownloadPDF = async () => {
    if (!summary || !reportRows?.length) {
      toast.error('Generate a report first');
      return;
    }
    try {
      await downloadReportPdf(
        summary,
        reportRows.map((r) => ({
          sl_no: r.sl_no,
          usn: r.usn,
          name: r.name,
          branch: r.branch,
          quota: r.quota,
          category: r.category,
          gender: r.gender,
        }))
      );
      toast.success('PDF downloaded');
    } catch {
      toast.error('PDF generation failed');
    }
  };

  const handleAiInsights = async () => {
    if (!summary || summary.total === 0) {
      toast.error('Generate a report with data first');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const text = await fetchGroqInsights(summary);
      setAiText(text);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'AI request failed';
      setAiError(msg);
      toast.error(msg);
    } finally {
      setAiLoading(false);
    }
  };

  const selectClass =
    'w-full px-3 py-2.5 border border-surface-border rounded-xl text-sm bg-white text-text-primary';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
        <p className="text-sm text-text-secondary mt-0.5">Generate and download admission reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-card border border-surface-border h-fit"
        >
          <div className="flex items-center gap-2 mb-5">
            <Filter size={18} className="text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Report Filters</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Branch</label>
              <select
                value={filters.branch}
                onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                className={selectClass}
              >
                <option value="">All Branches</option>
                {branches.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Quota</label>
              <select
                value={filters.quota}
                onChange={(e) => setFilters({ ...filters, quota: e.target.value })}
                className={selectClass}
              >
                <option value="">All Quotas</option>
                {quotas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className={selectClass}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                className={selectClass}
              >
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / unspecified</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: <BarChart3 size={24} />,
                title: 'Generate Report',
                desc: 'Load filtered data from Supabase',
                color: 'from-primary to-primary-hover',
                onClick: handleGenerate,
              },
              {
                icon: <FileText size={24} />,
                title: 'Download PDF',
                desc: 'Summary, charts & sample rows',
                color: 'from-accent-blue to-blue-600',
                onClick: handleDownloadPDF,
              },
              {
                icon: <FileSpreadsheet size={24} />,
                title: 'Export CSV',
                desc: 'Filtered rows only',
                color: 'from-accent-green to-emerald-600',
                onClick: handleExportCSV,
              },
            ].map((action, idx) => (
              <motion.button
                key={action.title}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.onClick}
                disabled={loading}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-card border border-surface-border text-left hover:shadow-card-hover transition-shadow disabled:opacity-50"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 text-white`}
                >
                  {loading && action.title === 'Generate Report' ? <Loader2 className="animate-spin" size={24} /> : action.icon}
                </div>
                <h3 className="font-semibold text-text-primary mb-1">{action.title}</h3>
                <p className="text-xs text-text-muted">{action.desc}</p>
              </motion.button>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card border border-surface-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <FileDown size={22} className="text-text-muted" />
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Report summary</h3>
                  <p className="text-xs text-text-muted">
                    {summary ? `${summary.total} student(s)` : 'Run “Generate Report” to load live data.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAiInsights}
                disabled={aiLoading || !summary?.total}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-surface-bg border border-surface-border text-text-primary hover:bg-gray-50 disabled:opacity-50"
              >
                {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-primary" />}
                Generate AI Insights
              </button>
            </div>

            {summary && summary.total > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="rounded-xl bg-surface-bg px-3 py-2 border border-surface-border">
                    <p className="text-xs text-text-muted">Male</p>
                    <p className="font-semibold text-text-primary">{summary.gender.male}</p>
                    <p className="text-xs text-text-secondary">{summary.gender.malePct.toFixed(1)}%</p>
                  </div>
                  <div className="rounded-xl bg-surface-bg px-3 py-2 border border-surface-border">
                    <p className="text-xs text-text-muted">Female</p>
                    <p className="font-semibold text-text-primary">{summary.gender.female}</p>
                    <p className="text-xs text-text-secondary">{summary.gender.femalePct.toFixed(1)}%</p>
                  </div>
                  <div className="rounded-xl bg-surface-bg px-3 py-2 border border-surface-border">
                    <p className="text-xs text-text-muted">Other</p>
                    <p className="font-semibold text-text-primary">{summary.gender.other}</p>
                  </div>
                  <div className="rounded-xl bg-surface-bg px-3 py-2 border border-surface-border">
                    <p className="text-xs text-text-muted">Top branch</p>
                    <p className="font-semibold text-text-primary truncate">{summary.topBranches[0]?.name ?? '—'}</p>
                    <p className="text-xs text-text-secondary">{summary.topBranches[0]?.count ?? 0} students</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-56 border border-surface-border rounded-xl p-2">
                    <p className="text-xs font-medium text-text-secondary px-2 pt-1 mb-1">Category (filtered)</p>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={categoryChart} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {categoryChart.map((_, i) => (
                            <Cell key={`c-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-56 border border-surface-border rounded-xl p-2">
                    <p className="text-xs font-medium text-text-secondary px-2 pt-1 mb-1">Quota (filtered)</p>
                    {quotaPie.length ? (
                      <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                          <Pie data={quotaPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                            {quotaPie.map((_, i) => (
                              <Cell key={`q-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-text-muted text-sm">No quota data</div>
                    )}
                  </div>
                </div>
              </div>
            ) : summary && summary.total === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">No rows for this filter combination.</p>
            ) : (
              <p className="text-sm text-text-secondary text-center py-6">
                Use the filters on the left, then click <span className="font-medium">Generate Report</span> to pull data from Supabase.
              </p>
            )}

            {(aiText || aiError) && (
              <div className="mt-6 border-t border-surface-border pt-5">
                <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" /> AI insights
                </h4>
                {aiError && <p className="text-sm text-red-600 mb-2">{aiError}</p>}
                {aiText && (
                  <div className="max-w-none text-text-secondary whitespace-pre-wrap text-sm leading-relaxed bg-surface-bg rounded-xl p-4 border border-surface-border">
                    {aiText}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
