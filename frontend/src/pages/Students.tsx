import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Download, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Student, Branch, Quota } from '../types';
import { studentService } from '../api/studentService';
import { exportStudentsToCSV, parseCSV } from '../utils/csvHandler';
import { useAuth } from '../hooks/useAuth';
import StudentTable from '../components/students/StudentTable';
import StudentProfile from '../components/students/StudentProfile';
import EditModal from '../components/students/EditModal';

const branches: Branch[] = ['CSE', 'ISE', 'ECE', 'AIML', 'ME', 'CV', 'EEE', 'CE'];
const quotas: Quota[] = ['KCET', 'MANAGEMENT', 'KRLMPCA', 'DIPLOMA', 'SNQ'];

export default function Students() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ branch: 'All', quota: 'All', search: '' });
  const [showFilters, setShowFilters] = useState(true);
  
  const [profileStudent, setProfileStudent] = useState<Student|null>(null);
  const [editStudent, setEditStudent] = useState<Student|null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data: any = await studentService.getStudents(filters);
      setStudentData(data || []);
    } catch (error) {
      toast.error('Failed to load students');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timeout);
  }, [filters]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedData = await parseCSV(file);
      await studentService.bulkInsertStudents(parsedData);
      toast.success('Upload successful!');
      fetchStudents();
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message || JSON.stringify(err)}`);
      console.error("CSV UPLOAD ERROR:", err);
    }
  };

  const clearFilters = () => setFilters({ branch: 'All', quota: 'All', search: '' });
  const hasFilters = filters.branch !== 'All' || filters.quota !== 'All' || filters.search !== '';

  const handleSave = async (updated: Student) => {
    if (!editStudent) return;
    try {
      const saved = await studentService.updateStudent(editStudent.usn, updated);
      setStudentData((prev) =>
        prev.map((s) => (s.usn === editStudent.usn ? ({ ...s, ...saved, ...updated } as Student) : s))
      );
      toast.success('Student updated successfully');
    } catch (error) {
      toast.error('Failed to update student');
      console.error(error);
    }
  };

  const selectClass = "px-3 py-2 border border-surface-border rounded-xl text-sm bg-white text-text-primary focus:ring-2 focus:ring-primary/20 outline-none";

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Students</h1>
          <p className="text-sm text-text-secondary mt-0.5">Manage and view all student records</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => exportStudentsToCSV(studentData)} className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-border rounded-xl text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors">
            <Download size={16} /> Export
          </button>
          
          {isAdmin && (
            <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-primary-hover transition-colors shadow-sm">
              <UploadCloud size={16} /> Upload CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
          )}

          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-border rounded-xl text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl p-4 shadow-card border border-surface-border overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Search & Filter Students</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <X size={12} /> Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input 
                type="text" 
                placeholder="Search by Name or USN..." 
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
                className={selectClass}
              />
              <select value={filters.branch} onChange={e => setFilters({...filters, branch: e.target.value})} className={selectClass}>
                <option disabled value="">Select Branch</option>
                <option value="All">All Branches</option>
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select value={filters.quota} onChange={e => setFilters({...filters, quota: e.target.value})} className={selectClass}>
                <option disabled value="">Select Quota</option>
                <option value="All">All Quotas</option>
                {quotas.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <p className="text-xs text-text-muted mt-3">{studentData.length} student{studentData.length !== 1 ? 's' : ''} match your filters</p>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="p-8 text-center text-text-muted">Loading students...</div>
      ) : (
        <StudentTable students={studentData} onViewProfile={setProfileStudent} onEdit={setEditStudent} />
      )}

      <AnimatePresence>
        {profileStudent && <StudentProfile student={profileStudent} onClose={() => setProfileStudent(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {editStudent && <EditModal student={editStudent} onClose={() => setEditStudent(null)} onSave={handleSave} />}
      </AnimatePresence>
    </div>
  );
}
