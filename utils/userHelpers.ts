
import { User } from '@/types';

export const getUserFullName = (user: User | null): string => {
  if (!user) return 'Employee';
  return `${user.firstName} ${user.lastName}`.trim() || 'Employee';
};

export const getUserInitials = (user: User | null): string => {
  if (!user) return 'E';
  const firstInitial = user.firstName?.charAt(0) || '';
  const lastInitial = user.lastName?.charAt(0) || '';
  return `${firstInitial}${lastInitial}`.toUpperCase() || 'E';
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

export const isManager = (user: User | null): boolean => {
  return user?.role === 'manager';
};

export const isEmployee = (user: User | null): boolean => {
  return user?.role === 'employee';
};

export const hasAdminAccess = (user: User | null): boolean => {
  return isAdmin(user) || isManager(user);
};
