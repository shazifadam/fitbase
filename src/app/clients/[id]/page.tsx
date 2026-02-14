"use client"

import { Box, Heading, Text, VStack, HStack, Badge } from "@chakra-ui/react"
import { ArrowLeft, MoreVertical, ChevronRight, TrendingDown } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import BottomNav from "@/components/layout/BottomNav"

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      loadClient(params.id as string)
    }
  }, [params.id])

  const loadClient = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data: trainer } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!trainer) return

    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        tier:tiers(*)
      `)
      .eq('id', id)
      .eq('trainer_id', trainer.id)
      .single()

    if (error) {
      console.error('Error loading client:', error)
      router.push('/clients')
      return
    }

    setClient(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="bg" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="lg" color="fg.muted">Loading...</Text>
      </Box>
    )
  }

  if (!client) {
    return null
  }

  // Mock data for demonstration
  const progressStats = {
    height: { value: 175, unit: 'cm', change: null },
    weight: { value: 72.5, unit: 'kg', change: 2.3, isPositive: false },
    bodyFat: { value: 18.2, unit: '%', change: 1.5, isPositive: false },
  }

  const lastRecorded = 'Feb 8, 2026'
  
  // Mock attendance for last 2 weeks (14 days)
  const attendance = [
    { status: 'attended' },
    { status: 'attended' },
    { status: 'missed' },
    { status: 'missed' },
    { status: 'attended' },
    { status: 'attended' },
    { status: 'scheduled' },
    { status: 'scheduled' },
    { status: 'attended' },
    { status: 'scheduled' },
    { status: 'missed' },
    { status: 'attended' },
    { status: 'scheduled' },
    { status: 'scheduled' },
  ]

  const workoutSessions = [
    {
      title: 'Session 1: Upper Body Strength',
      exerciseCount: 4,
      exercises: [
        { name: 'Bench Press', sets: 4, reps: 10 },
        { name: 'Pull-ups', sets: 3, reps: 8 },
        { name: 'Shoulder Press', sets: 3, reps: 12 },
      ],
      moreCount: 1,
    },
    {
      title: 'Session 2: Lower Body Power',
      exerciseCount: 4,
      exercises: [
        { name: 'Squats', sets: 4, reps: 8 },
        { name: 'Deadlifts', sets: 3, reps: 6 },
      ],
      moreCount: 2,
    },
  ]

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
        <HStack justify="space-between">
          <HStack gap="3" cursor="pointer" onClick={() => router.push('/clients')}>
            <ArrowLeft size={20} color="#737373" />
            <Text fontSize="md" fontWeight="normal" color="fg.muted">
              Back to Clients
            </Text>
          </HStack>
          <Box cursor="pointer">
            <MoreVertical size={20} color="#737373" />
          </Box>
        </HStack>

        <HStack justify="space-between" align="start">
          <VStack align="start" gap="2">
            <Heading fontFamily="heading" fontSize="2xl" fontWeight="medium" color="fg">
              {client.name}
            </Heading>
            <Text fontSize="sm" fontWeight="normal" color="fg.muted">
              {client.training_programs.join(' • ')}
            </Text>
            <HStack gap="2">
              <Badge
                bg="tag.strength.bg"
                color="tag.strength.text"
                borderColor="tag.strength.border"
                borderWidth="1px"
                px="2"
                py="0.5"
                fontSize="xs"
                fontWeight="normal"
                borderRadius="base"
              >
                {client.schedule_set === 'sunday' ? 'Sun Set' : client.schedule_set === 'saturday' ? 'Sat Set' : 'Custom'}
              </Badge>
              <Text fontSize="xs" fontWeight="normal" color="fg.muted">
                Last session: 2 days ago
              </Text>
            </HStack>
          </VStack>
        </HStack>
      </VStack>

      {/* Progress Stats */}
      <Box px="4" mt="6">
        <Heading fontSize="lg" fontWeight="medium" color="fg" mb="3">
          Progress Stats
        </Heading>
        
        <HStack gap="3" overflowX="auto">
          <Box
          bg="bg.surface"
            borderRadius="base"
            borderWidth="1px"
            borderColor="border"
            p="4"
            minW="28"
          >
            <Text fontSize="xs" fontWeight="normal" color="fg.muted" mb="2">
              Height
            </Text>
            <Text fontSize="2xl" fontWeight="medium" color="fg">
              {progressStats.height.value}
            </Text>
            <Text fontSize="xs" fontWeight="normal" color="fg.muted">
              {progressStats.height.unit}
            </Text>
          </Box>

          <Box
            bg="bg.surface"
            borderRadius="base"
            borderWidth="1px"
            borderColor="border"
            p="4"
            minW="28"
          >
            <Text fontSize="xs" fontWeight="normal" color="fg.muted" mb="2">
              Weight
            </Text>
            <HStack gap="2" align="baseline">
              <Text fontSize="2xl" fontWeight="medium" color="fg">
                {progressStats.weight.value}
              </Text>
              {progressStats.weight.change && (
                <HStack gap="1">
                  <TrendingDown size={14} color="#22c55e" />
                  <Text fontSize="xs" fontWeight="normal" color="success.fg">
                    {progressStats.weight.change}
                  </Text>
                </HStack>
              )}
            </HStack>
            <Text fontSize="xs" fontWeight="normal" color="fg.muted">
              {progressStats.weight.unit}
            </Text>
          </Box>

          <Box
            bg="bg.surface"
            borderRadius="base"
            borderWidth="1px"
            borderColor="border"
            p="4"
            minW="28"
          >
            <Text fontSize="xs" fontWeight="normal" color="fg.muted" mb="2">
              Body Fat
            </Text>
            <HStack gap="2" align="baseline">
              <Text fontSize="2xl" fontWeight="medium" color="fg">
                {progressStats.bodyFat.value}
              </Text>
              {progressStats.bodyFat.change && (
                <HStack gap="1">
                  <TrendingDown size={14} color="#22c55e" />
                  <Text fontSize="xs" fontWeight="normal" color="success.fg">
                    {progressStats.bodyFat.change}
                  </Text>
                </HStack>
              )}
            </HStack>
            <Text fontSize="xs" fontWeight="normal" color="fg.muted">
              {progressStats.bodyFat.unit}
            </Text>
          </Box>
        </HStack>

        <Text fontSize="xs" fontWeight="normal" color="fg.muted" mt="3" textAlign="center">
          Last recorded: {lastRecorded}
        </Text>
      </Box>

      {/* Last 2 Weeks Attendance */}
      <Box px="4" mt="6">
        <Box
          bg="bg.surface"
          borderRadius="base"
          borderWidth="1px"
          borderColor="border"
          p="4"
        >
          <HStack justify="space-between" mb="4">
            <Text fontSize="md" fontWeight="medium" color="fg">
              Last 2 Weeks Attendance
            </Text>
            <Text fontSize="sm" fontWeight="normal" color="primary.fg" cursor="pointer">
              View Full
            </Text>
          </HStack>

          <VStack align="stretch" gap="3">
            <HStack gap="2" justify="center">
              {attendance.map((day, index) => (
                <Box
                  key={index}
                  w="6"
                  h="6"
                  borderRadius="full"
                  bg={
                    day.status === 'attended' ? 'success.solid' :
                    day.status === 'missed' ? 'danger.solid' :
                    'neutral.200'
                  }
                />
              ))}
            </HStack>

            <HStack gap="4" justify="center">
              <HStack gap="2">
                <Box w="3" h="3" borderRadius="full" bg="success.solid" />
                <Text fontSize="xs" fontWeight="normal" color="fg">
                  Attended
                </Text>
              </HStack>
              <HStack gap="2">
                <Box w="3" h="3" borderRadius="full" bg="danger.solid" />
                <Text fontSize="xs" fontWeight="normal" color="fg">
                  Scheduled
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </Box>
      </Box>

      {/* Workout Routine */}
      <Box px="4" mt="6" mb="4">
        <Heading fontSize="lg" fontWeight="medium" color="fg" mb="3">
          Workout Routine
        </Heading>

        <VStack align="stretch" gap="3">
          {workoutSessions.map((session, index) => (
            <Box
              key={index}
              bg="bg.surface"
              borderRadius="base"
              borderWidth="1px"
              borderColor="border"
              p="4"
            >
              <HStack justify="space-between" mb="3" cursor="pointer">
                <VStack align="start" gap="1">
                  <Text fontSize="md" fontWeight="medium" color="fg">
                    {session.title}
                  </Text>
                  <Text fontSize="xs" fontWeight="normal" color="fg.muted">
                    {session.exerciseCount} exercises
                  </Text>
                </VStack>
                <ChevronRight size={20} color="#737373" />
              </HStack>

              <VStack align="stretch" gap="2">
                {session.exercises.map((exercise, idx) => (
                  <HStack key={idx} justify="space-between">
                    <Text fontSize="sm" fontWeight="normal" color="fg">
                      {exercise.name}
                    </Text>
                    <Text fontSize="sm" fontWeight="normal" color="fg.muted">
                      {exercise.sets} × {exercise.reps}
                    </Text>
                  </HStack>
                ))}
                {session.moreCount > 0 && (
                  <Text fontSize="sm" fontWeight="normal" color="fg.muted">
                    +{session.moreCount} more exercie{session.moreCount > 1 ? 's' : ''}
                  </Text>
                )}
              </VStack>
            </Box>
          ))}
        </VStack>
      </Box>

      <BottomNav />
    </Box>
  )
}
