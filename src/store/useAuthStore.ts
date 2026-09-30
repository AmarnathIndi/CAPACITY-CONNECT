import { create } from 'zustand';
import { User, UserRole } from '../types';
import initialUsers from '../data/users.json';
import { api, USE_MOCKS } from '../api/client';

interface AuthState {
  currentUser: User | null;
  users: User[];
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  demoLogin: (role: UserRole) => User;
  signup: (userData: Partial<User>) => Promise<{ success: boolean; user: User; message?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  approveUser: (userId: string, assignedRole: UserRole) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const savedUsers = localStorage.getItem('capacity_connect_users');
  let users: User[] = initialUsers as User[];
  if (savedUsers) {
    try {
      const parsed = JSON.parse(savedUsers);
      if (Array.isArray(parsed) && parsed.length >= (initialUsers as User[]).length) {
        users = parsed;
      }
    } catch {
      users = initialUsers as User[];
    }
  }

  const savedCurrentUser = localStorage.getItem('capacity_connect_current_user');
  let currentUser: User | null = null;
  if (savedCurrentUser) {
    try {
      currentUser = JSON.parse(savedCurrentUser);
      if (currentUser && currentUser.avatar) {
        delete currentUser.avatar;
      }
    } catch {
      currentUser = null;
    }
  }

  // Helper to persist users
  const persistUsers = (newUsers: User[]) => {
    localStorage.setItem('capacity_connect_users', JSON.stringify(newUsers));
  };

  // Helper to persist current user
  const persistCurrentUser = (user: User | null) => {
    if (user) {
      localStorage.setItem('capacity_connect_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('capacity_connect_current_user');
    }
  };

  return {
    currentUser,
    users,

    login: async (email: string, password = 'imd@123') => {
      // 1. Try Real Backend API
      if (!USE_MOCKS) {
        try {
          const res = await api.auth.login({ email, password });
          if (res.accessToken) {
            localStorage.setItem('capacity_connect_access_token', res.accessToken);
          }
          if (res.user) {
            const userObj: User = {
              id: res.user.id,
              name: res.user.name,
              email: res.user.email,
              role: res.user.role,
              status: res.user.status === 'approved' ? 'active' : (res.user.status as any),
              office: res.user.office || 'Delhi HQ',
              designation: res.user.designation || 'Meteorologist',
              phone: '+91 98110 12345',
              joinedDate: '2024-01-15',
              skills: [],
              qualifications: ['M.Sc. Meteorology'],
              experienceYears: 6,
              points: 250,
              badges: [],
              languagePreferences: ['English', 'Hindi'],
              availability: {},
            };
            set({ currentUser: userObj });
            persistCurrentUser(userObj);
            return { success: true, user: userObj };
          }
        } catch (err: any) {
          console.warn('[useAuthStore] Backend login failed, evaluating local fallback:', err.message);
          // If error is invalid credentials or pending approval, return it
          if (err.message?.includes('pending') || err.message?.includes('denied')) {
            return { success: false, message: err.message };
          }
        }
      }

      // 2. Demo / Offline Fallback
      const all = get().users;
      const found = all.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!found) {
        return { success: false, message: 'No IMD staff account found with this email.' };
      }

      if (found.status === 'pending') {
        return {
          success: false,
          message: 'Account is pending verification by IMD Training Directorate.'
        };
      }

      if (found.status === 'rejected') {
        return {
          success: false,
          message: 'Account application was not approved. Contact HR Training Cell.'
        };
      }

      set({ currentUser: found });
      persistCurrentUser(found);
      return { success: true, user: found };
    },

    demoLogin: (role: UserRole) => {
      const all = get().users;
      let targetUser = all.find((u) => u.role === role && u.status === 'active');
      if (!targetUser) {
        targetUser = all.find((u) => u.role === role) || all[0];
      }
      set({ currentUser: targetUser });
      persistCurrentUser(targetUser);
      return targetUser;
    },

    signup: async (userData: Partial<User>) => {
      // 1. Try Real Backend
      if (!USE_MOCKS) {
        try {
          const res = await api.auth.signup({
            name: userData.name,
            email: userData.email,
            password: 'imd@123',
            office: userData.office,
            designation: userData.designation,
          });
          const newUser: User = {
            id: res.userId || `usr-reg-${Date.now()}`,
            name: userData.name || 'New Officer',
            email: userData.email || `officer-${Date.now()}@imd.gov.in`,
            role: 'trainee',
            status: 'pending',
            office: userData.office || 'New Delhi HQ',
            designation: userData.designation || 'Scientific Assistant',
            phone: userData.phone || '+91 98110 00000',
            joinedDate: new Date().toISOString().substring(0, 10),
            skills: [{ name: 'General Meteorology', level: 'Beginner', verified: false }],
            qualifications: ['B.Sc. Physics / Mathematics'],
            experienceYears: 1,
            points: 0,
            badges: [],
            languagePreferences: ['English', 'Hindi'],
            availability: {},
          };
          const updatedUsers = [...get().users, newUser];
          set({ users: updatedUsers });
          persistUsers(updatedUsers);
          return { success: true, user: newUser, message: res.message };
        } catch (err: any) {
          console.warn('[useAuthStore] Backend signup failed, falling back:', err.message);
        }
      }

      // 2. Demo Fallback
      const all = get().users;
      const newUser: User = {
        id: `usr-reg-${Date.now()}`,
        name: userData.name || 'New Officer',
        email: userData.email || `officer-${Date.now()}@imd.gov.in`,
        role: userData.role || 'trainee',
        status: 'pending',
        office: userData.office || 'New Delhi HQ',
        designation: userData.designation || 'Scientific Assistant',
        phone: userData.phone || '+91 98110 00000',
        joinedDate: new Date().toISOString().substring(0, 10),
        skills: userData.skills || [{ name: 'General Meteorology', level: 'Beginner', verified: false }],
        qualifications: userData.qualifications || ['B.Sc. Physics / Mathematics'],
        experienceYears: Number(userData.experienceYears) || 1,
        points: 0,
        badges: [],
        languagePreferences: userData.languagePreferences || ['English', 'Hindi'],
        availability: {}
      };

      const updatedUsers = [...all, newUser];
      set({ users: updatedUsers });
      persistUsers(updatedUsers);
      return { success: true, user: newUser };
    },

    logout: () => {
      api.auth.logout().catch(() => {});
      localStorage.removeItem('capacity_connect_access_token');
      set({ currentUser: null });
      persistCurrentUser(null);
    },

    updateProfile: async (data: Partial<User>) => {
      const current = get().currentUser;
      if (!current) return;

      if (!USE_MOCKS) {
        api.users.updateProfile(data).catch(() => {});
      }

      const updated = { ...current, ...data };
      const updatedList = get().users.map((u) => (u.id === current.id ? updated : u));

      set({ currentUser: updated, users: updatedList });
      persistCurrentUser(updated);
      persistUsers(updatedList);
    },

    approveUser: async (userId: string, assignedRole: UserRole) => {
      if (!USE_MOCKS) {
        api.users.approve(userId, assignedRole).catch(() => {});
      }

      const updatedList = get().users.map((u) =>
        u.id === userId ? { ...u, status: 'active' as const, role: assignedRole } : u
      );
      set({ users: updatedList });
      persistUsers(updatedList);
    },

    rejectUser: async (userId: string) => {
      if (!USE_MOCKS) {
        api.users.reject(userId, 'Application criteria not met').catch(() => {});
      }

      const updatedList = get().users.map((u) =>
        u.id === userId ? { ...u, status: 'rejected' as const } : u
      );
      set({ users: updatedList });
      persistUsers(updatedList);
    },

    deleteUser: async (userId: string) => {
      if (!USE_MOCKS) {
        api.users.deleteUser(userId).catch(() => {});
      }

      const updatedList = get().users.filter((u) => u.id !== userId);
      set({ users: updatedList });
      persistUsers(updatedList);
    },

    resetPassword: async (email: string) => {
      if (!USE_MOCKS) {
        try {
          await api.auth.forgotPassword(email);
          return true;
        } catch {
          // fall through
        }
      }
      const found = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      return !!found;
    }
  };
});
