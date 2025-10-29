
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Platform,
  TextInput,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/app/integrations/supabase/client';
import { Employee, LeaveRequest, Task, SickLeaveCertificate, Document } from '@/types';
import { formatDate } from '@/utils/dateHelpers';
import { getCategoryName, getCategoryColor } from '@/utils/mockData';

type TabType = 'overview' | 'leave' | 'documents' | 'employees' | 'tasks';

export default function AdminEnhancedScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [certificates, setCertificates] = useState<SickLeaveCertificate[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Task creation modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadEmployees(),
        loadLeaveRequests(),
        loadCertificates(),
        loadDocuments(),
        loadTasks(),
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) throw error;

      const mappedEmployees: Employee[] = (data || []).map(emp => ({
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

      setEmployees(mappedEmployees);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadLeaveRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          employee:employees(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedRequests: LeaveRequest[] = (data || []).map(req => ({
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

      setLeaveRequests(mappedRequests);
    } catch (error) {
      console.error('Error loading leave requests:', error);
    }
  };

  const loadCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('sick_leave_certificates')
        .select(`
          *,
          employee:employees(first_name, last_name, email)
        `)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      const mappedCerts: SickLeaveCertificate[] = (data || []).map(cert => ({
        id: cert.id,
        employeeId: cert.employee_id,
        fileName: cert.file_name,
        filePath: cert.file_path,
        fileSize: cert.file_size,
        mimeType: cert.mime_type,
        startDate: cert.start_date,
        endDate: cert.end_date,
        notes: cert.notes,
        status: cert.status,
        uploadedAt: cert.uploaded_at,
        reviewedAt: cert.reviewed_at,
        reviewedBy: cert.reviewed_by,
      }));

      setCertificates(mappedCerts);
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          employee:employees(first_name, last_name, email)
        `)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      const mappedDocs: Document[] = (data || []).map(doc => ({
        id: doc.id,
        employeeId: doc.employee_id,
        documentType: doc.document_type,
        fileName: doc.file_name,
        filePath: doc.file_path,
        fileSize: doc.file_size,
        mimeType: doc.mime_type,
        description: doc.description,
        status: doc.status,
        uploadedAt: doc.uploaded_at,
        reviewedAt: doc.reviewed_at,
        reviewedBy: doc.reviewed_by,
      }));

      setDocuments(mappedDocs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_employee:employees!tasks_assigned_to_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedTasks: Task[] = (data || []).map(task => ({
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

      setTasks(mappedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleApproveLeave = async (requestId: string) => {
    try {
      const { data: empData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'approved',
          reviewed_by: empData?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      Alert.alert('Success', 'Leave request approved');
      await loadLeaveRequests();
    } catch (error) {
      console.error('Error approving leave:', error);
      Alert.alert('Error', 'Failed to approve leave request');
    }
  };

  const handleRejectLeave = async (requestId: string) => {
    try {
      const { data: empData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'rejected',
          reviewed_by: empData?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      Alert.alert('Success', 'Leave request rejected');
      await loadLeaveRequests();
    } catch (error) {
      console.error('Error rejecting leave:', error);
      Alert.alert('Error', 'Failed to reject leave request');
    }
  };

  const handleApproveDocument = async (docId: string, type: 'certificate' | 'document') => {
    try {
      const { data: empData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      const table = type === 'certificate' ? 'sick_leave_certificates' : 'documents';

      const { error } = await supabase
        .from(table)
        .update({
          status: 'approved',
          reviewed_by: empData?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', docId);

      if (error) throw error;

      Alert.alert('Success', `${type === 'certificate' ? 'Certificate' : 'Document'} approved`);
      if (type === 'certificate') {
        await loadCertificates();
      } else {
        await loadDocuments();
      }
    } catch (error) {
      console.error('Error approving document:', error);
      Alert.alert('Error', 'Failed to approve document');
    }
  };

  const handleRejectDocument = async (docId: string, type: 'certificate' | 'document') => {
    try {
      const { data: empData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      const table = type === 'certificate' ? 'sick_leave_certificates' : 'documents';

      const { error } = await supabase
        .from(table)
        .update({
          status: 'rejected',
          reviewed_by: empData?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', docId);

      if (error) throw error;

      Alert.alert('Success', `${type === 'certificate' ? 'Certificate' : 'Document'} rejected`);
      if (type === 'certificate') {
        await loadCertificates();
      } else {
        await loadDocuments();
      }
    } catch (error) {
      console.error('Error rejecting document:', error);
      Alert.alert('Error', 'Failed to reject document');
    }
  };

  const handleViewDocument = async (filePath: string, bucket: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        await Linking.openURL(data.signedUrl);
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      Alert.alert('Error', 'Failed to open document');
    }
  };

  const handleCreateTask = async () => {
    if (!selectedEmployee || !taskTitle || !user) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const { data: empData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('tasks')
        .insert({
          title: taskTitle,
          description: taskDescription || null,
          assigned_to: selectedEmployee.id,
          assigned_by: empData?.id,
          category: selectedEmployee.category,
          priority: taskPriority,
          status: 'pending',
          due_date: taskDueDate || null,
        });

      if (error) throw error;

      Alert.alert('Success', 'Task created successfully');
      resetTaskForm();
      await loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const resetTaskForm = () => {
    setShowTaskModal(false);
    setSelectedEmployee(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('medium');
    setTaskDueDate('');
  };

  const pendingLeaveCount = leaveRequests.filter(r => r.status === 'pending').length;
  const pendingCertCount = certificates.filter(c => c.status === 'pending').length;
  const pendingDocCount = documents.filter(d => d.status === 'pending').length;
  const totalPending = pendingLeaveCount + pendingCertCount + pendingDocCount;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#FF6B6B" />
          <Text style={[styles.errorText, { color: theme.text }]}>Access Denied</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Admin Dashboard</Text>
        {totalPending > 0 && (
          <View style={[styles.badge, { backgroundColor: '#FF6B6B' }]}>
            <Text style={styles.badgeText}>{totalPending}</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.card, borderColor: theme.border },
            activeTab === 'overview' && { backgroundColor: theme.primary, borderColor: theme.primary }
          ]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[
            styles.tabText,
            { color: theme.text },
            activeTab === 'overview' && { color: '#FFFFFF', fontWeight: '600' }
          ]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.card, borderColor: theme.border },
            activeTab === 'leave' && { backgroundColor: theme.primary, borderColor: theme.primary }
          ]}
          onPress={() => setActiveTab('leave')}
        >
          <Text style={[
            styles.tabText,
            { color: theme.text },
            activeTab === 'leave' && { color: '#FFFFFF', fontWeight: '600' }
          ]}>
            Leave ({pendingLeaveCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.card, borderColor: theme.border },
            activeTab === 'documents' && { backgroundColor: theme.primary, borderColor: theme.primary }
          ]}
          onPress={() => setActiveTab('documents')}
        >
          <Text style={[
            styles.tabText,
            { color: theme.text },
            activeTab === 'documents' && { color: '#FFFFFF', fontWeight: '600' }
          ]}>
            Documents ({pendingCertCount + pendingDocCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.card, borderColor: theme.border },
            activeTab === 'employees' && { backgroundColor: theme.primary, borderColor: theme.primary }
          ]}
          onPress={() => setActiveTab('employees')}
        >
          <Text style={[
            styles.tabText,
            { color: theme.text },
            activeTab === 'employees' && { color: '#FFFFFF', fontWeight: '600' }
          ]}>
            Employees ({employees.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.card, borderColor: theme.border },
            activeTab === 'tasks' && { backgroundColor: theme.primary, borderColor: theme.primary }
          ]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text style={[
            styles.tabText,
            { color: theme.text },
            activeTab === 'tasks' && { color: '#FFFFFF', fontWeight: '600' }
          ]}>
            Tasks ({tasks.length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <View style={styles.section}>
            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                <IconSymbol name="person.3.fill" size={32} color={theme.primary} />
                <Text style={[styles.statNumber, { color: theme.text }]}>{employees.length}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Employees</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                <IconSymbol name="clock.badge.exclamationmark" size={32} color="#FFA726" />
                <Text style={[styles.statNumber, { color: theme.text }]}>{totalPending}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                <IconSymbol name="checkmark.circle.fill" size={32} color="#4CAF50" />
                <Text style={[styles.statNumber, { color: theme.text }]}>
                  {leaveRequests.filter(r => r.status === 'approved').length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Approved</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                <IconSymbol name="checklist" size={32} color="#2196F3" />
                <Text style={[styles.statNumber, { color: theme.text }]}>{tasks.length}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Tasks</Text>
              </View>
            </View>

            {/* Recent Activity */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
            
            {pendingLeaveCount > 0 && (
              <View style={[styles.activityCard, { backgroundColor: theme.card }]}>
                <IconSymbol name="calendar.badge.clock" size={24} color="#FFA726" />
                <View style={styles.activityContent}>
                  <Text style={[styles.activityTitle, { color: theme.text }]}>
                    {pendingLeaveCount} Pending Leave Request{pendingLeaveCount > 1 ? 's' : ''}
                  </Text>
                  <Text style={[styles.activitySubtitle, { color: theme.textSecondary }]}>
                    Requires your review
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setActiveTab('leave')}>
                  <IconSymbol name="chevron.right" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            {(pendingCertCount + pendingDocCount) > 0 && (
              <View style={[styles.activityCard, { backgroundColor: theme.card }]}>
                <IconSymbol name="doc.badge.plus" size={24} color="#FFA726" />
                <View style={styles.activityContent}>
                  <Text style={[styles.activityTitle, { color: theme.text }]}>
                    {pendingCertCount + pendingDocCount} Pending Document{(pendingCertCount + pendingDocCount) > 1 ? 's' : ''}
                  </Text>
                  <Text style={[styles.activitySubtitle, { color: theme.textSecondary }]}>
                    Requires your review
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setActiveTab('documents')}>
                  <IconSymbol name="chevron.right" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {activeTab === 'leave' && (
          <View style={styles.section}>
            {leaveRequests.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No leave requests
                </Text>
              </View>
            ) : (
              leaveRequests.map((request) => (
                <View key={request.id} style={[styles.card, { backgroundColor: theme.card }]}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{request.userName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                      <Text style={styles.statusText}>{request.status}</Text>
                    </View>
                  </View>
                  <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                    {request.type.toUpperCase()} Leave
                  </Text>
                  <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                  </Text>
                  {request.reason && (
                    <Text style={[styles.cardReason, { color: theme.textSecondary }]}>
                      {request.reason}
                    </Text>
                  )}
                  {request.status === 'pending' && (
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[buttonStyles.secondary, styles.actionBtn, { borderColor: '#FF6B6B' }]}
                        onPress={() => handleRejectLeave(request.id)}
                      >
                        <Text style={[buttonStyles.secondaryText, { color: '#FF6B6B' }]}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[buttonStyles.primary, styles.actionBtn, { backgroundColor: '#4CAF50' }]}
                        onPress={() => handleApproveLeave(request.id)}
                      >
                        <Text style={buttonStyles.primaryText}>Approve</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'documents' && (
          <View style={styles.section}>
            {/* Sick Leave Certificates */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Sick Leave Certificates</Text>
            {certificates.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No certificates uploaded
                </Text>
              </View>
            ) : (
              certificates.map((cert) => (
                <View key={cert.id} style={[styles.card, { backgroundColor: theme.card }]}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      Sick Leave Certificate
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(cert.status) }]}>
                      <Text style={styles.statusText}>{cert.status}</Text>
                    </View>
                  </View>
                  <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                    {formatDate(cert.startDate)} - {formatDate(cert.endDate)}
                  </Text>
                  <TouchableOpacity
                    style={styles.fileLink}
                    onPress={() => handleViewDocument(cert.filePath, 'sick-leave-certificates')}
                  >
                    <IconSymbol name="doc" size={16} color={theme.primary} />
                    <Text style={[styles.fileName, { color: theme.primary }]}>{cert.fileName}</Text>
                  </TouchableOpacity>
                  {cert.notes && (
                    <Text style={[styles.cardReason, { color: theme.textSecondary }]}>
                      {cert.notes}
                    </Text>
                  )}
                  {cert.status === 'pending' && (
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[buttonStyles.secondary, styles.actionBtn, { borderColor: '#FF6B6B' }]}
                        onPress={() => handleRejectDocument(cert.id, 'certificate')}
                      >
                        <Text style={[buttonStyles.secondaryText, { color: '#FF6B6B' }]}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[buttonStyles.primary, styles.actionBtn, { backgroundColor: '#4CAF50' }]}
                        onPress={() => handleApproveDocument(cert.id, 'certificate')}
                      >
                        <Text style={buttonStyles.primaryText}>Approve</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}

            {/* General Documents */}
            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>General Documents</Text>
            {documents.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No documents uploaded
                </Text>
              </View>
            ) : (
              documents.map((doc) => (
                <View key={doc.id} style={[styles.card, { backgroundColor: theme.card }]}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      {doc.documentType.toUpperCase()}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(doc.status) }]}>
                      <Text style={styles.statusText}>{doc.status}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.fileLink}
                    onPress={() => handleViewDocument(doc.filePath, 'documents')}
                  >
                    <IconSymbol name="doc" size={16} color={theme.primary} />
                    <Text style={[styles.fileName, { color: theme.primary }]}>{doc.fileName}</Text>
                  </TouchableOpacity>
                  {doc.description && (
                    <Text style={[styles.cardReason, { color: theme.textSecondary }]}>
                      {doc.description}
                    </Text>
                  )}
                  {doc.status === 'pending' && (
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[buttonStyles.secondary, styles.actionBtn, { borderColor: '#FF6B6B' }]}
                        onPress={() => handleRejectDocument(doc.id, 'document')}
                      >
                        <Text style={[buttonStyles.secondaryText, { color: '#FF6B6B' }]}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[buttonStyles.primary, styles.actionBtn, { backgroundColor: '#4CAF50' }]}
                        onPress={() => handleApproveDocument(doc.id, 'document')}
                      >
                        <Text style={buttonStyles.primaryText}>Approve</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'employees' && (
          <View style={styles.section}>
            {employees.map((employee) => (
              <View key={employee.id} style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.employeeHeader}>
                  <View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      {employee.firstName} {employee.lastName}
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                      {employee.email}
                    </Text>
                    {employee.department && (
                      <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                        {employee.department}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.roleBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.roleBadgeText}>{employee.role}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'tasks' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[buttonStyles.primary, styles.createTaskBtn]}
              onPress={() => setShowTaskModal(true)}
            >
              <IconSymbol name="plus" size={20} color="#FFFFFF" />
              <Text style={buttonStyles.primaryText}>Create Task</Text>
            </TouchableOpacity>

            {tasks.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No tasks created yet
                </Text>
              </View>
            ) : (
              tasks.map((task) => (
                <View key={task.id} style={[styles.card, { backgroundColor: theme.card }]}>
                  <View style={styles.taskHeader}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{task.title}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                      <Text style={styles.priorityText}>{task.priority}</Text>
                    </View>
                  </View>
                  {task.description && (
                    <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                      {task.description}
                    </Text>
                  )}
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                    <Text style={styles.statusText}>{task.status}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Create Task Modal */}
      <Modal
        visible={showTaskModal}
        animationType="slide"
        transparent={true}
        onRequestClose={resetTaskForm}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Create Task</Text>
              <TouchableOpacity onPress={resetTaskForm}>
                <IconSymbol name="xmark" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: theme.text }]}>Assign To *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.employeeSelector}>
                {employees.map((emp) => (
                  <TouchableOpacity
                    key={emp.id}
                    style={[
                      styles.employeeChip,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      selectedEmployee?.id === emp.id && { borderColor: theme.primary, borderWidth: 2 }
                    ]}
                    onPress={() => setSelectedEmployee(emp)}
                  >
                    <Text style={[
                      styles.employeeChipText,
                      { color: theme.text },
                      selectedEmployee?.id === emp.id && { color: theme.primary, fontWeight: '600' }
                    ]}>
                      {emp.firstName} {emp.lastName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: theme.text }]}>Task Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                value={taskTitle}
                onChangeText={setTaskTitle}
                placeholder="Enter task title"
                placeholderTextColor={theme.textSecondary}
              />

              <Text style={[styles.label, { color: theme.text }]}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                value={taskDescription}
                onChangeText={setTaskDescription}
                placeholder="Enter task description"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
              />

              <Text style={[styles.label, { color: theme.text }]}>Priority</Text>
              <View style={styles.prioritySelector}>
                {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      taskPriority === priority && { borderColor: getPriorityColor(priority), borderWidth: 2 }
                    ]}
                    onPress={() => setTaskPriority(priority)}
                  >
                    <Text style={[
                      styles.priorityButtonText,
                      { color: theme.text },
                      taskPriority === priority && { color: getPriorityColor(priority), fontWeight: '600' }
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.text }]}>Due Date (Optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                value={taskDueDate}
                onChangeText={setTaskDueDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textSecondary}
              />

              <TouchableOpacity
                style={[buttonStyles.primary, styles.submitButton]}
                onPress={handleCreateTask}
                disabled={!selectedEmployee || !taskTitle}
              >
                <Text style={buttonStyles.primaryText}>Create Task</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return '#FF3B30';
    case 'high': return '#FF9500';
    case 'medium': return '#FFA726';
    case 'low': return '#4CAF50';
    default: return '#999';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return '#4CAF50';
    case 'completed': return '#4CAF50';
    case 'in-progress': return '#2196F3';
    case 'pending': return '#FFA726';
    case 'rejected': return '#FF6B6B';
    case 'cancelled': return '#FF6B6B';
    default: return '#999';
  }
};

const styles = StyleSheet.create({
  container: {
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
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    paddingBottom: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 4,
  },
  cardReason: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 12,
  },
  fileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  createTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 24,
    paddingTop: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  employeeSelector: {
    marginBottom: 8,
  },
  employeeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  employeeChipText: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  prioritySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  priorityButtonText: {
    fontSize: 14,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 24,
  },
});
