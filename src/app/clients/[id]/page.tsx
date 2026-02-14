"use client"

import { Box, Heading, Text, VStack, HStack, Badge, Button } from "@chakra-ui/react"
import { ArrowLeft, Check, X as XIcon, Calendar } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import BottomNav from "@/components/layout/BottomNav"

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<any>(null)
  const [twoWeekAttendance, setTwoWeekAttendance] = useState<any[]>([])

  useEffect(() => {
    loadClientData()
  }, [clientId])

  const loadClientData = async () => {
    // Get client info
    const { data: clientData } = await supabase
      .from('clients')
      .select('*, tier:tiers(*)')
      .eq('id', clientId)
      .single()

    if (clientData) {
      setClient(clientData)
      await loadTwoWeekAttendance(clientData)
    }

    setLoading(false)
  }

  const loadTwoWeekAttendance = async (clientData: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: trainer } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!trainer) return

    // Get dates for 2 weeks (past week + current week)
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday of current week
    
    const startDate = new Date(startOfWeek)
    startDate.setDate(startOfWeek.getDate() - 7) // Go back one more week

    const endDate = new Date(startOfWeek)
    endDate.setDate(startOfWeek.getDate() + 6) // Saturday of current week

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    // Get attendance records for the 2 weeks
    const { data: attendanceRecords } = await supabase
      .from('attendance')
      .select('*')
      .eq('client_id', clientId)
      .eq('trainer_id', trainer.id)
      .gte('scheduled_date', startDateStr)
      .lte('scheduled_date', endDateStr)

    // Generate all scheduled dates for the 2 weeks
    const scheduledDates: any[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()

      let isScheduled = false

      if (clientData.schedule_set === 'sunday' && ['sun', 'tue', 'thu'].includes(dayOfWeek)) {
        isScheduled = true
      } else if (clientData.schedule_set === 'saturday' && ['sat', 'mon', 'wed'].includes(dayOfWeek)) {
        isScheduled = true
      } else if (clientData.schedule_set === 'custom' && clientData.custom_days?.includes(dayOfWeek)) {
        isScheduled = true
      }

      if (isScheduled) {
        const sessionTime = clientData.session_times?.[dayOfWeek] || '09:00'
        const normalizedSessionTime = sessionTime.length === 5 ? `${sessionTime}:00` : sessionTime

        const attendance = attendanceRecords?.find(a => {
          const normalizedDbTime = a.scheduled_time.length === 5 ? `${a.scheduled_time}:00` : a.scheduled_time
          return a.scheduled_date === dateStr && normalizedDbTime === normalizedSessionTime
        })

        scheduledDates.push({
          date: dateStr,
          dayOfWeek,
          dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNumber: currentDate.getDate(),
          monthName: currentDate.toLocaleDateString('en-US', { month: 'short' }),
          scheduled_time: sessionTime,
          status: attendance?.status || 'scheduled',
          isPast: currentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        })
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    setTwoWeekAttendance(scheduledDates)
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="bg" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="lg" color="fg.muted">Loading...</Text>
      </Box>
    )
  }

  if (!client) {
    return (
      <Box minH="100vh" bg="bg" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="lg" color="fg.muted">Client not found</Text>
      </Box>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attended':
        return 'success.solid'
      case 'missed':
        return 'danger.solid'
      case 'attending':
        return 'warning.solid'
      case 'scheduled':
        return 'neutral.200'
      default:
        return 'neutral.200'
    }
  }

  const totalScheduled = twoWeekAttendance.length
  const attendedCount = twoWeekAttendance.filter(d => d.status === 'attended').length
  const attendanceRate = totalScheduled > 0 ? Math.round((attendedCount / totalScheduled) * 100) : 0

  return (
    <Box minH="100vh" bg="bg" pb="32">
      {/* Header */}
      <VStack 
        align="stretch" 
        gap="4" 
        bg="bg.surface" 
        px="4" 
        pt="6" 
        pb="4" 
        borderBottomWidth="1px" 
        borderColor="border"
      >
        <HStack gap="3" cursor="pointer" onClick={() => router.push('/clients')}>
          <ArrowLeft size={20} color="#737373" />
          <Text fontSize="md" fontWeight="normal" color="fg.muted">
            Back to Clients
          </Text>
        </HStack>

        <VStack align="start" gap="2">
          <Heading fontFamily="heading" fontSize="2xl" fontWeight="medium" color="fg">
            {client.name}
          </Heading>
          <Text fontSize="sm" fontWeight="normal" color="fg.muted">
            {client.phone}
          </Text>
          {client.tier && (
            <Badge 
              bg="primary.muted" 
              color="primary.fg" 
              px="3" 
              py="1" 
              borderRadius="base"
              fontSize="sm"
            >
              {client.tier.name} - MVR {client.tier.amount}
            </Badge>
          )}
        </VStack>
      </VStack>

      {/* Stats */}
      <VStack align="stretch" gap="4" px="4" mt="6">
        <HStack gap="3">
          <Box flex="1" bg="bg.surface" borderRadius="base" borderWidth="1px" borderColor="border" p="4">
            <Text fontSize="xs" color="fg.muted" mb="1">Attendance Rate</Text>
            <Text fontSize="2xl" fontWeight="medium" color="fg">{attendanceRate}%</Text>
          </Box>
          <Box flex="1" bg="bg.surface" borderRadius="base" borderWidth="1px" borderColor="border" p="4">
            <Text fontSize="xs" color="fg.muted" mb="1">Sessions</Text>
            <Text fontSize="2xl" fontWeight="medium" color="fg">{attendedCount}/{totalScheduled}</Text>
          </Box>
        </HStack>
      </VStack>

      {/* 2-Week Attendance */}
      <VStack align="stretch" gap="3" px="4" mt="6">
        <HStack justify="space-between">
          <Heading fontSize="lg" fontWeight="medium" color="fg">
            Recent Attendance
          </Heading>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/clients/${clientId}/attendance`)}
            color="primary.fg"
          >
            View Full
          </Button>
        </HStack>

        {twoWeekAttendance.length === 0 ? (
          <Text fontSize="sm" color="fg.muted">No scheduled sessions in the past 2 weeks</Text>
        ) : (
          <HStack gap="2" overflowX="auto" pb="2">
            {twoWeekAttendance.map((day, index) => (
              <VStack
                key={index}
                minW="60px"
                bg="bg.surface"
                borderRadius="base"
                borderWidth="1px"
                borderColor="border"
                p="2"
                gap="1"
                opacity={day.isPast && day.status === 'scheduled' ? 0.5 : 1}
              >
                <Text fontSize="xs" color="fg.muted">
                  {day.dayName}
                </Text>
                <Text fontSize="lg" fontWeight="medium" color="fg">
                  {day.dayNumber}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {day.monthName}
                </Text>
                
                <Box
                  mt="1"
                  bg={getStatusColor(day.status)}
                  borderRadius="full"
                  p="1.5"
                >
                  {day.status === 'attended' && <Check size={12} color="white" />}
                  {day.status === 'missed' && <XIcon size={12} color="white" />}
                  {day.status === 'scheduled' && <Calendar size={12} color="#737373" />}
                </Box>
              </VStack>
            ))}
          </HStack>
        )}
      </VStack>

      {/* Training Programs */}
      <VStack align="stretch" gap="3" px="4" mt="6">
        <Heading fontSize="lg" fontWeight="medium" color="fg">
          Training Programs
        </Heading>
        <HStack gap="2" flexWrap="wrap">
          {client.training_programs.map((program: string, index: number) => (
            <Badge 
              key={index}
              bg="bg.subtle" 
              color="fg" 
              px="3" 
              py="2" 
              borderRadius="base"
              fontSize="sm"
              borderWidth="1px"
              borderColor="border"
            >
              {program}
            </Badge>
          ))}
        </HStack>
      </VStack>

      {/* Schedule Info */}
      <VStack align="stretch" gap="3" px="4" mt="6">
        <Heading fontSize="lg" fontWeight="medium" color="fg">
          Schedule
        </Heading>
        <Box bg="bg.surface" borderRadius="base" borderWidth="1px" borderColor="border" p="4">
          <VStack align="start" gap="2">
            <Text fontSize="sm" fontWeight="normal" color="fg">
              <Text as="span" fontWeight="medium">Schedule Set:</Text>{' '}
              {client.schedule_set === 'sunday' && 'Sun Set (Sun, Tue, Thu)'}
              {client.schedule_set === 'saturday' && 'Sat Set (Sat, Mon, Wed)'}
              {client.schedule_set === 'custom' && `Custom (${client.custom_days?.join(', ')})`}
            </Text>
            
            {client.session_times && (
              <VStack align="start" gap="1" mt="2">
                <Text fontSize="xs" fontWeight="medium" color="fg.muted">Session Times:</Text>
                {Object.entries(client.session_times).map(([day, time]: [string, any]) => (
                  <Text key={day} fontSize="sm" color="fg">
                    {day.charAt(0).toUpperCase() + day.slice(1)}: {time}
                  </Text>
                ))}
              </VStack>
            )}
          </VStack>
        </Box>
      </VStack>

      <BottomNav />
    </Box>
  )
}
