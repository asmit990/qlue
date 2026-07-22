import { create } from 'zustand';
import {  type Database } from 'sql.js';

interface DatabaseState {
  db: Database | null;
  tables: string[];
  isLoading: boolean;
  setDatabase: (db: Database, tables: string[]) => void;
  setLoading: (loading: boolean) => void;
  resetDatabase: () => void;
}

export const useDatabaseStore = create<DatabaseState>((set) => ({
  db: null,
  tables: [],
  isLoading: false,

  setDatabase: (db, tables) => set({ db, tables, isLoading: false }),
  
  setLoading: (loading) => set({ isLoading: loading }),

  resetDatabase: () =>
    set((state) => {
      if (state.db) {
        state.db.close();
      }
      return { db: null, tables: [], isLoading: false };
    }),
}));