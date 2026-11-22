import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Role, SessionUser } from '../../types'

const STORAGE_KEY = 'codevia_auth_v1'

export interface AuthState {
  user: SessionUser | null
  token: string | null
}

function readSession(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { user: null, token: null }
    return JSON.parse(raw) as AuthState
  } catch {
    return { user: null, token: null }
  }
}

const initialState: AuthState = readSession()

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: SessionUser; token: string }>) {
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: state.user, token: state.token }))
    },
    /** Cari sessiya istifadəçisinin sahələrini yeniləyir (məs. profil şəkli) */
    updateSessionUser(state, action: PayloadAction<Partial<SessionUser>>) {
      if (!state.user) return
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: state.user, token: state.token }))
    },
    logout(state) {
      state.user = null
      state.token = null
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})

export const { setCredentials, updateSessionUser, logout } = authSlice.actions
export default authSlice.reducer

export const ROLE_HOME: Record<Role, string> = {
  student: '/panel/telebe',
  teacher: '/panel/muellim',
  admin: '/panel/admin',
}
