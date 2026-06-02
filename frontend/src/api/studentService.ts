import { supabase } from '../lib/supabase';
import type { Student } from '../types';
import { normalizeGender } from '../utils/gender';

export type StudentQueryFilters = {
  branch?: string;
  quota?: string;
  category?: string;
  gender?: string;
  search?: string;
};

export const studentService = {
  getStudents: async (filters: StudentQueryFilters = {}) => {
    let allData: Student[] = [];
    let hasMore = true;
    let start = 0;
    const step = 1000;

    while (hasMore) {
      let query = supabase.from('students').select('*').range(start, start + step - 1);

      if (filters.branch && filters.branch !== 'All') {
        query = query.eq('branch', filters.branch);
      }
      if (filters.quota && filters.quota !== 'All') {
        query = query.eq('quota', filters.quota);
      }
      if (filters.category && filters.category !== 'All') {
        query = query.eq('category', filters.category);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,usn.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        allData = [...allData, ...(data as Student[])];
        start += step;
        if (data.length < step) hasMore = false;
      } else {
        hasMore = false;
      }
    }

    if (filters.gender && filters.gender !== 'All') {
      const g = filters.gender as 'Male' | 'Female' | 'Other';
      allData = allData.filter((s) => normalizeGender(s.gender) === g);
    }

    return allData;
  },

  getStudentByUsn: async (usn: string) => {
    const { data, error } = await supabase.from('students').select('*').eq('usn', usn).maybeSingle();

    if (error) throw error;
    return data;
  },

  /** @deprecated use getStudentByUsn */
  getStudentById: async (id: string) => {
    const { data, error } = await supabase.from('students').select('*').eq('usn', id).maybeSingle();
    if (error) throw error;
    return data;
  },

  updateStudent: async (originalUsn: string, updates: Partial<Student>) => {
    const payload: Record<string, unknown> = {
      sl_no: updates.sl_no,
      usn: updates.usn,
      name: updates.name,
      gender: updates.gender,
      category: updates.category,
      quota: updates.quota,
      branch: updates.branch,
    };
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    const { data, error } = await supabase.from('students').update(payload).eq('usn', originalUsn).select().single();

    if (error) throw error;
    return data;
  },

  createStudent: async (studentData: Record<string, unknown>) => {
    const { data, error } = await supabase.from('students').insert([studentData]).select().single();

    if (error) throw error;
    return data;
  },

  bulkInsertStudents: async (students: Record<string, unknown>[]) => {
    const validStudents = students.filter((s) => s.usn);

    if (validStudents.length === 0) {
      throw new Error("No valid students found! Please ensure your CSV has a column exactly named 'USN' or 'usn'.");
    }

    let response = await supabase.from('students').upsert(validStudents, { onConflict: 'usn' }).select();

    if (response.error && response.error.code === '42P10') {
      console.warn('Missing unique constraint on USN! Falling back to standard insert.');
      response = await supabase.from('students').insert(validStudents).select();
    }

    if (response.error) throw response.error;
    return response.data;
  },
};
