
import { User, Shift, Department, EmployeeCategory } from '@/types';

// Mock users for demo - now with categories
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
    email: 'breakfast-admin@vienna.com',
    firstName: 'Maria',
    lastName: 'Schmidt',
    role: 'admin',
    category: 'breakfast',
    department: 'Breakfast',
    phoneNumber: '+43 1 234 5679',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'housekeeping-admin@vienna.com',
    firstName: 'Hans',
    lastName: 'Müller',
    role: 'admin',
    category: 'housekeeping',
    department: 'Housekeeping',
    phoneNumber: '+43 1 234 5680',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    email: 'frontdesk-admin@vienna.com',
    firstName: 'Anna',
    lastName: 'Weber',
    role: 'admin',
    category: 'frontdesk',
    department: 'Front Desk',
    phoneNumber: '+43 1 234 5681',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    email: 'employee@vienna.com',
    firstName: 'Peter',
    lastName: 'Fischer',
    role: 'employee',
    category: 'breakfast',
    department: 'Breakfast',
    phoneNumber: '+43 1 234 5682',
    createdAt: new Date().toISOString(),
  },
];

// Mock departments
export const mockDepartments: Department[] = [
  { id: '1', name: 'Breakfast', color: '#F57C00', managerIds: ['2'] },
  { id: '2', name: 'Housekeeping', color: '#388E3C', managerIds: ['3'] },
  { id: '3', name: 'Front Desk', color: '#1976D2', managerIds: ['4'] },
];

// Generate mock shifts for the next 7 days
export const generateMockShifts = (userId?: string, category?: EmployeeCategory): Shift[] => {
  const shifts: Shift[] = [];
  const today = new Date();
  
  const categoryData: Record<EmployeeCategory, { department: string; position: string; color: string }> = {
    breakfast: { department: 'Breakfast', position: 'Breakfast Server', color: '#F57C00' },
    housekeeping: { department: 'Housekeeping', position: 'Housekeeper', color: '#388E3C' },
    frontdesk: { department: 'Front Desk', position: 'Receptionist', color: '#1976D2' },
  };

  const userCategory = category || 'breakfast';
  const data = categoryData[userCategory];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Morning shift
    shifts.push({
      id: `shift-${i}-morning`,
      userId: userId || '5',
      userName: 'Peter Fischer',
      department: data.department,
      category: userCategory,
      startTime: '08:00',
      endTime: '16:00',
      date: dateStr,
      status: i === 0 ? 'in-progress' : 'scheduled',
      position: data.position,
      color: data.color,
      notes: i === 0 ? 'Current shift' : undefined,
    });

    // Evening shift (every other day)
    if (i % 2 === 0) {
      shifts.push({
        id: `shift-${i}-evening`,
        userId: userId || '5',
        userName: 'Peter Fischer',
        department: data.department,
        category: userCategory,
        startTime: '16:00',
        endTime: '00:00',
        date: dateStr,
        status: 'scheduled',
        position: data.position,
        color: data.color,
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
  lastName: string,
  category: EmployeeCategory
): User => {
  console.log('Registering new user:', email);
  
  const categoryDepartments: Record<EmployeeCategory, string> = {
    breakfast: 'Breakfast',
    housekeeping: 'Housekeeping',
    frontdesk: 'Front Desk',
  };
  
  const newUser: User = {
    id: Date.now().toString(),
    email,
    firstName,
    lastName,
    role: 'employee',
    category,
    department: categoryDepartments[category],
    createdAt: new Date().toISOString(),
  };
  
  console.log('User registered successfully:', newUser.firstName);
  return newUser;
};

export const getCategoryColor = (category: EmployeeCategory): string => {
  const colors: Record<EmployeeCategory, string> = {
    breakfast: '#F57C00',
    housekeeping: '#388E3C',
    frontdesk: '#1976D2',
  };
  return colors[category];
};

export const getCategoryName = (category: EmployeeCategory): string => {
  const names: Record<EmployeeCategory, string> = {
    breakfast: 'Breakfast',
    housekeeping: 'Housekeeping',
    frontdesk: 'Front Desk',
  };
  return names[category];
};
