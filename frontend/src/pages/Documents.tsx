import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Eye, Calendar, HardDrive, Filter, UploadCloud } from 'lucide-react';
import { documents } from '../data/mockData';
import DocumentViewer from '../components/documents/DocumentViewer';

export default function Documents() {
  const [typeFilter, setTypeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [viewDoc, setViewDoc] = useState<typeof documents[0] | null>(null);

  const filtered = documents.filter(d => {
    if (typeFilter && d.type !== typeFilter) return false;
    if (yearFilter && d.year !== parseInt(yearFilter)) return false;
    return true;
  });

  const typeColors: Record<string, string> = {
    'Seat Allotment': 'bg-primary-50 text-primary border-primary-200',
    'Fee Structure': 'bg-blue-50 text-accent-blue border-blue-200',
    'Cutoff': 'bg-green-50 text-accent-green border-green-200',
  };

  const typeIcons: Record<string, string> = {
    'Seat Allotment': '📋',
    'Fee Structure': '💰',
    'Cutoff': '📊',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Document Center</h1>
        <p className="text-sm text-text-secondary mt-0.5">Access official documents and records</p>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={16} className="text-text-muted" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-surface-border rounded-xl text-sm bg-white"
          >
            <option value="">All Types</option>
            <option value="Seat Allotment">Seat Allotment</option>
            <option value="Fee Structure">Fee Structure</option>
            <option value="Cutoff">Cutoff</option>
          </select>
          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="px-3 py-2 border border-surface-border rounded-xl text-sm bg-white"
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
          <span className="text-xs text-text-muted">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        
        <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-primary-hover transition-colors shadow-sm">
          <UploadCloud size={16} />
          Upload Document
          <input type="file" className="hidden" onChange={(e) => alert('Document uploaded temporarily!')} />
        </label>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((doc, idx) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-5 shadow-card border border-surface-border group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{typeIcons[doc.type]}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium border ${typeColors[doc.type]}`}>{doc.type}</span>
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 leading-snug">{doc.title}</h3>
            <div className="space-y-1.5 text-xs text-text-muted mb-4">
              <div className="flex items-center gap-1.5"><Calendar size={12} />{doc.uploadedAt}</div>
              <div className="flex items-center gap-1.5"><HardDrive size={12} />{doc.size}</div>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-surface-border">
              <button
                onClick={() => setViewDoc(doc)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-50 text-primary rounded-xl text-xs font-medium hover:bg-primary-100 transition-colors"
              >
                <Eye size={14} /> View
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-bg text-text-secondary rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors">
                <Download size={14} /> Download
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {viewDoc && <DocumentViewer title={viewDoc.title} fileUrl={viewDoc.fileUrl} onClose={() => setViewDoc(null)} />}
      </AnimatePresence>
    </div>
  );
}
