import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { AppDispatch, RootState } from './store'

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

/** Cari istifadəçi və rol üçün qısa köməkçi */
export function useAuth() {
  const { user, token } = useAppSelector((s) => s.auth)
  return {
    user,
    token,
    isAuthenticated: Boolean(user),
    isStudent: user?.role === 'student',
    isTeacher: user?.role === 'teacher',
    isAdmin: user?.role === 'admin',
  }
}
