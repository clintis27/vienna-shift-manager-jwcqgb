
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/app/integrations/supabase/client';
import {
  exportLeaveRequests,
  exportTasks,
  exportEmployees,
  exportDocuments,
  exportCertificates,
  generateMonthlyReport,
  shareCSV,
  exportToCSV,
} from '@/utils/exportHelpers';

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const { analytics, loading, error, refresh } = useAnalytics();
  const [exporting, setExporting] = useState(false);

  const handleExportLeaveRequests = async () => {
    try {
      setExporting(true);
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          employee:employees(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData = (data || []).map((req) => ({
        id: req.id,
        userId: req.employee_id,
        userName: `${req.employee.first_name} ${req.employee.last_name}`,
        startDate: req.start_date,
        endDate: req.end_date,
        type: req.leave_type,
        status: req.status,
        reason: req.reason,
        createdAt: req.created_at,
      }));

      await exportLeaveRequests(mappedData);
    } catch (err: any) {
      console.error('Error exporting leave requests:', err);
      Alert.alert('Error', 'Failed to export leave requests');
    } finally {
      setExporting(false);
    }
  };

  const handleExportTasks = async () => {
    try {
      setExporting(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData = (data || []).map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        assignedTo: task.assigned_to,
        assignedBy: task.assigned_by,
        category: task.category,
        priority: task.priority,
        status: task.status,
        dueDate: task.due_date,
        completedAt: task.completed_at,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      }));

      await exportTasks(mappedData);
    } catch (err: any) {
      console.error('Error exporting tasks:', err);
      Alert.alert('Error', 'Failed to export tasks');
    } finally {
      setExporting(false);
    }
  };

  const handleExportEmployees = async () => {
    try {
      setExporting(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) throw error;

      const mappedData = (data || []).map((emp) => ({
        id: emp.id,
        userId: emp.user_id,
        email: emp.email,
        firstName: emp.first_name,
        lastName: emp.last_name,
        role: emp.role,
        category: emp.category,
        department: emp.department,
        phoneNumber: emp.phone_number,
        avatarUrl: emp.avatar_url,
        createdAt: emp.created_at,
        updatedAt: emp.updated_at,
      }));

      await exportEmployees(mappedData);
    } catch (err: any) {
      console.error('Error exporting employees:', err);
      Alert.alert('Error', 'Failed to export employees');
    } finally {
      setExporting(false);
    }
  };

  const handleExportMonthlyReport = async () => {
    try {
      setExporting(true);

      const [leaveResult, taskResult, empResult] = await Promise.all([
        supabase.from('leave_requests').select(`
          *,
          employee:employees(first_name, last_name)
        `),
        supabase.from('tasks').select('*'),
        supabase.from('employees').select('*'),
      ]);

      const leaveRequests = (leaveResult.data || []).map((req) => ({
        id: req.id,
        userId: req.employee_id,
        userName: `${req.employee.first_name} ${req.employee.last_name}`,
        startDate: req.start_date,
        endDate: req.end_date,
        type: req.leave_type,
        status: req.status,
        reason: req.reason,
        createdAt: req.created_at,
      }));

      const tasks = (taskResult.data || []).map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        assignedTo: task.assigned_to,
        assignedBy: task.assigned_by,
        category: task.category,
        priority: task.priority,
        status: task.status,
        dueDate: task.due_date,
        completedAt: task.completed_at,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      }));

      const employees = (empResult.data || []).map((emp) => ({
        id: emp.id,
        userId: emp.user_id,
        email: emp.email,
        firstName: emp.first_name,
        lastName: emp.last_name,
        role: emp.role,
        category: emp.category,
        department: emp.department,
        phoneNumber: emp.phone_number,
        avatarUrl: emp.avatar_url,
        createdAt: emp.created_at,
        updatedAt: emp.updated_at,
      }));

      const report = generateMonthlyReport(leaveRequests, tasks, employees);

      const reportData = [
        { Metric: 'Month', Value: report.month },
        { Metric: 'Year', Value: report.year },
        { Metric: 'Total Employees', Value: report.totalEmployees },
        { Metric: 'Total Leave Requests', Value: report.totalLeaveRequests },
        { Metric: 'Approved Leaves', Value: report.approvedLeaves },
        { Metric: 'Rejected Leaves', Value: report.rejectedLeaves },
        { Metric: 'Pending Leaves', Value: report.pendingLeaves },
        { Metric: 'Total Tasks', Value: report.totalTasks },
        { Metric: 'Completed Tasks', Value: report.completedTasks },
        { Metric: 'Pending Tasks', Value: report.pendingTasks },
      ];

      const csv = exportToCSV(reportData, 'monthly_report.csv');
      if (csv) {
        await shareCSV(csv, 'monthly_report.csv');
      }
    } catch (err: any) {
      console.error('Error exporting monthly report:', err);
      Alert.alert('Error', 'Failed to export monthly report');
    } finally {
      setExporting(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#FF6B6B" />
          <Text style={[styles.errorText, { color: theme.text }]}>Access Denied</Text>
          <Text style={[styles.errorSubtext, { color: theme.textSecondary }]}>
            Only admins can view analytics
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#FF6B6B" />
          <Text style={[styles.errorText, { color: theme.text }]}>Error Loading Analytics</Text>
          <Text style={[styles.errorSubtext, { color: theme.textSecondary }]}>{error}</Text>
          <TouchableOpacity style={[buttonStyles.primary, { marginTop: 16 }]} onPress={refresh}>
            <Text style={buttonStyles.textWhite}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Analytics & Reports</Text>
          <TouchableOpacity onPress={refresh}>
            <IconSymbol name="arrow.clockwise" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <IconSymbol name="person.3.fill" size={32} color={theme.primary} />
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {analytics?.totalEmployees || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Employees</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <IconSymbol name="calendar.badge.clock" size={32} color="#FFA726" />
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {analytics?.pendingLeaveRequests || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending Leaves</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <IconSymbol name="checkmark.circle.fill" size={32} color="#4CAF50" />
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {analytics?.completedTasks || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed Tasks</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <IconSymbol name="doc.badge.plus" size={32} color="#2196F3" />
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {analytics?.pendingDocuments || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending Docs</Text>
            </View>
          </View>
        </View>

        {/* Leave Requests Breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Leave Requests</Text>
          <View style={[styles.breakdownCard, { backgroundColor: theme.card }]}>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Total</Text>
              <Text style={[styles.breakdownValue, { color: theme.text }]}>
                {analytics?.totalLeaveRequests || 0}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Approved</Text>
              <Text style={[styles.breakdownValue, { color: '#4CAF50' }]}>
                {analytics?.approvedLeaveRequests || 0}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Pending</Text>
              <Text style={[styles.breakdownValue, { color: '#FFA726' }]}>
                {analytics?.pendingLeaveRequests || 0}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Rejected</Text>
              <Text style={[styles.breakdownValue, { color: '#FF6B6B' }]}>
                {analytics?.rejectedLeaveRequests || 0}
              </Text>
            </View>
          </View>

          {analytics?.leavesByType && analytics.leavesByType.length > 0 && (
            <View style={[styles.breakdownCard, { backgroundColor: theme.card, marginTop: 12 }]}>
              <Text style={[styles.breakdownTitle, { color: theme.text }]}>By Type</Text>
              {analytics.leavesByType.map((item, index) => (
                <View key={index} style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Text>
                  <Text style={[styles.breakdownValue, { color: theme.text }]}>
                    {item.count}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Tasks Breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tasks</Text>
          <View style={[styles.breakdownCard, { backgroundColor: theme.card }]}>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Total</Text>
              <Text style={[styles.breakdownValue, { color: theme.text }]}>
                {analytics?.totalTasks || 0}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Completed</Text>
              <Text style={[styles.breakdownValue, { color: '#4CAF50' }]}>
                {analytics?.completedTasks || 0}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Pending</Text>
              <Text style={[styles.breakdownValue, { color: '#FFA726' }]}>
                {analytics?.pendingTasks || 0}
              </Text>
            </View>
          </View>

          {analytics?.tasksByPriority && analytics.tasksByPriority.length > 0 && (
            <View style={[styles.breakdownCard, { backgroundColor: theme.card, marginTop: 12 }]}>
              <Text style={[styles.breakdownTitle, { color: theme.text }]}>By Priority</Text>
              {analytics.tasksByPriority.map((item, index) => (
                <View key={index} style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>
                    {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                  </Text>
                  <Text style={[styles.breakdownValue, { color: theme.text }]}>
                    {item.count}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Export Data</Text>
          
          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: theme.card }]}
            onPress={handleExportLeaveRequests}
            disabled={exporting}
          >
            <IconSymbol name="calendar" size={24} color={theme.primary} />
            <View style={styles.exportButtonContent}>
              <Text style={[styles.exportButtonTitle, { color: theme.text }]}>
                Leave Requests
              </Text>
              <Text style={[styles.exportButtonSubtitle, { color: theme.textSecondary }]}>
                Export all leave requests to CSV
              </Text>
            </View>
            <IconSymbol name="square.and.arrow.up" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: theme.card }]}
            onPress={handleExportTasks}
            disabled={exporting}
          >
            <IconSymbol name="checklist" size={24} color={theme.primary} />
            <View style={styles.exportButtonContent}>
              <Text style={[styles.exportButtonTitle, { color: theme.text }]}>Tasks</Text>
              <Text style={[styles.exportButtonSubtitle, { color: theme.textSecondary }]}>
                Export all tasks to CSV
              </Text>
            </View>
            <IconSymbol name="square.and.arrow.up" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: theme.card }]}
            onPress={handleExportEmployees}
            disabled={exporting}
          >
            <IconSymbol name="person.3.fill" size={24} color={theme.primary} />
            <View style={styles.exportButtonContent}>
              <Text style={[styles.exportButtonTitle, { color: theme.text }]}>Employees</Text>
              <Text style={[styles.exportButtonSubtitle, { color: theme.textSecondary }]}>
                Export employee list to CSV
              </Text>
            </View>
            <IconSymbol name="square.and.arrow.up" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: theme.card }]}
            onPress={handleExportMonthlyReport}
            disabled={exporting}
          >
            <IconSymbol name="chart.bar.fill" size={24} color={theme.primary} />
            <View style={styles.exportButtonContent}>
              <Text style={[styles.exportButtonTitle, { color: theme.text }]}>
                Monthly Report
              </Text>
              <Text style={[styles.exportButtonSubtitle, { color: theme.textSecondary }]}>
                Export comprehensive monthly report
              </Text>
            </View>
            <IconSymbol name="square.and.arrow.up" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  breakdownCard: {
    padding: 16,
    borderRadius: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 16,
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  exportButtonContent: {
    flex: 1,
  },
  exportButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exportButtonSubtitle: {
    fontSize: 14,
  },
});
