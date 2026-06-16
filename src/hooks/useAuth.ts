import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useAuthInit() {
  const { setUser, setSession, setBusinessContext, setLoading, reset } = useAuthStore()

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadBusinessContext(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (event === 'SIGNED_IN' && session?.user) {
        await loadBusinessContext(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        reset()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadBusinessContext(userId: string) {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('business_users')
        .select('role, businesses(*)')
        .eq('user_id', userId)
        .single()

      if (data && data.businesses) {
        setBusinessContext({
          business: data.businesses as any,
          role: data.role as any,
        })
      }
    } catch {
      // El usuario no tiene negocio aún → irá al SetupWizard
    } finally {
      setLoading(false)
    }
  }
}
