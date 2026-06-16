import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { getInitials } from '@/lib/utils'

const navItems = [
  { to: '/dashboard',     label: 'Inicio',     icon: '▦' },
  { to: '/appointments',  label: 'Citas',       icon: '📅' },
  { to: '/clients',       label: 'Clientes',    icon: '👥' },
  { to: '/services',      label: 'Servicios',   icon: '✦' },
  { to: '/contracts',     label: 'Contratos',   icon: '📄' },
  { to: '/reputation',    label: 'Reputación',  icon: '⭐' },
  { to: '/settings',      label: 'Ajustes',     icon: '⚙' },
]

export default function AppLayout() {
  const { user, businessContext } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/auth/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-lg font-bold text-brand-600 tracking-tight">BusinessOS</span>
          {businessContext && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{businessContext.business.name}</p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
            {getInitials(user?.email ?? 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">{user?.email}</p>
            <p className="text-xs text-gray-400 capitalize">{businessContext?.role ?? '—'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-600 text-xs shrink-0"
            title="Cerrar sesión"
          >
            ↩
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
