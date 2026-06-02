import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { studentService } from '../api/studentService';
import type { Student } from '../types';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Student[]>([]);
  const [fetching, setFetching] = useState(false);
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setFetching(false);
      return;
    }
    let cancelled = false;
    setFetching(true);
    (async () => {
      try {
        const data = await studentService.getStudents({ search: debouncedQuery.trim() });
        if (!cancelled) setResults((data || []).slice(0, 8));
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return {
    query,
    setQuery,
    results,
    isSearching: query.trim().length > 0,
    fetching,
  };
}
