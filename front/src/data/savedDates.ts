// Saved dates from calendar bookmark feature
export interface SavedDate {
  id: string;
  beachName: string;
  date: Date;
  hour: number;
  status: 'free' | 'normal' | 'busy';
  createdAt: Date;
}

// In a real app, this would be persisted to localStorage or backend
let savedDates: SavedDate[] = [];

export const addSavedDate = (date: SavedDate) => {
  savedDates.push(date);
  // In real app: save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('beachcheck_saved_dates', JSON.stringify(savedDates));
  }
};

export const removeSavedDate = (id: string) => {
  savedDates = savedDates.filter(d => d.id !== id);
  // In real app: save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('beachcheck_saved_dates', JSON.stringify(savedDates));
  }
};

export const getSavedDates = (): SavedDate[] => {
  // In real app: load from localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('beachcheck_saved_dates');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return parsed.map((d: any) => ({
        ...d,
        date: new Date(d.date),
        createdAt: new Date(d.createdAt),
      }));
    }
  }
  return savedDates;
};

export const getSavedDatesForMonth = (year: number, month: number): SavedDate[] => {
  return getSavedDates().filter(saved => {
    const savedDate = new Date(saved.date);
    return savedDate.getFullYear() === year && savedDate.getMonth() === month;
  });
};
