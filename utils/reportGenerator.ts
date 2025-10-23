
import { MonthlyReport, Shift, TimeEntry, LeaveRequest } from '@/types';
import { getShifts, getTimeEntries, getLeaveRequests, saveMonthlyReport } from './storage';

// Generate monthly report for a user
export async function generateMonthlyReport(
  userId: string,
  userName: string,
  month: string, // Format: YYYY-MM
  year: number
): Promise<MonthlyReport> {
  console.log(`Generating monthly report for ${userName} - ${month}`);

  const shifts = await getShifts();
  const timeEntries = await getTimeEntries();
  const leaveRequests = await getLeaveRequests();

  // Filter data for the specific user and month
  const userShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.date);
    const shiftMonth = `${shiftDate.getFullYear()}-${String(shiftDate.getMonth() + 1).padStart(2, '0')}`;
    return shift.userId === userId && shiftMonth === month && shift.status === 'completed';
  });

  const userTimeEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.clockIn);
    const entryMonth = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;
    return entry.userId === userId && entryMonth === month;
  });

  const userLeaveRequests = leaveRequests.filter(request => {
    const startDate = new Date(request.startDate);
    const requestMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    return request.userId === userId && requestMonth === month && request.status === 'approved';
  });

  // Calculate metrics
  const totalHours = userTimeEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
  const overtimeHours = userTimeEntries.reduce((sum, entry) => sum + (entry.overtimeHours || 0), 0);
  const shiftsCompleted = userShifts.length;

  // Count shift types
  let dayShifts = 0;
  let nightShifts = 0;
  let weekendShifts = 0;

  userShifts.forEach(shift => {
    const shiftDate = new Date(shift.date);
    const dayOfWeek = shiftDate.getDay();
    const startHour = parseInt(shift.startTime.split(':')[0]);

    // Weekend shifts (Saturday = 6, Sunday = 0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendShifts++;
    }

    // Night shifts (after 6 PM or before 6 AM)
    if (startHour >= 18 || startHour < 6) {
      nightShifts++;
    } else {
      dayShifts++;
    }
  });

  // Count absences (days with scheduled shifts but no time entries)
  const scheduledShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.date);
    const shiftMonth = `${shiftDate.getFullYear()}-${String(shiftDate.getMonth() + 1).padStart(2, '0')}`;
    return shift.userId === userId && shiftMonth === month && shift.status === 'scheduled';
  });

  const absences = scheduledShifts.filter(shift => {
    return !userTimeEntries.some(entry => entry.shiftId === shift.id);
  }).length;

  // Get unique departments
  const departments = [...new Set(userShifts.map(shift => shift.department))];

  const report: MonthlyReport = {
    id: `${userId}-${month}`,
    userId,
    userName,
    month,
    year,
    totalHours: Math.round(totalHours * 100) / 100,
    shiftsCompleted,
    dayShifts,
    nightShifts,
    weekendShifts,
    absences,
    approvedLeaves: userLeaveRequests.length,
    overtimeHours: Math.round(overtimeHours * 100) / 100,
    departments,
    generatedAt: new Date().toISOString(),
  };

  await saveMonthlyReport(report);
  console.log('Monthly report generated:', report);

  return report;
}

// Generate report for current month
export async function generateCurrentMonthReport(
  userId: string,
  userName: string
): Promise<MonthlyReport> {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const year = now.getFullYear();

  return generateMonthlyReport(userId, userName, month, year);
}

// Format report as text for sharing
export function formatReportAsText(report: MonthlyReport): string {
  const monthName = new Date(report.month + '-01').toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return `
HOTEL HOUSE OF VIENNA
Monthly Employee Report

Employee: ${report.userName}
Period: ${monthName}
Generated: ${new Date(report.generatedAt).toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WORK SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Hours Worked: ${report.totalHours} hrs
Shifts Completed: ${report.shiftsCompleted}
Overtime Hours: ${report.overtimeHours} hrs

SHIFT BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Day Shifts: ${report.dayShifts}
Night Shifts: ${report.nightShifts}
Weekend Shifts: ${report.weekendShifts}

ATTENDANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Absences: ${report.absences}
Approved Leaves: ${report.approvedLeaves}

DEPARTMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${report.departments.join(', ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This report is confidential and intended for
authorized personnel only.
  `.trim();
}

// Generate HTML report (for future PDF generation)
export function formatReportAsHTML(report: MonthlyReport): string {
  const monthName = new Date(report.month + '-01').toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #1976D2;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .hotel-name {
      font-size: 24px;
      font-weight: bold;
      color: #1976D2;
      margin-bottom: 5px;
    }
    .report-title {
      font-size: 18px;
      color: #666;
    }
    .employee-info {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #1976D2;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    .metric {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #1976D2;
    }
    .metric-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="hotel-name">HOTEL HOUSE OF VIENNA</div>
    <div class="report-title">Monthly Employee Report</div>
  </div>

  <div class="employee-info">
    <strong>Employee:</strong> ${report.userName}<br>
    <strong>Period:</strong> ${monthName}<br>
    <strong>Generated:</strong> ${new Date(report.generatedAt).toLocaleDateString()}
  </div>

  <div class="section">
    <div class="section-title">Work Summary</div>
    <div class="metric-grid">
      <div class="metric">
        <div class="metric-label">Total Hours Worked</div>
        <div class="metric-value">${report.totalHours} hrs</div>
      </div>
      <div class="metric">
        <div class="metric-label">Shifts Completed</div>
        <div class="metric-value">${report.shiftsCompleted}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Overtime Hours</div>
        <div class="metric-value">${report.overtimeHours} hrs</div>
      </div>
      <div class="metric">
        <div class="metric-label">Departments</div>
        <div class="metric-value">${report.departments.length}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Shift Breakdown</div>
    <div class="metric-grid">
      <div class="metric">
        <div class="metric-label">Day Shifts</div>
        <div class="metric-value">${report.dayShifts}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Night Shifts</div>
        <div class="metric-value">${report.nightShifts}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Weekend Shifts</div>
        <div class="metric-value">${report.weekendShifts}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Attendance</div>
    <div class="metric-grid">
      <div class="metric">
        <div class="metric-label">Absences</div>
        <div class="metric-value">${report.absences}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Approved Leaves</div>
        <div class="metric-value">${report.approvedLeaves}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    This report is confidential and intended for authorized personnel only.
  </div>
</body>
</html>
  `.trim();
}
