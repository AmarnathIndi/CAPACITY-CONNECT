import { create } from 'zustand';
import { AuditLogItem } from '../types';

interface AuditState {
  auditLogs: AuditLogItem[];
  logAction: (actorName: string, actorRole: string, action: string, target: string, details: string) => void;
}

import initialAuditLogs from '../data/auditLogs.json';

export const useAuditStore = create<AuditState>((set) => {
  const saved = localStorage.getItem('capacity_connect_audit');
  let initialLogs: AuditLogItem[] = initialAuditLogs as AuditLogItem[];
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= initialAuditLogs.length) {
        initialLogs = parsed;
      }
    } catch {
      initialLogs = initialAuditLogs as AuditLogItem[];
    }
  }

  return {
    auditLogs: initialLogs,
    logAction: (actorName, actorRole, action, target, details) => {
      const newEntry: AuditLogItem = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actorName,
        actorRole,
        action,
        target,
        details,
        ipAddress: '10.42.1.22'
      };
      set((state) => {
        const updated = [newEntry, ...state.auditLogs];
        localStorage.setItem('capacity_connect_audit', JSON.stringify(updated));
        return { auditLogs: updated };
      });
    }
  };
});
