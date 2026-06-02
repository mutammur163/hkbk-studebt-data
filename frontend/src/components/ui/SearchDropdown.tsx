import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Hash } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import { highlightMatch } from '../../utils/helpers';

interface SearchDropdownProps {
  onSelectStudent: (id: string) => void;
}

export default function SearchDropdown({ onSelectStudent }: SearchDropdownProps) {
  const { query, setQuery, results, isSearching, fetching } = useSearch();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(isSearching && (results.length > 0 || fetching));
    setFocusedIndex(-1);
  }, [results, isSearching, fetching]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      onSelectStudent(results[focusedIndex].id ?? results[focusedIndex].usn);
      setQuery('');
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const renderHighlight = (text: string) => {
    const match = highlightMatch(text, query);
    if (!match) return <span>{text}</span>;
    return (
      <span>
        {match.before}
        <span className="bg-primary-100 text-primary-700 font-semibold rounded px-0.5">{match.match}</span>
        {match.after}
      </span>
    );
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => isSearching && (fetching || results.length > 0) && setIsOpen(true)}
          placeholder="Search by name or USN..."
          className="w-full pl-10 pr-4 py-2.5 bg-surface-bg border border-surface-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:bg-white transition-colors"
          id="global-search-input"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-dropdown border border-surface-border z-50 overflow-hidden max-h-80 overflow-y-auto"
          >
            <div className="px-3 py-2 text-xs font-medium text-text-muted border-b border-surface-border">
              {fetching ? 'Searching…' : `${results.length} result${results.length !== 1 ? 's' : ''} found`}
            </div>
            {fetching && results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-text-muted">Loading matches…</div>
            ) : (
              results.map((student, idx) => (
              <button
                key={student.id ?? student.usn}
                onClick={() => {
                  onSelectStudent(student.id ?? student.usn);
                  setQuery('');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                  idx === focusedIndex ? 'bg-primary-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {renderHighlight(student.name)}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Hash size={10} />
                      {renderHighlight(student.usn)}
                    </span>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-surface-bg text-text-secondary font-medium">
                  {student.branch}
                </span>
              </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isSearching && !fetching && results.length === 0 && !isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-dropdown border border-surface-border z-50 p-6 text-center"
        >
          <Search size={24} className="mx-auto text-text-muted mb-2" />
          <p className="text-sm text-text-secondary">No students found for "{query}"</p>
        </motion.div>
      )}
    </div>
  );
}
