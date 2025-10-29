
import { Alert, Share } from 'react-native';
import { LeaveRequest, Task, Employee, Document, SickLeaveCertificate } from '@/types';
import { formatDate } from './dateHelpers';

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    Alert.alert('Error', 'No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');

  return csvContent;
};

export const shareCSV = async (csvContent: string, filename: string) => {
  try {
    await Share.share({
      message: csvContent,
      title: filename,
    });
  } catch (error) {
    console.error('Error sharing CSV:', error);
    Alert.alert('Error', 'Failed to share CSV file');
  }
};

export const exportLeaveRequests = async (requests: LeaveRequest[]) => {
  const data = requests.map((req) => ({
    Employee: req.userName,
    'Start Date': formatDate(req.startDate),
    'End Date': formatDate(req.endDate),
    Type: req.type,
    Status: req.status,
    Reason: req.reason || '',
    'Created At': formatDate(req.createdAt),
  }));

  const csv = exportToCSV(data, 'leave_requests.csv');
  if (csv) {
    await shareCSV(csv, 'leave_requests.csv');
  }
};

export const exportTasks = async (tasks: Task[]) => {
  const data = tasks.map((task) => ({
    Title: task.title,
    Description: task.description || '',
    Priority: task.priority,
    Status: task.status,
    'Due Date': task.dueDate ? formatDate(task.dueDate) : '',
    'Created At': formatDate(task.createdAt),
  }));

  const csv = exportToCSV(data, 'tasks.csv');
  if (csv) {
    await shareCSV(csv, 'tasks.csv');
  }
};

export const exportEmployees = async (employees: Employee[]) => {
  const data = employees.map((emp) => ({
    'First Name': emp.firstName,
    'Last Name': emp.lastName,
    Email: emp.email,
    Role: emp.role,
    Department: emp.department || '',
    Category: emp.category || '',
    'Phone Number': emp.phoneNumber || '',
    'Created At': formatDate(emp.createdAt),
  }));

  const csv = exportToCSV(data, 'employees.csv');
  if (csv) {
    await shareCSV(csv, 'employees.csv');
  }
};

export const exportDocuments = async (documents: Document[]) => {
  const data = documents.map((doc) => ({
    'File Name': doc.fileName,
    Type: doc.documentType,
    Status: doc.status,
    Description: doc.description || '',
    'Uploaded At': formatDate(doc.uploadedAt),
  }));

  const csv = exportToCSV(data, 'documents.csv');
  if (csv) {
    await shareCSV(csv, 'documents.csv');
  }
};

export const exportCertificates = async (certificates: SickLeaveCertificate[]) => {
  const data = certificates.map((cert) => ({
    'File Name': cert.fileName,
    'Start Date': formatDate(cert.startDate),
    'End Date': formatDate(cert.endDate),
    Status: cert.status,
    Notes: cert.notes || '',
    'Uploaded At': formatDate(cert.uploadedAt),
  }));

  const csv = exportToCSV(data, 'sick_leave_certificates.csv');
  if (csv) {
    await shareCSV(csv, 'sick_leave_certificates.csv');
  }
};

export const generateMonthlyReport = (
  leaveRequests: LeaveRequest[],
  tasks: Task[],
  employees: Employee[]
) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyLeaves = leaveRequests.filter((req) => {
    const date = new Date(req.createdAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const monthlyTasks = tasks.filter((task) => {
    const date = new Date(task.createdAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const report = {
    month: now.toLocaleString('default', { month: 'long' }),
    year: currentYear,
    totalEmployees: employees.length,
    totalLeaveRequests: monthlyLeaves.length,
    approvedLeaves: monthlyLeaves.filter((r) => r.status === 'approved').length,
    rejectedLeaves: monthlyLeaves.filter((r) => r.status === 'rejected').length,
    pendingLeaves: monthlyLeaves.filter((r) => r.status === 'pending').length,
    totalTasks: monthlyTasks.length,
    completedTasks: monthlyTasks.filter((t) => t.status === 'completed').length,
    pendingTasks: monthlyTasks.filter((t) => t.status === 'pending').length,
  };

  return report;
};
