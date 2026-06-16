import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthInit } from '@/hooks/useAuth'

// Layouts y guards
import AppLayout from '@/components/layout/AppLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import SetupGuard from '@/components/auth/SetupGuard'

// Auth
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import CallbackPage from '@/pages/auth/CallbackPage'

// App
import SetupWizard from '@/pages/SetupWizard'
import DashboardPage from '@/pages/dashboard/DashboardPage'

// Placeholders para módulos futuros
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <p className="text-2xl mb-2">🚧</p>
      <p className="text-sm text-gray-500">{title} — próximamente</p>
    </div>
  </div>
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 min
      retry: 1,
    },
  },
})

function AppRoutes() {
  useAuthInit() // Inicializa escucha de auth

  return (
    <Routes>
      {/* Públicas */}
      <Route path="/auth/login"    element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<CallbackPage />} />

      {/* Protegidas */}
      <Route element={<ProtectedRoute />}>
        {/* Setup — si no tiene negocio */}
        <Route path="/setup" element={<SetupWizard />} />

        {/* App principal — requiere negocio creado */}
        <Route element={<SetupGuard />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"    element={<DashboardPage />} />
            <Route path="/appointments" element={<PlaceholderPage title="Citas" />} />
            <Route path="/clients"      element={<PlaceholderPage title="Clientes" />} />
            <Route path="/services"     element={<PlaceholderPage title="Servicios" />} />
            <Route path="/contracts"    element={<PlaceholderPage title="Contratos" />} />
            <Route path="/reputation"   element={<PlaceholderPage title="Reputación" />} />
            <Route path="/settings"     element={<PlaceholderPage title="Ajustes" />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
