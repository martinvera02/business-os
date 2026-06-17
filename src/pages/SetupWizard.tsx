import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const SECTORS = [
  'Peluquería / Estética',
  'Clínica / Salud',
  'Academia / Formación',
  'Fitness / Deporte',
  'Taller / Reparaciones',
  'Consultoría / Servicios',
  'Otro',
]

const STEPS = ['Tu negocio', 'Sector', 'Primer servicio', '¡Listo!']

export default function SetupWizard() {
  const { user, setBusinessContext } = useAuth() as any
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [sector, setSector] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [servicePrice, setServicePrice] = useState('')
  const [serviceDuration, setServiceDuration] = useState('60')

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  async function handleFinish() {
    setLoading(true)
    setError(null)

    try {
      // DEBUG: imprimir estado real de la sesión antes de nada
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
      console.log('🔍 SESSION:', sessionData.session)
      console.log('🔍 SESSION ERROR:', sessionErr)
      console.log('🔍 USER ID:', sessionData.session?.user?.id)
      console.log('🔍 USER ROLE (from store):', user)

      const currentUser = sessionData.session?.user ?? user
      if (!currentUser) {
        setError('No hay sesión activa. Vuelve a iniciar sesión.')
        setLoading(false)
        navigate('/auth/login')
        return
      }

      const slug = `${slugify(name)}-${Date.now().toString(36)}`

      console.log('🔍 Intentando insert en businesses con:', {
        name: name.trim(), slug, plan: 'free', settings: { sector },
      })

      const { data: business, error: bizError } = await supabase
        .from('businesses')
        .insert({
          name: name.trim(),
          slug,
          plan: 'free' as any,
          settings: { sector },
        } as any)
        .select()
        .single()

      console.log('🔍 RESULTADO business:', business)
      console.log('🔍 ERROR COMPLETO:', JSON.stringify(bizError, null, 2))

      if (bizError || !business) throw bizError ?? new Error('No se pudo crear el negocio')

      const { error: userError } = await supabase
        .from('business_users')
        .insert({
          business_id: (business as any).id,
          user_id: currentUser.id,
          role: 'owner',
        } as any)

      console.log('🔍 ERROR business_users:', JSON.stringify(userError, null, 2))

      if (userError) throw userError

      if (serviceName.trim()) {
        const { error: serviceError } = await supabase.from('services').insert({
          business_id: (business as any).id,
          name: serviceName.trim(),
          duration_min: parseInt(serviceDuration),
          price: Math.round(parseFloat(servicePrice || '0') * 100),
          color: '#1A56DB',
          active: true,
        } as any)
        console.log('🔍 ERROR services:', JSON.stringify(serviceError, null, 2))
      }

      setBusinessContext({ business, role: 'owner' })
      navigate('/dashboard')
    } catch (err: any) {
      console.error('🔍 CATCH FINAL:', err)
      setError(err?.message ?? 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-600">BusinessOS</h1>
          <p className="text-sm text-gray-500 mt-1">Configura tu negocio en 3 pasos</p>
        </div>

        <div className="flex items-center justify-between mb-6 px-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step
                    ? 'bg-brand-500 text-white'
                    : i === step
                    ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-400'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-8 ${i < step ? 'bg-brand-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-body space-y-4">
            {step === 0 && (
              <>
                <h2 className="text-base font-semibold text-gray-900">¿Cómo se llama tu negocio?</h2>
                <input
                  type="text"
                  className="input"
                  placeholder="Peluquería Carmen, Clínica Dental Sur…"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="text-base font-semibold text-gray-900">¿A qué sector pertenece?</h2>
                <div className="grid grid-cols-2 gap-2">
                  {SECTORS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSector(s)}
                      className={`px-3 py-2 rounded text-sm border transition-colors text-left ${
                        sector === s
                          ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-base font-semibold text-gray-900">Añade tu primer servicio</h2>
                <p className="text-xs text-gray-500">Puedes añadir más después. Es opcional.</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del servicio</label>
                    <input type="text" className="input" placeholder="Corte de pelo" value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Precio (€)</label>
                      <input type="number" className="input" placeholder="25" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} min="0" step="0.5" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Duración (min)</label>
                      <input type="number" className="input" value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)} min="15" step="15" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="text-center py-2">
                <div className="text-4xl mb-3">🎉</div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">¡Todo listo!</h2>
                <p className="text-sm text-gray-500">
                  <strong>{name}</strong> está configurado. Haz click en "Ir al panel" para empezar.
                </p>
              </div>
            )}

            {error && <p className="text-xs text-danger">{error}</p>}

            <div className="flex gap-3 pt-2">
              {step > 0 && step < 3 && (
                <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1">
                  Atrás
                </button>
              )}
              {step < 2 && (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="btn-primary flex-1"
                  disabled={step === 0 && !name.trim()}
                >
                  Siguiente
                </button>
              )}
              {step === 2 && (
                <button onClick={() => setStep(3)} className="btn-primary flex-1">
                  {serviceName.trim() ? 'Añadir y continuar' : 'Saltar'}
                </button>
              )}
              {step === 3 && (
                <button onClick={handleFinish} className="btn-primary flex-1" disabled={loading}>
                  {loading ? 'Creando…' : 'Ir al panel →'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}