// lib/features/i18nSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SupportedLanguage } from '@/types/i18n.types';

interface I18nState {
  currentLanguage: SupportedLanguage;
  loadedLanguages: SupportedLanguage[];
  isLoading: boolean;
  error: string | null;
}

const initialState: I18nState = {
  currentLanguage: 'en',
  loadedLanguages: ['en'],
  isLoading: false,
  error: null
};

const i18nSlice = createSlice({
  name: 'i18n',
  initialState,
  reducers: {
    setLanguageLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setLanguageSuccess: (state, action: PayloadAction<SupportedLanguage>) => {
      state.currentLanguage = action.payload;
      state.isLoading = false;
      state.error = null;
      // Add to loaded languages if not already there
      if (!state.loadedLanguages.includes(action.payload)) {
        state.loadedLanguages.push(action.payload);
      }
    },
    setLanguageError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearLanguageError: (state) => {
      state.error = null;
    },
    setLoadedLanguages: (state, action: PayloadAction<SupportedLanguage[]>) => {
      state.loadedLanguages = action.payload;
    }
  }
});

export const {
  setLanguageLoading,
  setLanguageSuccess,
  setLanguageError,
  clearLanguageError,
  setLoadedLanguages
} = i18nSlice.actions;

export default i18nSlice.reducer;