"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function markAttendance(data: {
  client_id: string
  scheduled_date: string
  scheduled_time: string
  status: 'scheduled' | 'attending' | 'attended' | 'missed' | 'rescheduled'
  rescheduled_to?: string
  reschedule_reason?: string
}) {
  const supabase = await createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: trainer } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!trainer) return { error: 'Trainer not found' }

  const { data: existing, error: existingError } = await supabase
    .from('attendance')
    .select('id, status')
    .eq('client_id', data.client_id)
    .eq('scheduled_date', data.scheduled_date)
    .eq('scheduled_time', data.scheduled_time)
    .maybeSingle()

  const updateData: any = {
    status: data.status,
    rescheduled_to: data.rescheduled_to || null,
    reschedule_reason: data.reschedule_reason || null,
  }

  // Set workout_started_at when marking as attending
  if (data.status === 'attending') {
    updateData.workout_started_at = new Date().toISOString()
  }

  if (existing) {
    const { error } = await supabase
      .from('attendance')
      .update(updateData)
      .eq('id', existing.id)

    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('attendance')
      .insert({
        trainer_id: trainer.id,
        client_id: data.client_id,
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time,
        ...updateData,
      })

    if (error) return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/clients')
  revalidatePath(`/clients/${data.client_id}`)
  revalidatePath('/attending')
  
  return { success: true }
}

export async function getClientAttendance(clientId: string, limit?: number) {
  const supabase = await createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: trainer } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!trainer) return { error: 'Trainer not found' }

  let query = supabase
    .from('attendance')
    .select('*')
    .eq('client_id', clientId)
    .eq('trainer_id', trainer.id)
    .order('scheduled_date', { ascending: false })
    .order('scheduled_time', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) return { error: error.message }
  return { data }
}

export async function getTodaySchedule() {
  const supabase = await createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: trainer } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!trainer) return { error: 'Trainer not found' }

  const today = new Date().toISOString().split('T')[0]
  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()

  const { data: clients } = await supabase
    .from('clients')
    .select(`
      id,
      name,
      training_programs,
      schedule_set,
      custom_days,
      session_times
    `)
    .eq('trainer_id', trainer.id)
    .eq('is_archived', false)

  if (!clients) return { data: [] }

  const todayClients = clients.filter(client => {
    if (client.schedule_set === 'sunday' && ['sun', 'tue', 'thu'].includes(dayOfWeek)) {
      return true
    }
    if (client.schedule_set === 'saturday' && ['sat', 'mon', 'wed'].includes(dayOfWeek)) {
      return true
    }
    if (client.schedule_set === 'custom' && client.custom_days?.includes(dayOfWeek)) {
      return true
    }
    return false
  })

  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select('*')
    .eq('trainer_id', trainer.id)
    .eq('scheduled_date', today)

  const schedule = todayClients.map(client => {
    const sessionTime = client.session_times?.[dayOfWeek] || '09:00'
    const normalizedSessionTime = sessionTime.length === 5 ? `${sessionTime}:00` : sessionTime
    
    const attendance = attendanceRecords?.find(a => {
      const normalizedDbTime = a.scheduled_time.length === 5 ? `${a.scheduled_time}:00` : a.scheduled_time
      return a.client_id === client.id && normalizedDbTime === normalizedSessionTime
    })

    return {
      client_id: client.id,
      client_name: client.name,
      training_programs: client.training_programs,
      scheduled_time: sessionTime,
      status: attendance?.status || 'scheduled',
      attendance_id: attendance?.id || null,
      marked_at: attendance?.created_at || null,
      workout_started_at: attendance?.workout_started_at || null,
    }
  })

  schedule.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))

  return { data: schedule }
}

export async function getAttendingClients() {
  const supabase = await createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: trainer } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!trainer) return { error: 'Trainer not found' }

  const today = new Date().toISOString().split('T')[0]

  // Get all attending clients for today
  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select(`
      *,
      client:clients(*)
    `)
    .eq('trainer_id', trainer.id)
    .eq('scheduled_date', today)
    .eq('status', 'attending')

  if (!attendanceRecords) return { data: [] }

  const attendingClients = attendanceRecords.map(record => ({
    client_id: record.client_id,
    client_name: record.client?.name,
    training_programs: record.client?.training_programs,
    scheduled_time: record.scheduled_time,
    workout_started_at: record.workout_started_at,
    attendance_id: record.id,
  }))

  return { data: attendingClients }
}

export async function getUpcomingSchedule(days: number = 7) {
  const supabase = await createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: trainer } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!trainer) return { error: 'Trainer not found' }

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('trainer_id', trainer.id)
    .eq('is_archived', false)

  if (!clients) return { data: [] }

  const schedule: any[] = []
  const today = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()

    clients.forEach(client => {
      let isScheduled = false

      if (client.schedule_set === 'sunday' && ['sun', 'tue', 'thu'].includes(dayOfWeek)) {
        isScheduled = true
      } else if (client.schedule_set === 'saturday' && ['sat', 'mon', 'wed'].includes(dayOfWeek)) {
        isScheduled = true
      } else if (client.schedule_set === 'custom' && client.custom_days?.includes(dayOfWeek)) {
        isScheduled = true
      }

      if (isScheduled) {
        const sessionTime = client.session_times?.[dayOfWeek] || '09:00'
        schedule.push({
          date: dateStr,
          client_id: client.id,
          client_name: client.name,
          scheduled_time: sessionTime,
        })
      }
    })
  }

  return { data: schedule }
}
