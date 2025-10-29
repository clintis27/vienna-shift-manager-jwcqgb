
import { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

export interface AnalyticsData {
  totalEmployees: number;
  activeEmployees: number;
  totalLeaveRequests: number;
  pendingLeaveRequests: number;
  approvedLeaveRequests: number;
  rejectedLeaveRequests: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalDocuments: number;
  pendingDocuments: number;
  totalCertificates: number;
  pendingCertificates: number;
  leavesByType: { type: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  employeesByDepartment: { department: string; count: number }[];
  recentActivity: any[];
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        employeesResult,
        leaveRequestsResult,
        tasksResult,
        documentsResult,
        certificatesResult,
      ] = await Promise.all([
        supabase.from('employees').select('*'),
        supabase.from('leave_requests').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('documents').select('*'),
        supabase.from('sick_leave_certificates').select('*'),
      ]);

      const employees = employeesResult.data || [];
      const leaveRequests = leaveRequestsResult.data || [];
      const tasks = tasksResult.data || [];
      const documents = documentsResult.data || [];
      const certificates = certificatesResult.data || [];

      // Calculate leave by type
      const leavesByType = leaveRequests.reduce((acc: any[], req: any) => {
        const existing = acc.find((item) => item.type === req.leave_type);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ type: req.leave_type, count: 1 });
        }
        return acc;
      }, []);

      // Calculate tasks by priority
      const tasksByPriority = tasks.reduce((acc: any[], task: any) => {
        const existing = acc.find((item) => item.priority === task.priority);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ priority: task.priority, count: 1 });
        }
        return acc;
      }, []);

      // Calculate employees by department
      const employeesByDepartment = employees.reduce((acc: any[], emp: any) => {
        if (!emp.department) return acc;
        const existing = acc.find((item) => item.department === emp.department);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ department: emp.department, count: 1 });
        }
        return acc;
      }, []);

      // Get recent activity (last 10 items)
      const recentActivity = [
        ...leaveRequests.slice(0, 5).map((req: any) => ({
          type: 'leave_request',
          data: req,
          timestamp: req.created_at,
        })),
        ...tasks.slice(0, 5).map((task: any) => ({
          type: 'task',
          data: task,
          timestamp: task.created_at,
        })),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      setAnalytics({
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e: any) => e.role !== 'admin').length,
        totalLeaveRequests: leaveRequests.length,
        pendingLeaveRequests: leaveRequests.filter((r: any) => r.status === 'pending').length,
        approvedLeaveRequests: leaveRequests.filter((r: any) => r.status === 'approved').length,
        rejectedLeaveRequests: leaveRequests.filter((r: any) => r.status === 'rejected').length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t: any) => t.status === 'completed').length,
        pendingTasks: tasks.filter((t: any) => t.status === 'pending').length,
        totalDocuments: documents.length,
        pendingDocuments: documents.filter((d: any) => d.status === 'pending').length,
        totalCertificates: certificates.length,
        pendingCertificates: certificates.filter((c: any) => c.status === 'pending').length,
        leavesByType,
        tasksByPriority,
        employeesByDepartment,
        recentActivity,
      });
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    refresh: loadAnalytics,
  };
}
