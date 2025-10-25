
import { Shift, Employee } from '@/types';
import { supabase } from '@/app/integrations/supabase/client';

export const shiftService = {
  async fetchShifts(employeeId?: string): Promise<Shift[]> {
    try {
      let query = supabase
        .from('shifts')
        .select(`
          *,
          employees:employee_id (
            id,
            first_name,
            last_name,
            email,
            category
          )
        `)
        .order('date', { ascending: true });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching shifts:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchShifts:', error);
      throw error;
    }
  },

  async createShift(shift: Omit<Shift, 'id'>): Promise<Shift> {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .insert([{
          employee_id: shift.userId,
          department: shift.department,
          category: shift.category,
          start_time: shift.startTime,
          end_time: shift.endTime,
          date: shift.date,
          status: shift.status,
          position: shift.position,
          notes: shift.notes,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating shift:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createShift:', error);
      throw error;
    }
  },

  async updateShift(shiftId: string, updates: Partial<Shift>): Promise<Shift> {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .update({
          department: updates.department,
          category: updates.category,
          start_time: updates.startTime,
          end_time: updates.endTime,
          date: updates.date,
          status: updates.status,
          position: updates.position,
          notes: updates.notes,
        })
        .eq('id', shiftId)
        .select()
        .single();

      if (error) {
        console.error('Error updating shift:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateShift:', error);
      throw error;
    }
  },

  async deleteShift(shiftId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId);

      if (error) {
        console.error('Error deleting shift:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteShift:', error);
      throw error;
    }
  },
};
