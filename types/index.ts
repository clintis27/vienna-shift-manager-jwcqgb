

export type EmployeeCategory = 'breakfast' | 'housekeeping' | 'frontdesk';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'employee';
  category?: EmployeeCategory; // Category for employees and category-specific admins
  department?: string;
  phoneNumber?: string;
  avatar?: string;
  createdAt: string;
  notificationPreferences?: NotificationPreferences;
}

export interface NotificationPreferences {
  shiftChanges: boolean;
  reminders: boolean;
  approvals: boolean;
  pushEnabled: boolean;
}

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  department: string;
  category: EmployeeCategory; // Added category to shifts
  startTime: string;
  endTime: string;
  date: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'requested' | 'approved' | 'rejected';
  position: string;
  notes?: string;
  color?: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  shiftId: string;
  clockIn: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  totalHours?: number;
  overtimeHours?: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  type: 'vacation' | 'sick' | 'personal' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  color: string;
  managerIds: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'shift_change' | 'reminder' | 'approval' | 'info' | 'warning';
  read: boolean;
  createdAt: string;
  data?: any;
}

export interface ShiftRequest {
  id: string;
  userId: string;
  userName: string;
  category: EmployeeCategory;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  notes?: string;
}

export interface AvailabilityDay {
  userId: string;
  date: string;
  available: boolean;
  notes?: string;
}

export interface MonthlyReport {
  id: string;
  userId: string;
  userName: string;
  month: string; // Format: YYYY-MM
  year: number;
  totalHours: number;
  shiftsCompleted: number;
  dayShifts: number;
  nightShifts: number;
  weekendShifts: number;
  absences: number;
  approvedLeaves: number;
  overtimeHours: number;
  departments: string[];
  generatedAt: string;
}

export interface SickLeaveCertificate {
  id: string;
  employeeId: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  startDate: string;
  endDate: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Employee {
  id: string;
  userId?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'employee';
  category?: EmployeeCategory;
  department?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
