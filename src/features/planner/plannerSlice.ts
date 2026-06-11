import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface RecentSearch {
  originId: string;
  destinationId: string;
  timestamp: number;
}

export interface PlannerState {
  originId: string | null;
  destinationId: string | null;
  recentSearches: RecentSearch[];
  language: 'en' | 'ar';
}

const LOCAL_STORAGE_RECENT_KEY = 'cairo_metro_recent_searches';
const LOCAL_STORAGE_LANG_KEY = 'cairo_metro_language';

// Load initial values from localStorage
const loadRecentSearches = (): RecentSearch[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const loadLanguage = (): 'en' | 'ar' => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LANG_KEY);
    return raw === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
};

const initialState: PlannerState = {
  originId: null,
  destinationId: null,
  recentSearches: loadRecentSearches(),
  language: loadLanguage()
};

export const plannerSlice = createSlice({
  name: 'planner',
  initialState,
  reducers: {
    setOrigin: (state, action: PayloadAction<string | null>) => {
      state.originId = action.payload;
    },
    setDestination: (state, action: PayloadAction<string | null>) => {
      state.destinationId = action.payload;
    },
    swapOriginDestination: (state) => {
      const temp = state.originId;
      state.originId = state.destinationId;
      state.destinationId = temp;
    },
    setLanguage: (state, action: PayloadAction<'en' | 'ar'>) => {
      state.language = action.payload;
      try {
        localStorage.setItem(LOCAL_STORAGE_LANG_KEY, action.payload);
      } catch (e) {
        console.error('Failed to save language to localStorage', e);
      }
    },
    addRecentSearch: (state, action: PayloadAction<{ originId: string; destinationId: string }>) => {
      const { originId, destinationId } = action.payload;
      if (!originId || !destinationId || originId === destinationId) return;

      // Filter out duplicate searches of the same origin/destination pair
      const filtered = state.recentSearches.filter(
        item => !(item.originId === originId && item.destinationId === destinationId)
      );

      const newSearch: RecentSearch = {
        originId,
        destinationId,
        timestamp: Date.now()
      };

      // Limit to 5 searches
      state.recentSearches = [newSearch, ...filtered].slice(0, 5);

      try {
        localStorage.setItem(LOCAL_STORAGE_RECENT_KEY, JSON.stringify(state.recentSearches));
      } catch (e) {
        console.error('Failed to save recent searches to localStorage', e);
      }
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
      try {
        localStorage.removeItem(LOCAL_STORAGE_RECENT_KEY);
      } catch (e) {
        console.error('Failed to remove recent searches from localStorage', e);
      }
    }
  }
});

export const {
  setOrigin,
  setDestination,
  swapOriginDestination,
  setLanguage,
  addRecentSearch,
  clearRecentSearches
} = plannerSlice.actions;

export default plannerSlice.reducer;
