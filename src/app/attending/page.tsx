"use client"

import { Box, Heading, Text, VStack, HStack, Button, Input } from "@chakra-ui/react"
import { ArrowLeft, ChevronDown, ChevronUp, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import BottomNav from "@/components/layout/BottomNav"
import { getAttendingClients, markAttendance, updateExerciseWeight } from "@/actions/attendance"

export default function AttendingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [attendingClients, setAttendingClients] = useState<any[]>([])
  const [expandedClient, setExpandedClient] = useState<string | null>(null)
  const [completingClient, setCompletingClient] = useState<string | null>(null)
  const [weights, setWeights] = useState<{[key: string]: {[exerciseName: string]: string}}>({})

  useEffect(() => {
    loadAttendingClients()
  }, [])

  const loadAttendingClients = async () => {
    const result = await getAttendingClients()
    if (result.data) {
      setAttendingClients(result.data)
      
      // Initialize weights from current_weights
      const initialWeights: {[key: string]: {[exerciseName: string]: string}} = {}
      result.data.forEach((client: any) => {
        initialWeights[client.client_id] = client.current_weights || {}
      })
      setWeights(initialWeights)
    }
    setLoading(false)
  }

  const handleWeightChange = async (clientId: string, attendanceId: string, exerciseName: string, value: string) => {
    // Update local state
    setWeights(prev => ({
      ...prev,
      [clientId]: {
        ...prev[clientId],
        [exerciseName]: value
      }
    }))

    // Debounce update to database
    const numericValue = parseFloat(value)
    if (!isNaN(numericValue) && numericValue > 0) {
      await updateExerciseWeight({
        attendance_id: attendanceId,
        exercise_name: exerciseName,
        weight: numericValue,
      })
    }
  }

  const handleMarkAttended = async (client: any) => {
    setCompletingClient(client.client_id)

    const today = new Date().toISOString().split('T')[0]
    const normalizedTime = client.scheduled_time.length === 5 ? `${client.scheduled_time}:00` : client.scheduled_time

    const result = await markAttendance({
      client_id: client.client_id,
      scheduled_date: today,
      scheduled_time: normalizedTime,
      status: 'attended',
    })

    if (result.success) {
      setAttendingClients(prev => prev.filter(c => c.client_id !== client.client_id))
      setExpandedClient(null)
    }

    setCompletingClient(null)
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="bg" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="lg" color="fg.muted">Loading...</Text>
      </Box>
    )
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
        <HStack gap="3" cursor="pointer" onClick={() => router.push('/')}>
          <ArrowLeft size={20} color="#737373" />
          <Text fontSize="md" fontWeight="normal" color="fg.muted">
            Back to Home
          </Text>
        </HStack>

        <Heading fontFamily="heading" fontSize="2xl" fontWeight="medium" color="fg">
          Attending ({attendingClients.length})
        </Heading>
      </VStack>

      {attendingClients.length === 0 ? (
        <Box px="4" mt="6" textAlign="center">
          <Text fontSize="md" fontWeight="normal" color="fg.muted">
            No clients currently attending
          </Text>
          <Text fontSize="sm" fontWeight="normal" color="fg.muted" mt="2">
            Start a session from the home page
          </Text>
        </Box>
      ) : (
        <VStack align="stretch" gap="3" px="4" mt="6">
          {attendingClients.map((client) => {
            const isExpanded = expandedClient === client.client_id
            const isCompleting = completingClient === client.client_id
            const workout = client.workout
            const clientWeights = weights[client.client_id] || {}

            return (
              <Box
                key={client.client_id}
                bg="bg.surface"
                borderRadius="base"
                borderWidth="1px"
                borderColor="border"
              >
                <HStack
                  justify="space-between"
                  p="4"
                  cursor="pointer"
                  onClick={() => setExpandedClient(isExpanded ? null : client.client_id)}
                >
                  <VStack align="start" gap="1" flex="1">
                    <Text fontFamily="heading" fontSize="lg" fontWeight="medium" color="fg">
                      {client.client_name}
                    </Text>
                    <Text fontSize="sm" fontWeight="normal" color="fg.muted">
                      {client.training_programs?.join(' • ')}
                    </Text>
                  </VStack>

                  {isExpanded ? (
                    <ChevronUp size={20} color="#737373" />
                  ) : (
                    <ChevronDown size={20} color="#737373" />
                  )}
                </HStack>

                {isExpanded && (
                  <VStack align="stretch" gap="3" px="4" pb="4" borderTopWidth="1px" borderColor="border">
                    {workout ? (
                      <>
                        <Text fontSize="md" fontWeight="medium" color="fg" mt="3">
                          {workout.name}
                        </Text>
                        <Text fontSize="sm" fontWeight="normal" color="fg.muted">
                          {workout.description}
                        </Text>

                        {workout.exercises && Array.isArray(workout.exercises) && workout.exercises.length > 0 && (
                          <VStack align="stretch" gap="2" mt="2">
                            {/* Header */}
                            <HStack justify="space-between" py="1" borderBottomWidth="1px" borderColor="border">
                              <Text fontSize="xs" fontWeight="medium" color="fg.muted" flex="2">
                                Exercise
                              </Text>
                              <Text fontSize="xs" fontWeight="medium" color="fg.muted" w="60px" textAlign="center">
                                Sets × Reps
                              </Text>
                              <Text fontSize="xs" fontWeight="medium" color="fg.muted" w="80px" textAlign="center">
                                Weight (kg)
                              </Text>
                            </HStack>

                            {/* Exercises */}
                            {workout.exercises.map((exercise: any, index: number) => (
                              <HStack key={index} justify="space-between" py="2" align="center">
                                <Text fontSize="sm" fontWeight="normal" color="fg" flex="2">
                                  {exercise.name}
                                </Text>
                                <Text fontSize="sm" fontWeight="normal" color="fg.muted" w="60px" textAlign="center">
                                  {exercise.sets} × {exercise.reps}
                                </Text>
                                <Input
                                  type="number"
                                  w="80px"
                                  h="8"
                                  textAlign="center"
                                  fontSize="sm"
                                  value={clientWeights[exercise.name] || ''}
                                  onChange={(e) => handleWeightChange(
                                    client.client_id,
                                    client.attendance_id,
                                    exercise.name,
                                    e.target.value
                                  )}
                                  placeholder="0"
                                  bg="input.bg"
                                  borderColor="input.border"
                                  borderRadius="base"
                                />
                              </HStack>
                            ))}
                          </VStack>
                        )}
                      </>
                    ) : (
                      <Text fontSize="sm" fontWeight="normal" color="fg.muted" mt="3">
                        No workout selected for this session
                      </Text>
                    )}

                    <Text fontSize="xs" fontWeight="normal" color="fg.muted" mt="2">
                      Started at {client.workout_started_at ? new Date(client.workout_started_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                    </Text>

                    <Button
                      w="full"
                      bg="button.primary.bg"
                      color="button.primary.text"
                      _hover={{ bg: "button.primary.hover" }}
                      borderRadius="base"
                      h="12"
                      fontSize="md"
                      fontWeight="medium"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkAttended(client)
                      }}
                      isDisabled={isCompleting}
                      mt="2"
                    >
                      <HStack gap="2">
                        <Check size={20} />
                        <Text>{isCompleting ? 'Completing...' : 'Mark as Completed'}</Text>
                      </HStack>
                    </Button>
                  </VStack>
                )}
              </Box>
            )
          })}
        </VStack>
      )}

      <BottomNav />
    </Box>
  )
}