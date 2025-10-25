
import { Employee } from '@/types';
import { supabase } from '@/app/integrations/supabase/client';

export const employeeService = {
  async fetchEmployees(category?: string): Promise<Employee[]> {
    try {
      let query = supabase
        .from('employees')
        .select('*')
        .order('first_name', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchEmployees:', error);
      throw error;
    }
  },

  async fetchEmployeeById(employeeId: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single();

      if (error) {
        console.error('Error fetching employee:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchEmployeeById:', error);
      throw error;
    }
  },

  async createEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([{
          user_id: employee.userId,
          email: employee.email,
          first_name: employee.firstName,
          last_name: employee.lastName,
          role: employee.role,
          category: employee.category,
          department: employee.department,
          phone_number: employee.phoneNumber,
          avatar_url: employee.avatarUrl,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating employee:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createEmployee:', error);
      throw error;
    }
  },

  async updateEmployee(employeeId: string, updates: Partial<Employee>): Promise<Employee> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          role: updates.role,
          category: updates.category,
          department: updates.department,
          phone_number: updates.phoneNumber,
          avatar_url: updates.avatarUrl,
        })
        .eq('id', employeeId)
        .select()
        .single();

      if (error) {
        console.error('Error updating employee:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateEmployee:', error);
      throw error;
    }
  },
};
