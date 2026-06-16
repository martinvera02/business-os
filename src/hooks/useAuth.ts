import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useAuthInit() {
  const { setUser, setSession, setBusinessContext, setLoading, reset } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadBusinessContext(session.user.id)
      } else {
        setLoading(false)
      }
    })

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

      if (data) {
        const business = (data as any).businesses
        const role = (data as any).role
        if (business) {
          setBusinessContext({ business, role })
        }
      }
    } catch {
      // Sin negocio → irá al SetupWizard
    } finally {
      setLoading(false)
    }
  }
}

export function useAuth() {
  return useAuthStore()
}