import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '../types'
import { useAuth } from '../app/hooks'
import { ROLE_HOME } from '../features/auth/authSlice'

export function ProtectedRoute({ allow }: { allow: Role[] }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/giris" state={{ from: location.pathname }} replace />
  }
  if (!allow.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role]} replace />
  }
  return <Outlet />
}
