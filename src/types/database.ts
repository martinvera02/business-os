// Tipos generados manualmente para Fase 1
// En el futuro: npx supabase gen types typescript --project-id TU_PROJECT_ID

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type BusinessPlan = 'free' | 'pro' | 'business' | 'agency'
export type UserRole = 'owner' | 'staff' | 'client'
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          name: string
          slug: string
          plan: BusinessPlan
          stripe_customer_id: string | null
          logo_url: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['businesses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>
      }

      business_users: {
        Row: {
          id: string
          business_id: string
          user_id: string
          role: UserRole
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['business_users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['business_users']['Insert']>
      }

      services: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string | null
          duration_min: number
          price: number // en céntimos
          color: string
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['services']['Insert']>
      }

      staff_members: {
        Row: {
          id: string
          business_id: string
          user_id: string | null
          name: string
          avatar_url: string | null
          schedule: Json // { mon: ['09:00','18:00'], tue: [...], ... }
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['staff_members']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['staff_members']['Insert']>
      }

      clients: {
        Row: {
          id: string
          business_id: string
          name: string
          email: string | null
          phone: string | null
          tags: string[]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }

      appointments: {
        Row: {
          id: string
          business_id: string
          client_id: string | null
          staff_id: string | null
          service_id: string
          starts_at: string
          ends_at: string
          status: AppointmentStatus
          notes: string | null
          client_name: string | null   // para reservas sin cuenta
          client_email: string | null
          client_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      business_plan: BusinessPlan
      user_role: UserRole
      appointment_status: AppointmentStatus
    }
  }
}

// Helpers de tipo derivados
export type Business = Database['public']['Tables']['businesses']['Row']
export type BusinessUser = Database['public']['Tables']['business_users']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type StaffMember = Database['public']['Tables']['staff_members']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
