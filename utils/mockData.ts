
import { User, Shift, Department } from '@/types';

// Mock users for demo
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@vienna.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    department: 'Management',
    phoneNumber: '+43 1 234 5678',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'manager@vienna.com',
    firstName: 'Maria',
    lastName: 'Schmidt',
    role: 'manager',
    department: 'Front Desk',
    phoneNumber: '+43 1 234 5679',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'employee@vienna.com',
    firstName: 'Hans',
    lastName: 'Müller',
    role: 'employee',
    department: 'Housekeeping',
    phoneNumber: '+43 1 234 5680',
    createdAt: new Date().toISOString(),
  },
];

// Mock departments
export const mockDepartments: Department[] = [
  { id: '1', name: 'Front Desk', color: '#1976D2', managerIds: ['2'] },
  { id: '2', name: 'Housekeeping', color: '#388E3C', managerIds: ['2'] },
  { id: '3', name: 'Restaurant', color: '#F57C00', managerIds: ['2'] },
  { id: '4', name: 'Maintenance', color: '#7B1FA2', managerIds: ['2'] },
  { id: '5', name: 'Management', color: '#C62828', managerIds: ['1'] },
];

// Generate mock shifts for the next 7 days
export const generateMockShifts = (userId?: string): Shift[] => {
  const shifts: Shift[] = [];
  const today = new Date();
  const departments = ['Front Desk', 'Housekeeping', 'Restaurant', 'Maintenance'];
  const positions = ['Receptionist', 'Housekeeper', 'Waiter', 'Technician'];
  const colors = ['#1976D2', '#388E3C', '#F57C00', '#7B1FA2'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Morning shift
    shifts.push({
      id: `shift-${i}-morning`,
      userId: userId || '3',
      userName: 'Hans Müller',
      department: departments[i % departments.length],
      startTime: '08:00',
      endTime: '16:00',
      date: dateStr,
      status: i === 0 ? 'in-progress' : 'scheduled',
      position: positions[i % positions.length],
      color: colors[i % colors.length],
      notes: i === 0 ? 'Current shift' : undefined,
    });

    // Evening shift (every other day)
    if (i % 2 === 0) {
      shifts.push({
        id: `shift-${i}-evening`,
        userId: userId || '3',
        userName: 'Hans Müller',
        department: departments[(i + 1) % departments.length],
        startTime: '16:00',
        endTime: '00:00',
        date: dateStr,
        status: 'scheduled',
        position: positions[(i + 1) % positions.length],
        color: colors[(i + 1) % colors.length],
      });
    }
  }

  return shifts;
};

// Validate login credentials (mock)
export const validateLogin = (email: string, password: string): User | null => {
  console.log('Validating login for:', email);
  
  // Simple mock validation
  const user = mockUsers.find(u => u.email === email);
  
  if (user && password.length >= 6) {
    console.log('Login successful for user:', user.firstName);
    return user;
  }
  
  console.log('Login failed');
  return null;
};

// Register new user (mock)
export const registerUser = (
  email: string,
  password: string,
  firstName: string,
  lastName: string
): User => {
  console.log('Registering new user:', email);
  
  const newUser: User = {
    id: Date.now().toString(),
    email,
    firstName,
    lastName,
    role: 'employee',
    department: 'Front Desk',
    createdAt: new Date().toISOString(),
  };
  
  console.log('User registered successfully:', newUser.firstName);
  return newUser;
};
