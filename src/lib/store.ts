// src/lib/store.ts
import { configureStore } from '@reduxjs/toolkit'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { setupListeners } from '@reduxjs/toolkit/query'
import boardReducer from './features/boardSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      board: boardReducer,
      // Add other reducers here
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