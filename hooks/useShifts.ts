
import { useState, useEffect, useCallback } from 'react';
import { Shift } from '@/types';
import { getShifts, saveShifts } from '@/utils/storage';
import { generateMockShifts } from '@/utils/mockData';

export function useShifts(userId?: string, category?: string) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadShifts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let shiftsData = await getShifts();
      
      if (!shiftsData || shiftsData.length === 0) {
        if (userId && category) {
          shiftsData = generateMockShifts(userId, category as any);
          await saveShifts(shiftsData);
        }
      }
      
      setShifts(shiftsData);
    } catch (err) {
      console.error('Error loading shifts:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId, category]);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const getTodayShifts = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return shifts.filter(shift => shift.date === today);
  }, [shifts]);

  const getUpcomingShifts = useCallback((limit: number = 3) => {
    const today = new Date().toISOString().split('T')[0];
    return shifts
      .filter(shift => shift.date > today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit);
  }, [shifts]);

  const getShiftsByDate = useCallback((date: string) => {
    return shifts.filter(shift => shift.date === date);
  }, [shifts]);

  const addShift = useCallback(async (shift: Shift) => {
    try {
      const updatedShifts = [...shifts, shift];
      await saveShifts(updatedShifts);
      setShifts(updatedShifts);
    } catch (err) {
      console.error('Error adding shift:', err);
      throw err;
    }
  }, [shifts]);

  const updateShift = useCallback(async (shiftId: string, updates: Partial<Shift>) => {
    try {
      const updatedShifts = shifts.map(shift =>
        shift.id === shiftId ? { ...shift, ...updates } : shift
      );
      await saveShifts(updatedShifts);
      setShifts(updatedShifts);
    } catch (err) {
      console.error('Error updating shift:', err);
      throw err;
    }
  }, [shifts]);

  const deleteShift = useCallback(async (shiftId: string) => {
    try {
      const updatedShifts = shifts.filter(shift => shift.id !== shiftId);
      await saveShifts(updatedShifts);
      setShifts(updatedShifts);
    } catch (err) {
      console.error('Error deleting shift:', err);
      throw err;
    }
  }, [shifts]);

  return {
    shifts,
    loading,
    error,
    loadShifts,
    getTodayShifts,
    getUpcomingShifts,
    getShiftsByDate,
    addShift,
    updateShift,
    deleteShift,
  };
}
