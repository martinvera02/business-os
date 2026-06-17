import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    // Igual que en Beer League: signUp directo, sin confirmación de email.
    // Si "Confirm email" está desactivado en Supabase, signUp ya devuelve sesión activa.
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      // Sesión activa inmediatamente → directo al wizard
      navigate('/setup')
    } else {
      // Por si el proyecto tuviera confirmación activada
      setError('Revisa tu email para confirmar la cuenta antes de continuar.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-600">BusinessOS</h1>
          <p className="text-sm text-gray-500 mt-1">Empieza gratis, sin tarjeta</p>
        </div>

        <div className="card">
          <div className="card-body">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Crea tu cuenta</h2>
            <p className="text-xs text-gray-500 mb-5">14 días de prueba gratis con todas las funciones.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="tu@negocio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Repite la contraseña"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-xs text-danger">{error}</p>}

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Creando cuenta…' : 'Empezar gratis'}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-4">
              ¿Ya tienes cuenta?{' '}
              <Link to="/auth/login" className="text-brand-600 hover:underline">
                Acceder
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}