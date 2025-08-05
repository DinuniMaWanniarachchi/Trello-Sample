// src/lib/store.ts
import { configureStore } from '@reduxjs/toolkit'
import kanbanReducer from './features/boardSlice'
import i18nReducer from './features/i18nSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      kanban: kanbanReducer,
      i18n: i18nReducer,
      // Add other reducers here (auth, ui, etc.)
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

// Optional: for RTK Query
// setupListeners(makeStore().dispatch)