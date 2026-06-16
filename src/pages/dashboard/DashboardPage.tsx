import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { businessContext, user } = useAuth()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Bienvenido de vuelta 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {businessContext?.business.name} · {user?.email}
        </p>
      </div>

      {/* Stats placeholder */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Citas hoy',        value: '—', color: 'text-brand-600' },
          { label: 'Clientes totales', value: '—', color: 'text-gray-900' },
          { label: 'Contratos mes',    value: '—', color: 'text-gray-900' },
          { label: 'Reputación',       value: '—', color: 'text-success' },
        ].map((stat) => (
          <div key={stat.label} className="card card-body">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-gray-700">Próximas citas</h2>
        </div>
        <div className="card-body">
          <p className="text-sm text-gray-400 text-center py-8">
            Aún no hay citas. Configura tus servicios para empezar a recibir reservas.
          </p>
        </div>
      </div>
    </div>
  )
}
