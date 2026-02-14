"use client"

import { Box, Heading, Text, VStack, HStack, Badge } from "@chakra-ui/react"
import { Check, X as XIcon, Clock, Play } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import BottomNav from "@/components/layout/BottomNav"
import UserMenu from "@/components/layout/UserMenu"
import AttendanceModal from "@/components/attendance/AttendanceModal"

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [todaySchedule, setTodaySchedule] = useState<any[]>([])
  const [selectedSession, setSelectedSession] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/auth/login')
      return
    }

    const { data: dbUser } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!dbUser) {
      await supabase
        .from('users')
        .insert({
          auth_id: session.user.id,
          email: session.user.email || '',
          display_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          photo_url: session.user.user_metadata?.avatar_url || null,
        })
    }

    setUser(session.user)
    await loadTodaySchedule()
    setLoading(false)
  }

  const normalizeTime = (time: string): string => {
    if (time.length === 5) {
      return `${time}:00`
    }
    return time
  }

  const loadTodaySchedule = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data: trainer } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', authUser.id)
      .single()

    if (!trainer) return

    const today = new Date().toISOString().split('T')[0]
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()

    const { data: clients } = await supabase
      .from('clients')
      .select('id, name, training_programs, schedule_set, custom_days, session_times')
      .eq('trainer_id', trainer.id)
      .eq('is_archived', false)

    if (!clients) {
      setTodaySchedule([])
      return
    }

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
      const normalizedSessionTime = normalizeTime(sessionTime)
      
      const attendance = attendanceRecords?.find(a => {
        const normalizedDbTime = normalizeTime(a.scheduled_time)
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
    setTodaySchedule(schedule)
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="bg" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="lg" color="fg.muted">Loading...</Text>
      </Box>
    )
  }

  const userInitials = user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'DA'
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Trainer'

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const scheduledSessions = todaySchedule.filter(s => s.status === 'scheduled')
  const attendingSessions = todaySchedule.filter(s => s.status === 'attending')
  const attendedSessions = todaySchedule.filter(s => s.status === 'attended')
  const missedSessions = todaySchedule.filter(s => s.status === 'missed')

  const attendedCount = attendedSessions.length
  const totalCount = todaySchedule.length

  const groupedScheduled = scheduledSessions.reduce((acc: any, session: any) => {
    if (!acc[session.scheduled_time]) {
      acc[session.scheduled_time] = []
    }
    acc[session.scheduled_time].push(session)
    return acc
  }, {})

  const timeSlots = Object.keys(groupedScheduled).sort()

  const handleCloseModal = async () => {
    setSelectedSession(null)
    await loadTodaySchedule()
  }

  return (
    <Box minH="100vh" bg="bg" pb="32">
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
        <HStack justify="space-between">
          <VStack align="start" gap="1">
            <Text fontSize="sm" fontWeight="normal" color="fg.muted">
              Welcome Back
            </Text>
            <Heading 
              fontFamily="heading" 
              fontSize="2xl" 
              fontWeight="medium"
              color="fg"
            >
              {userName}
            </Heading>
          </VStack>
          <UserMenu userInitials={userInitials} userName={userName} />
        </HStack>
        
        <HStack
          bg="bg"
          borderRadius="base"
          borderWidth="1px"
          borderColor="border"
          p="3"
          justify="space-between"
        >
          <Text fontSize="md" fontWeight="normal" color="fg">
            {today}
          </Text>
        </HStack>
      </VStack>
      
      {/* Attending Card */}
      <Box mx="4" mt="4">
        <Box
          bg="neutral.800"
          borderRadius="base"
          p="4"
          color="white"
          cursor="pointer"
          onClick={() => router.push('/attending')}
        >
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="normal">
              Attending
            </Text>
            <Badge 
              bg="white" 
              color="neutral.800" 
              px="3" 
              py="1" 
              borderRadius="base"
              fontSize="md" 
              fontWeight="medium"
            >
              {attendingSessions.length}
            </Badge>
          </HStack>
        </Box>
      </Box>
      
      {todaySchedule.length === 0 ? (
        <Box px="4" mt="6" textAlign="center">
          <Text fontSize="md" fontWeight="normal" color="fg.muted">
            No sessions scheduled for today
          </Text>
        </Box>
      ) : (
        <VStack align="stretch" gap="0" px="4" mt="6">
          {timeSlots.map((time) => (
            <Box key={time}>
              <Text fontSize="sm" fontWeight="medium" color="fg.muted" mb="3">
                {time}
              </Text>

              {groupedScheduled[time].map((session: any, sessionIndex: number) => (
                <HStack key={`${time}-${sessionIndex}`} align="stretch" gap="0" mb="3">
                  <Box 
                    w="1px" 
                    bg="border" 
                    ml="19px"
                    mr="28px"
                  />

                  <Box flex="1">
                    <Box 
                      bg="bg.surface" 
                      borderRadius="base" 
                      borderWidth="1px" 
                      borderColor="border" 
                      p="4"
                      cursor="pointer"
                      onClick={() => setSelectedSession(session)}
                    >
                      <HStack justify="space-between">
                        <VStack align="start" gap="1" flex="1">
                          <Text fontFamily="heading" fontSize="lg" fontWeight="medium" color="fg">
                            {session.client_name}
                          </Text>
                          <Text fontSize="sm" fontWeight="normal" color="fg.muted">
                            {session.training_programs.join(' • ')}
                          </Text>
                        </VStack>
                        
                        <Box bg="neutral.200" borderRadius="full" p="2">
                          <Clock size={20} color="#737373" />
                        </Box>
                    </HStack>
                    </Box>
                  </Box>
                </HStack>
              ))}
            </Box>
          ))}

          {attendedSessions.length > 0 && (
            <Box mt="8">
              <Heading fontSize="lg" fontWeight="medium" color="fg" mb="4">
                Attended
              </Heading>
              <VStack align="stretch" gap="3">
                {attendedSessions.map((session, index) => (
                  <Box 
                    key={`attended-${index}`}
                    bg="bg.surface" 
                    borderRadius="base" 
                    borderWidth="1px" 
                    borderColor="border" 
                    p="4"
                    cursor="pointer"
                    onClick={() => setSelectedSession(session)}
                  >
                    <HStack justify="space-between" mb="2">
                      <VStack align="start" gap="1" flex="1">
                        <Text fontFamily="heading" fontSize="lg" fontWeight="medium" color="fg">
                          {session.client_name}
                        </Text>
                        <Text fontSize="sm" fontWeight="normal" color="fg.muted">
                          {session.training_programs.join(' • ')}
                        </Text>
                      </VStack>
                      
                      <Box bg="success.solid" borderRadius="full" p="2">
                        <Check size={20} color="white" />
                      </Box>
                    </HStack>
                    <Text fontSize="xs" fontWeight="normal" color="fg.muted">
                      Marked as attended at {session.marked_at ? new Date(session.marked_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}

          {missedSessions.length > 0 && (
            <Box mt="8">
              <Heading fontSize="lg" fontWeight="medium" color="fg" mb="4">
                Absent
              </Heading>
              <VStack align="stretch" gap="3">
                {missedSessions.map((session, index) => (
                  <Box 
                    key={`missed-${index}`}
                    bg="bg.surface" 
                    borderRadius="base" 
                    borderWidth="1px" 
                    borderColor="border" 
                    p="4"
                    cursor="pointer"
                    onClick={() => setSelectedSession(session)}
                  >
                    <HStack justify="space-between" mb="2">
                      <VStack align="start" gap="1" flex="1">
                        <Text fontFamily="heading" fontSize="lg" fontWeight="medium" color="fg">
                          {session.client_name}
                        </Text>
                        <Text fontSize="sm" fontWeight="normal" color="fg.muted">
                          {session.training_programs.join(' • ')}
                      </Text>
                      </VStack>
                      
                      <Box bg="danger.solid" borderRadius="full" p="2">
                        <XIcon size={20} color="white" />
                      </Box>
                    </HStack>
                    <Text fontSize="xs" fontWeight="normal" color="fg.muted">
                      Marked as absent at {session.marked_at ? new Date(session.marked_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      )}

      {selectedSession && (
        <AttendanceModal
          clientId={selectedSession.client_id}
          clientName={selectedSession.client_name}
          scheduledDate={new Date().toISOString().split('T')[0]}
          scheduledTime={selectedSession.scheduled_time}
          currentStatus={selectedSession.status}
          onClose={handleCloseModal}
        />
      )}

      <BottomNav />
    </Box>
  )
}
