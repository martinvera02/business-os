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

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Si signUp ya devuelve una sesión activa (confirm email desactivado), úsala directamente
    let session = signUpData.session

    // Si no, forzamos login y esperamos confirmación real de la sesión
    if (!session) {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (loginError) {
        setError(loginError.message)
        setLoading(false)
        return
      }
      session = loginData.session
    }

    // Verificación final: confirmar que getSession() devuelve la sesión activa
    // antes de navegar, para que auth.uid() esté disponible en el siguiente insert
    let attempts = 0
    let confirmedSession = null
    while (attempts < 10 && !confirmedSession) {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        confirmedSession = data.session
        break
      }
      await new Promise((r) => setTimeout(r, 150))
      attempts++
    }

    if (!confirmedSession) {
      setError('No se pudo iniciar la sesión correctamente. Intenta hacer login manualmente.')
      setLoading(false)
      return
    }

    setLoading(false)
    navigate('/setup')
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