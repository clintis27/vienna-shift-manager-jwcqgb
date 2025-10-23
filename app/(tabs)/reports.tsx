
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, darkColors, buttonStyles } from '@/styles/commonStyles';
import { getUser, getMonthlyReports } from '@/utils/storage';
import { generateCurrentMonthReport, formatReportAsText } from '@/utils/reportGenerator';
import { User, MonthlyReport } from '@/types';

export default function ReportsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await getUser();
    setUser(userData);

    const allReports = await getMonthlyReports();
    const userReports = allReports.filter(r => r.userId === userData?.id);
    setReports(userReports.sort((a, b) => b.month.localeCompare(a.month)));

    if (userReports.length > 0) {
      setSelectedReport(userReports[0]);
    }

    console.log('Loaded reports:', userReports.length);
  };

  const handleGenerateReport = async () => {
    if (!user) return;

    setGenerating(true);
    try {
      const report = await generateCurrentMonthReport(user.id, `${user.firstName} ${user.lastName}`);
      Alert.alert('Success', 'Monthly report generated successfully!');
      await loadData();
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleShareReport = async (report: MonthlyReport) => {
    try {
      const reportText = formatReportAsText(report);
      await Share.share({
        message: reportText,
        title: `Monthly Report - ${report.month}`,
      });
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  const formatMonth = (monthStr: string) => {
    return new Date(monthStr + '-01').toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Monthly Reports</Text>
        <TouchableOpacity
          style={[buttonStyles.pastelBlue, styles.generateButton]}
          onPress={handleGenerateReport}
          disabled={generating}
        >
          <IconSymbol name="doc.text" size={20} color={theme.text} />
          <Text style={[buttonStyles.text, { color: theme.text }]}>
            {generating ? 'Generating...' : 'Generate'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Report Selector */}
        {reports.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Period</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.monthSelector}
            >
              {reports.map((report) => (
                <TouchableOpacity
                  key={report.id}
                  style={[
                    styles.monthButton,
                    { backgroundColor: theme.card },
                    selectedReport?.id === report.id && {
                      backgroundColor: theme.pastelBlue,
                    },
                  ]}
                  onPress={() => setSelectedReport(report)}
                >
                  <Text
                    style={[
                      styles.monthButtonText,
                      { color: theme.text },
                      selectedReport?.id === report.id && styles.monthButtonTextActive,
                    ]}
                  >
                    {formatMonth(report.month)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Report Details */}
        {selectedReport ? (
          <>
            {/* Summary Cards */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Work Summary</Text>
              <View style={styles.cardGrid}>
                <View style={[styles.summaryCard, { backgroundColor: theme.pastelBlue }]}>
                  <IconSymbol name="clock" size={32} color={theme.text} />
                  <Text style={[styles.summaryValue, { color: theme.text }]}>
                    {selectedReport.totalHours}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: theme.text }]}>
                    Total Hours
                  </Text>
                </View>

                <View style={[styles.summaryCard, { backgroundColor: theme.pastelPink }]}>
                  <IconSymbol name="calendar" size={32} color={theme.text} />
                  <Text style={[styles.summaryValue, { color: theme.text }]}>
                    {selectedReport.shiftsCompleted}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: theme.text }]}>
                    Shifts
                  </Text>
                </View>

                <View style={[styles.summaryCard, { backgroundColor: theme.pastelMint }]}>
                  <IconSymbol name="moon" size={32} color={theme.text} />
                  <Text style={[styles.summaryValue, { color: theme.text }]}>
                    {selectedReport.overtimeHours}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: theme.text }]}>
                    Overtime
                  </Text>
                </View>

                <View style={[styles.summaryCard, { backgroundColor: theme.pastelPurple }]}>
                  <IconSymbol name="building.2" size={32} color={theme.text} />
                  <Text style={[styles.summaryValue, { color: theme.text }]}>
                    {selectedReport.departments.length}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: theme.text }]}>
                    Departments
                  </Text>
                </View>
              </View>
            </View>

            {/* Shift Breakdown */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Shift Breakdown</Text>
              <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <IconSymbol name="sun.max" size={20} color={theme.primary} />
                    <Text style={[styles.detailText, { color: theme.text }]}>
                      Day Shifts
                    </Text>
                  </View>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {selectedReport.dayShifts}
                  </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <IconSymbol name="moon.stars" size={20} color={theme.primary} />
                    <Text style={[styles.detailText, { color: theme.text }]}>
                      Night Shifts
                    </Text>
                  </View>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {selectedReport.nightShifts}
                  </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <IconSymbol name="calendar.badge.clock" size={20} color={theme.primary} />
                    <Text style={[styles.detailText, { color: theme.text }]}>
                      Weekend Shifts
                    </Text>
                  </View>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {selectedReport.weekendShifts}
                  </Text>
                </View>
              </View>
            </View>

            {/* Attendance */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Attendance</Text>
              <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <IconSymbol name="xmark.circle" size={20} color={theme.error} />
                    <Text style={[styles.detailText, { color: theme.text }]}>
                      Absences
                    </Text>
                  </View>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {selectedReport.absences}
                  </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <IconSymbol name="checkmark.circle" size={20} color={theme.success} />
                    <Text style={[styles.detailText, { color: theme.text }]}>
                      Approved Leaves
                    </Text>
                  </View>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {selectedReport.approvedLeaves}
                  </Text>
                </View>
              </View>
            </View>

            {/* Departments */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Departments</Text>
              <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                {selectedReport.departments.map((dept, index) => (
                  <View key={dept}>
                    {index > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
                    <View style={styles.detailRow}>
                      <View style={styles.detailLabel}>
                        <IconSymbol name="building.2" size={20} color={theme.primary} />
                        <Text style={[styles.detailText, { color: theme.text }]}>
                          {dept}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[buttonStyles.pastelBlue, styles.actionButton]}
                onPress={() => handleShareReport(selectedReport)}
              >
                <IconSymbol name="square.and.arrow.up" size={20} color={theme.text} />
                <Text style={[buttonStyles.text, { color: theme.text }]}>
                  Share Report
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.pastelPink, styles.actionButton]}
                onPress={() => Alert.alert('Coming Soon', 'PDF download will be available soon!')}
              >
                <IconSymbol name="arrow.down.doc" size={20} color={theme.text} />
                <Text style={[buttonStyles.text, { color: theme.text }]}>
                  Download PDF
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
            <IconSymbol name="doc.text" size={64} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Reports Available
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Generate your first monthly report to get started
            </Text>
          </View>
        )}

        {/* Bottom Spacing for Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  monthSelector: {
    gap: 12,
  },
  monthButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
    elevation: 1,
  },
  monthButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  monthButtonTextActive: {
    fontWeight: '700',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '47%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailCard: {
    borderRadius: 16,
    padding: 20,
    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)',
    elevation: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyState: {
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
