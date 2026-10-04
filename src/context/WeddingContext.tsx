import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { initialWeddingData } from '../data/initialData';
import {
  BudgetItem,
  ChecklistItem,
  CoupleProfile,
  Guest,
  MoodboardItem,
  NoteItem,
  PaletteColor,
  RundownItem,
  SeatingTable,
  Vendor,
  WeddingData,
} from '../types/wedding';
import { downloadFile } from '../utils/formatters';

const STORAGE_KEY = 'mahligai_wedding_planner_v1';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface WeddingContextType {
  data: WeddingData;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  // Couple
  updateCouple: (profile: Partial<CoupleProfile>) => void;
  // Checklist
  addChecklistItem: (item: Omit<ChecklistItem, 'id' | 'completed'>) => void;
  updateChecklistItem: (id: string, updates: Partial<ChecklistItem>) => void;
  toggleChecklistComplete: (id: string) => void;
  deleteChecklistItem: (id: string) => void;
  // Budget
  setTotalBudget: (amount: number) => void;
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;
  // Guests
  addGuest: (guest: Omit<Guest, 'id'>) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  importGuests: (guests: Array<Omit<Guest, 'id'>>) => void;
  assignGuestToTable: (guestId: string, tableId: string | undefined) => void;
  // Vendors
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  // Rundown
  addRundownItem: (item: Omit<RundownItem, 'id' | 'order'>) => void;
  updateRundownItem: (id: string, updates: Partial<RundownItem>) => void;
  deleteRundownItem: (id: string) => void;
  moveRundownItem: (id: string, direction: 'up' | 'down') => void;
  // Tables
  addTable: (table: Omit<SeatingTable, 'id'>) => void;
  updateTable: (id: string, updates: Partial<SeatingTable>) => void;
  deleteTable: (id: string) => void;
  // Inspiration & Notes
  addMoodboard: (item: Omit<MoodboardItem, 'id'>) => void;
  deleteMoodboard: (id: string) => void;
  updatePalette: (palette: PaletteColor[]) => void;
  addNote: (note: Omit<NoteItem, 'id' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;
  // Settings & Storage
  setInvitationTemplate: (template: string) => void;
  toggleDarkMode: () => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
  exportBackupData: () => void;
  importBackupData: (jsonString: string) => boolean;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export const WeddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<WeddingData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.couple && parsed.checklist) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading stored wedding data:', e);
    }
    return initialWeddingData;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving wedding data to localStorage:', e);
    }
  }, [data]);

  // Sync dark mode class on HTML root
  useEffect(() => {
    if (data.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data.darkMode]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Trigger celebratory confetti
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#8A9A82', '#D8A7A0', '#C9A96E', '#FBF8F3'],
      });
    } catch {
      // ignore
    }
  };

  // COUPLE
  const updateCouple = (profile: Partial<CoupleProfile>) => {
    setData((prev) => ({
      ...prev,
      couple: { ...prev.couple, ...profile },
    }));
    showToast('Profil pernikahan berhasil diperbarui');
  };

  // CHECKLIST
  const addChecklistItem = (item: Omit<ChecklistItem, 'id' | 'completed'>) => {
    const newItem: ChecklistItem = {
      ...item,
      id: 'chk-' + Date.now(),
      completed: false,
    };
    setData((prev) => ({
      ...prev,
      checklist: [newItem, ...prev.checklist],
    }));
    showToast('Tugas checklist berhasil ditambahkan');
  };

  const updateChecklistItem = (id: string, updates: Partial<ChecklistItem>) => {
    setData((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
    showToast('Tugas checklist diperbarui');
  };

  const toggleChecklistComplete = (id: string) => {
    let nowCompleted = false;
    setData((prev) => {
      const updated = prev.checklist.map((item) => {
        if (item.id === id) {
          nowCompleted = !item.completed;
          return {
            ...item,
            completed: nowCompleted,
            completedAt: nowCompleted ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return item;
      });
      return { ...prev, checklist: updated };
    });

    if (nowCompleted) {
      triggerCelebration();
      showToast('Tugas berhasil diselesaikan! 🎉');
    } else {
      showToast('Status tugas dibatalkan');
    }
  };

  const deleteChecklistItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((item) => item.id !== id),
    }));
    showToast('Tugas checklist dihapus', 'info');
  };

  // BUDGET
  const setTotalBudget = (amount: number) => {
    setData((prev) => ({
      ...prev,
      couple: { ...prev.couple, totalBudget: amount },
    }));
    showToast('Total batas anggaran diperbarui');
  };

  const addBudgetItem = (item: Omit<BudgetItem, 'id'>) => {
    const newItem: BudgetItem = {
      ...item,
      id: 'bg-' + Date.now(),
    };
    setData((prev) => ({
      ...prev,
      budget: [...prev.budget, newItem],
    }));
    showToast('Pos anggaran berhasil ditambahkan');
  };

  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    setData((prev) => ({
      ...prev,
      budget: prev.budget.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
    showToast('Pos anggaran diperbarui');
  };

  const deleteBudgetItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      budget: prev.budget.filter((item) => item.id !== id),
    }));
    showToast('Pos anggaran dihapus', 'info');
  };

  // GUESTS
  const addGuest = (guest: Omit<Guest, 'id'>) => {
    const newGuest: Guest = {
      ...guest,
      id: 'gst-' + Date.now(),
    };
    setData((prev) => ({
      ...prev,
      guests: [newGuest, ...prev.guests],
    }));
    showToast(`Tamu "${guest.name}" berhasil ditambahkan`);
  };

  const updateGuest = (id: string, updates: Partial<Guest>) => {
    setData((prev) => ({
      ...prev,
      guests: prev.guests.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
    showToast('Data tamu diperbarui');
  };

  const deleteGuest = (id: string) => {
    setData((prev) => ({
      ...prev,
      guests: prev.guests.filter((g) => g.id !== id),
    }));
    showToast('Tamu dihapus dari daftar', 'info');
  };

  const importGuests = (imported: Array<Omit<Guest, 'id'>>) => {
    const timestamp = Date.now();
    const newGuests: Guest[] = imported.map((item, idx) => ({
      ...item,
      id: `gst-imp-${timestamp}-${idx}`,
    }));
    setData((prev) => ({
      ...prev,
      guests: [...prev.guests, ...newGuests],
    }));
    showToast(`${newGuests.length} tamu berhasil diimpor dari CSV!`);
  };

  const assignGuestToTable = (guestId: string, tableId: string | undefined) => {
    setData((prev) => ({
      ...prev,
      guests: prev.guests.map((g) => (g.id === guestId ? { ...g, tableId } : g)),
    }));
    showToast(tableId ? 'Tamu ditempatkan ke meja' : 'Penempatan meja dihapus');
  };

  // VENDORS
  const addVendor = (vendor: Omit<Vendor, 'id'>) => {
    const newVendor: Vendor = {
      ...vendor,
      id: 'vnd-' + Date.now(),
    };
    setData((prev) => ({
      ...prev,
      vendors: [...prev.vendors, newVendor],
    }));
    showToast(`Vendor "${vendor.name}" berhasil ditambahkan`);
  };

  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    setData((prev) => ({
      ...prev,
      vendors: prev.vendors.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    }));
    showToast('Data vendor diperbarui');
  };

  const deleteVendor = (id: string) => {
    setData((prev) => ({
      ...prev,
      vendors: prev.vendors.filter((v) => v.id !== id),
    }));
    showToast('Vendor dihapus', 'info');
  };

  // RUNDOWN
  const addRundownItem = (item: Omit<RundownItem, 'id' | 'order'>) => {
    const maxOrder = data.rundown.reduce((max, cur) => Math.max(max, cur.order), 0);
    const newItem: RundownItem = {
      ...item,
      id: 'rd-' + Date.now(),
      order: maxOrder + 1,
    };
    const sorted = [...data.rundown, newItem].sort((a, b) => a.startTime.localeCompare(b.startTime));
    // re-index order
    const reindexed = sorted.map((rd, i) => ({ ...rd, order: i + 1 }));
    setData((prev) => ({
      ...prev,
      rundown: reindexed,
    }));
    showToast('Sesi acara berhasil ditambahkan ke rundown');
  };

  const updateRundownItem = (id: string, updates: Partial<RundownItem>) => {
    setData((prev) => {
      const updated = prev.rundown.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      return {
        ...prev,
        rundown: updated.sort((a, b) => a.order - b.order),
      };
    });
    showToast('Sesi rundown diperbarui');
  };

  const deleteRundownItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      rundown: prev.rundown.filter((item) => item.id !== id),
    }));
    showToast('Sesi rundown dihapus', 'info');
  };

  const moveRundownItem = (id: string, direction: 'up' | 'down') => {
    setData((prev) => {
      const list = [...prev.rundown].sort((a, b) => a.order - b.order);
      const index = list.findIndex((i) => i.id === id);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;

      // swap
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;

      const reindexed = list.map((item, idx) => ({ ...item, order: idx + 1 }));
      return {
        ...prev,
        rundown: reindexed,
      };
    });
  };

  // TABLES
  const addTable = (table: Omit<SeatingTable, 'id'>) => {
    const newTable: SeatingTable = {
      ...table,
      id: 'tbl-' + Date.now(),
    };
    setData((prev) => ({
      ...prev,
      tables: [...prev.tables, newTable],
    }));
    showToast(`Meja "${table.name}" berhasil dibuat`);
  };

  const updateTable = (id: string, updates: Partial<SeatingTable>) => {
    setData((prev) => ({
      ...prev,
      tables: prev.tables.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    showToast('Data meja diperbarui');
  };

  const deleteTable = (id: string) => {
    setData((prev) => ({
      ...prev,
      tables: prev.tables.filter((t) => t.id !== id),
      // clear assignment of guests at this table
      guests: prev.guests.map((g) => (g.tableId === id ? { ...g, tableId: undefined } : g)),
    }));
    showToast('Meja dihapus dan tamu terkait dikembalikan ke daftar tanpa meja', 'info');
  };

  // INSPIRATION & NOTES
  const addMoodboard = (item: Omit<MoodboardItem, 'id'>) => {
    const newItem: MoodboardItem = {
      ...item,
      id: 'mb-' + Date.now(),
    };
    setData((prev) => ({
      ...prev,
      moodboards: [newItem, ...prev.moodboards],
    }));
    showToast('Inspirasi visual ditambahkan ke moodboard');
  };

  const deleteMoodboard = (id: string) => {
    setData((prev) => ({
      ...prev,
      moodboards: prev.moodboards.filter((m) => m.id !== id),
    }));
    showToast('Inspirasi dihapus', 'info');
  };

  const updatePalette = (palette: PaletteColor[]) => {
    setData((prev) => ({ ...prev, palette }));
    showToast('Palet warna tema pernikahan disimpan');
  };

  const addNote = (note: Omit<NoteItem, 'id' | 'updatedAt'>) => {
    const newNote: NoteItem = {
      ...note,
      id: 'nt-' + Date.now(),
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setData((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }));
    showToast('Catatan baru disimpan');
  };

  const updateNote = (id: string, updates: Partial<NoteItem>) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === id
          ? {
              ...n,
              ...updates,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : n
      ),
    }));
    showToast('Catatan diperbarui');
  };

  const deleteNote = (id: string) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
    showToast('Catatan dihapus', 'info');
  };

  // SETTINGS & STORAGE
  const setInvitationTemplate = (template: string) => {
    setData((prev) => ({ ...prev, invitationTemplate: template }));
    showToast('Template pesan WhatsApp disimpan');
  };

  const toggleDarkMode = () => {
    setData((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const resetToSampleData = () => {
    setData(initialWeddingData);
    showToast('Data berhasil diatur ulang ke data contoh');
  };

  const clearAllData = () => {
    const blank: WeddingData = {
      couple: {
        groomName: '',
        brideName: '',
        groomNickname: '',
        brideNickname: '',
        weddingDate: '',
        weddingTime: '',
        venueName: '',
        venueAddress: '',
        totalBudget: 0,
        motto: '',
      },
      checklist: [],
      budget: [],
      guests: [],
      vendors: [],
      rundown: [],
      tables: [],
      moodboards: [],
      palette: initialWeddingData.palette,
      notes: [],
      invitationTemplate: initialWeddingData.invitationTemplate,
      darkMode: false,
    };
    setData(blank);
    showToast('Semua data berhasil dikosongkan. Siap mulai dari awal!', 'info');
  };

  const exportBackupData = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const dateTag = new Date().toISOString().split('T')[0];
    const coupleTag = (data.couple.groomNickname || 'Wedding') + '_' + (data.couple.brideNickname || 'Planner');
    const filename = `mahligai_backup_${coupleTag}_${dateTag}.json`;
    downloadFile(jsonStr, filename, 'application/json');
    showToast('Cadangan data JSON berhasil diunduh');
  };

  const importBackupData = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.couple && Array.isArray(parsed.checklist)) {
        setData(parsed);
        showToast('Data cadangan berhasil dipulihkan!');
        return true;
      } else {
        showToast('Format file JSON tidak sesuai struktur Mahligai', 'error');
        return false;
      }
    } catch {
      showToast('Gagal membaca file JSON cadangan', 'error');
      return false;
    }
  };

  return (
    <WeddingContext.Provider
      value={{
        data,
        toasts,
        showToast,
        removeToast,
        updateCouple,
        addChecklistItem,
        updateChecklistItem,
        toggleChecklistComplete,
        deleteChecklistItem,
        setTotalBudget,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        addGuest,
        updateGuest,
        deleteGuest,
        importGuests,
        assignGuestToTable,
        addVendor,
        updateVendor,
        deleteVendor,
        addRundownItem,
        updateRundownItem,
        deleteRundownItem,
        moveRundownItem,
        addTable,
        updateTable,
        deleteTable,
        addMoodboard,
        deleteMoodboard,
        updatePalette,
        addNote,
        updateNote,
        deleteNote,
        setInvitationTemplate,
        toggleDarkMode,
        resetToSampleData,
        clearAllData,
        exportBackupData,
        importBackupData,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
};

export const useWedding = (): WeddingContextType => {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};
