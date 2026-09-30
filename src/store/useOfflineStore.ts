import { create } from 'zustand';
import { OfflinePendingSync } from '../types';
import { api, USE_MOCKS } from '../api/client';

interface OfflineState {
  isOffline: boolean;
  setOffline: (offline: boolean) => void;
  toggleOffline: () => void;
  offlineSavedCourses: string[];
  toggleSaveOfflineCourse: (courseId: string) => void;
  isCourseSavedOffline: (courseId: string) => boolean;
  pendingSyncs: OfflinePendingSync[];
  queueOfflineTest: (item: Omit<OfflinePendingSync, 'id' | 'timestamp' | 'status'>) => void;
  clearPendingSync: (id: string) => void;
  syncAllPending: (processor: (item: OfflinePendingSync) => void) => void;
}

export const useOfflineStore = create<OfflineState>((set, get) => {
  const savedCourses = localStorage.getItem('capacity_connect_offline_courses');
  const initialOfflineCourses = savedCourses ? JSON.parse(savedCourses) : ['crs-dwr-101'];

  const savedQueue = localStorage.getItem('capacity_connect_offline_queue');
  const initialQueue = savedQueue ? JSON.parse(savedQueue) : [];

  return {
    isOffline: false,
    setOffline: (val) => set({ isOffline: val }),
    toggleOffline: () => set((state) => ({ isOffline: !state.isOffline })),

    offlineSavedCourses: initialOfflineCourses,
    toggleSaveOfflineCourse: (courseId) => {
      set((state) => {
        const exists = state.offlineSavedCourses.includes(courseId);
        const updated = exists
          ? state.offlineSavedCourses.filter((id) => id !== courseId)
          : [...state.offlineSavedCourses, courseId];
        localStorage.setItem('capacity_connect_offline_courses', JSON.stringify(updated));
        return { offlineSavedCourses: updated };
      });
    },
    isCourseSavedOffline: (courseId) => {
      return get().offlineSavedCourses.includes(courseId);
    },

    pendingSyncs: initialQueue,
    queueOfflineTest: (item) => {
      const newItem: OfflinePendingSync = {
        ...item,
        id: `sync-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      set((state) => {
        const updated = [...state.pendingSyncs, newItem];
        localStorage.setItem('capacity_connect_offline_queue', JSON.stringify(updated));
        return { pendingSyncs: updated };
      });
    },
    clearPendingSync: (id) => {
      set((state) => {
        const updated = state.pendingSyncs.filter((item) => item.id !== id);
        localStorage.setItem('capacity_connect_offline_queue', JSON.stringify(updated));
        return { pendingSyncs: updated };
      });
    },
    syncAllPending: (processor) => {
      const { pendingSyncs } = get();
      if (pendingSyncs.length === 0) return;

      // Call real backend offline sync endpoint
      if (!USE_MOCKS) {
        const payload = pendingSyncs.map((p) => ({
          id: p.id,
          testId: p.testId,
          answers: Object.entries(p.answers || {}).map(([questionId, selectedOptionIndex]) => ({
            questionId,
            selectedOptionIndex,
          })),
          completedAt: p.timestamp,
        }));
        api.offlineSync.sync(payload).catch((err) => console.warn('[useOfflineStore] API sync:', err.message));
      }

      pendingSyncs.forEach((item) => {
        processor(item);
      });
      set({ pendingSyncs: [] });
      localStorage.setItem('capacity_connect_offline_queue', JSON.stringify([]));
    }
  };
});
