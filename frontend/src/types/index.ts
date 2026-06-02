export interface Student {
  id?: string;
  sl_no: string | number;
  usn: string;
  name: string;
  gender: string;
  category: string;
  quota: string;
  branch: string;
}

export type Branch = 'CSE' | 'ECE' | 'ME' | 'CE' | 'EEE' | 'ISE' | 'AIML' | 'CV';
export type Quota = 'KCET' | 'MANAGEMENT' | 'KRLMPCA' | 'DIPLOMA' | 'SNQ';
export type Category = 'GM' | 'SNQ' | 'SC' | 'ST' | 'OBC-A' | 'OBC-B' | string;

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export interface CutoffEntry {
  branch: Branch | string;
  category: Category;
  year: number;
  note?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  type: 'Seat Allotment' | 'Fee Structure' | 'Cutoff';
  year: number;
  fileUrl: string;
  uploadedAt: string;
  size: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  lastLogin: string;
  status: 'Active' | 'Inactive';
}

export type UserRole = 'Admin' | 'Admission Staff' | 'Faculty' | 'Viewer';

export interface InsightItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  icon: string;
}

export interface FilterState {
  branch: Branch | '' | 'All';
  quota: Quota | '' | 'All';
  category: Category | '';
  gender: 'Male' | 'Female' | 'Other' | '';
}

export interface KPIData {
  label: string;
  value: number;
  change: number;
  icon: string;
  color: string;
}
