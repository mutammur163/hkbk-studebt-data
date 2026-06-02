import { motion } from 'framer-motion';
import { X, FileText } from 'lucide-react';

interface DocumentViewerProps {
  title: string;
  fileUrl: string;
  onClose: () => void;
}

export default function DocumentViewer({ title, fileUrl, onClose }: DocumentViewerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-modal w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={20} className="text-text-muted" />
          </button>
        </div>
        <div className="p-4">
          {fileUrl === '#' ? (
            <div className="flex flex-col items-center justify-center py-20 bg-surface-bg rounded-xl">
              <FileText size={48} className="text-text-muted mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-1">Preview Not Available</h3>
              <p className="text-sm text-text-secondary">This document will be available once uploaded to the system.</p>
            </div>
          ) : (
            <iframe src={fileUrl} className="pdf-viewer-frame" title={title} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
