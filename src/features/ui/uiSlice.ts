import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
}

export interface UiState {
  sidebarOpen: boolean
  toasts: Toast[]
  authModalOpen: boolean
  authModalRole: 'student' | 'teacher' | 'admin'
  theme: 'dark' | 'light'
}

const THEME_KEY = 'codevia_theme_v1'

function initialTheme(): 'dark' | 'light' {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* yox say */
  }
  return 'dark'
}

const initialState: UiState = {
  sidebarOpen: false,
  toasts: [],
  authModalOpen: false,
  authModalRole: 'student',
  theme: initialTheme(),
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state, action: PayloadAction<boolean | undefined>) {
      state.sidebarOpen = action.payload ?? !state.sidebarOpen
    },
    pushToast(state, action: PayloadAction<Omit<Toast, 'id'>>) {
      state.toasts.push({ ...action.payload, id: `${Date.now()}${Math.random()}` })
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
    setTheme(state, action: PayloadAction<'dark' | 'light'>) {
      state.theme = action.payload
      try {
        localStorage.setItem(THEME_KEY, action.payload)
      } catch {
        /* yox say */
      }
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(THEME_KEY, state.theme)
      } catch {
        /* yox say */
      }
    },
    openAuthModal(state, action: PayloadAction<UiState['authModalRole'] | undefined>) {
      state.authModalRole = action.payload ?? 'student'
      state.authModalOpen = true
    },
    closeAuthModal(state) {
      state.authModalOpen = false
    },
  },
})

export const {
  toggleSidebar,
  pushToast,
  dismissToast,
  setTheme,
  toggleTheme,
  openAuthModal,
  closeAuthModal,
} = uiSlice.actions
export default uiSlice.reducer
