"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"

export async function createDefaultTiers() {
  const supabase = await createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: trainer } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!trainer) return { error: 'Trainer not found' }

  // Check if tiers already exist
  const { data: existingTiers } = await supabase
    .from('tiers')
    .select('id')
    .eq('trainer_id', trainer.id)
    .limit(1)

  if (existingTiers && existingTiers.length > 0) {
    return { success: true, message: 'Tiers already exist' }
  }

  // Create default tiers
  const { error } = await supabase
    .from('tiers')
    .insert([
      {
        trainer_id: trainer.id,
        name: 'Bronze',
        color: '#CD7F32',
        amount: 1500.00,
        max_concurrent_clients: 4,
        is_default: true,
      },
      {
        trainer_id: trainer.id,
        name: 'Silver',
        color: '#C0C0C0',
        amount: 2500.00,
        max_concurrent_clients: 2,
        is_default: false,
      },
      {
        trainer_id: trainer.id,
        name: 'Gold',
        color: '#FFD700',
        amount: 3500.00,
        max_concurrent_clients: 1,
        is_default: false,
      },
    ])

  if (error) return { error: error.message }
  return { success: true }
}

export async function getTiers() {
  const supabase = await createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: trainer } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!trainer) return { error: 'Trainer not found' }

  const { data, error } = await supabase
    .from('tiers')
    .select('*')
    .eq('trainer_id', trainer.id)
    .order('amount')

  if (error) return { error: error.message }
  return { data }
}
