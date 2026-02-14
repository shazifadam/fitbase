"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createClientAction(data: {
  name: string
  phone: string
  tier_id: string | null
  training_programs: string[]
  schedule_set: 'sunday' | 'saturday' | 'custom'
  custom_days?: string[]
  session_times: Record<string, string>
}) {
  const supabase = await createSupabaseClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  // Get trainer record
  const { data: trainer, error: trainerError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (trainerError || !trainer) {
    return { error: 'Trainer not found' }
  }

  // Check if phone already exists
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('trainer_id', trainer.id)
    .eq('phone', data.phone)
    .single()

  if (existingClient) {
    return { error: 'Client with this phone number already exists' }
  }

  // Create client
  const { data: newClient, error: createError } = await supabase
    .from('clients')
    .insert({
      trainer_id: trainer.id,
      name: data.name,
      phone: data.phone,
      tier_id: data.tier_id,
      training_programs: data.training_programs,
      schedule_set: data.schedule_set,
      custom_days: data.custom_days || [],
      session_times: data.session_times,
    })
    .select()
    .single()

  if (createError) {
    return { error: createError.message }
  }

  revalidatePath('/clients')
  return { data: newClient }
}

export async function getClients(archived = false) {
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
    .from('clients')
    .select(`
      *,
      tier:tiers(*)
    `)
    .eq('trainer_id', trainer.id)
    .eq('is_archived', archived)
    .order('name')

  if (error) return { error: error.message }
  return { data }
}

export async function archiveClient(clientId: string) {
  const supabase = await createSupabaseClient()
  
  const { error } = await supabase
    .from('clients')
    .update({ 
      is_archived: true,
      archived_at: new Date().toISOString()
    })
    .eq('id', clientId)

  if (error) return { error: error.message }
  
  revalidatePath('/clients')
  return { success: true }
}

export async function unarchiveClient(clientId: string) {
  const supabase = await createSupabaseClient()
  
  const { error } = await supabase
    .from('clients')
    .update({ 
      is_archived: false,
      archived_at: null
    })
    .eq('id', clientId)

  if (error) return { error: error.message }
  
  revalidatePath('/clients')
  return { success: true }
}

export async function deleteClient(clientId: string) {
  const supabase = await createSupabaseClient()
  
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)

  if (error) return { error: error.message }
  
  revalidatePath('/clients')
  return { success: true }
}
