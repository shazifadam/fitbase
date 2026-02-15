"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function markAttendance(data: {
  client_id: string
  scheduled_date: string
  scheduled_time: string
  status: 'scheduled' | 'attending' | 'attended' | 'missed' | 'rescheduled'
  workout_id?: string
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
    workout_id: data.workout_id || null,
    rescheduled_to: data.rescheduled_to || null,
    reschedule_reason: data.reschedule_reason || null,
  }

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
  revalidatePath(`/clients/${data.client_id}/attendance`)
  revalidatePath('/attending')
  
  return { success: true }
}

export async function updateExerciseWeight(data: {
  attendance_id: string
  exercise_name: string
  weight: number
}) {
  const supabase = await createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get current weights
  const { data: attendance } = await supabase
    .from('attendance')
    .select('current_weights')
    .eq('id', data.attendance_id)
    .single()

  if (!attendance) return { error: 'Attendance record not found' }

  const currentWeights = attendance.current_weights || {}
  currentWeights[data.exercise_name] = data.weight

  // Update weights
  const { error } = await supabase
    .from('attendance')
    .update({ current_weights: currentWeights })
    .eq('id', data.attendance_id)

  if (error) return { error: error.message }

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

export async function getClientMonthlyAttendance(clientId: string, year: number, month: number) {
  const supabase = await createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: trainer } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!trainer) return { error: 'Trainer not found' }

  const { data: client } = await supabase
    .from('clients')
    .select('schedule_set, custom_days, session_times')
    .eq('id', clientId)
    .single()

  if (!client) return { error: 'Client not found' }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const daysInMonth = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`

  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select('*')
    .eq('client_id', clientId)
    .eq('trainer_id', trainer.id)
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate)

  const scheduledDates: any[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const date = new Date(dateStr + 'T12:00:00')
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()

    let isScheduled = false

    if (client.schedule_set === 'sunday' && ['sun', 'tue', 'thu'].includes(dayOfWeek)) {
      isScheduled = true
    } else if (client.schedule_set === 'saturday' && ['sat', 'mon', 'wed'].includes(dayOfWeek)) {
      isScheduled = true
    } else if (client.schedule_set === 'custom' && client.custom_days?.includes(dayOfWeek)) {
      isScheduled = true
    }

    if (isScheduled) {
      const expectedTime = client.session_times?.[dayOfWeek]
      const attendance = attendanceRecords?.find(a => a.scheduled_date === dateStr)
      const sessionTime = attendance ? attendance.scheduled_time.substring(0, 5) : (expectedTime || '09:00')
      const status = attendance?.status || 'scheduled'

      scheduledDates.push({
        date: dateStr,
        day: day,
        dayOfWeek,
        scheduled_time: sessionTime,
        status: status,
        marked_at: attendance?.created_at || null,
      })
    }
  }

  return { data: scheduledDates }
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
    
    let attendance = attendanceRecords?.find(a => {
      const normalizedDbTime = a.scheduled_time.length === 5 ? `${a.scheduled_time}:00` : a.scheduled_time
      return a.client_id === client.id && normalizedDbTime === normalizedSessionTime
    })

    if (!attendance) {
      attendance = attendanceRecords?.find(a => a.client_id === client.id)
    }

    const actualSessionTime = attendance?.scheduled_time.substring(0, 5) || sessionTime

    return {
      client_id: client.id,
      client_name: client.name,
      training_programs: client.training_programs,
      scheduled_time: actualSessionTime,
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

  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select(`
      *,
      client:clients(*),
      workout:workouts(*)
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
    workout: record.workout,
    current_weights: record.current_weights || {},
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
