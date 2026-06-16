import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/** Si el usuario autenticado no tiene negocio asociado, lo manda al SetupWizard */
export default function SetupGuard() {
  const { businessContext, isLoading } = useAuth()

  if (isLoading) return null

  if (!businessContext) {
    return <Navigate to="/setup" replace />
  }

  return <Outlet />
}
