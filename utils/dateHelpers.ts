
export const formatTime = (time: string): string => {
  return time;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const dateOptions: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric',
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };
  
  const formattedDate = date.toLocaleDateString('en-US', dateOptions);
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
  
  return `${formattedDate} at ${formattedTime}`;
};

export const formatMonth = (monthStr: string): string => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const isToday = (dateStr: string): boolean => {
  return dateStr === getTodayDate();
};

export const isPast = (dateStr: string): boolean => {
  return dateStr < getTodayDate();
};

export const isFuture = (dateStr: string): boolean => {
  return dateStr > getTodayDate();
};

export const getWeekDates = (startDate?: Date): Date[] => {
  const start = startDate || new Date();
  const dates: Date[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

export const calculateHoursBetween = (startTime: string, endTime: string): number => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return Math.round(hours * 100) / 100;
};
