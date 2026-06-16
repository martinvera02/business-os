import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Magic link — Supabase crea el usuario si no existe
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
        data: { onboarding: true },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
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
            {sent ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-4">🎉</div>
                <h2 className="text-base font-semibold text-gray-900 mb-2">¡Casi listo!</h2>
                <p className="text-sm text-gray-500">
                  Revisa <strong>{email}</strong> y haz click en el enlace para configurar tu negocio.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Crea tu cuenta</h2>
                <p className="text-xs text-gray-500 mb-5">
                  14 días de prueba gratis con todas las funciones.
                </p>

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

                  {error && <p className="text-xs text-danger">{error}</p>}

                  <button type="submit" className="btn-primary w-full" disabled={loading}>
                    {loading ? 'Enviando…' : 'Empezar gratis'}
                  </button>
                </form>

                <p className="text-xs text-gray-400 text-center mt-4">
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/auth/login" className="text-brand-600 hover:underline">
                    Acceder
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
