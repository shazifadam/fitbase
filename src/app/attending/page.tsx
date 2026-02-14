"use client"

import { Box, Heading, Text, VStack, HStack } from "@chakra-ui/react"
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import BottomNav from "@/components/layout/BottomNav"
import { getAttendingClients } from "@/actions/attendance"

export default function AttendingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [attendingClients, setAttendingClients] = useState<any[]>([])
  const [expandedClient, setExpandedClient] = useState<string | null>(null)

  useEffect(() => {
    loadAttendingClients()
  }, [])

  const loadAttendingClients = async () => {
    const result = await getAttendingClients()
    if (result.data) {
      setAttendingClients(result.data)
    }
    setLoading(false)
  }

  // Mock workout data - will be replaced with real data from database
  const mockWorkout = {
    session_title: 'Session 1: Upper Body Strength',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 10 },
      { name: 'Pull-ups', sets: 3, reps: 8 },
      { name: 'Shoulder Press', sets: 3, reps: 12 },
      { name: 'Tricep Dips', sets: 3, reps: 15 },
    ]
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

      {/* Attending Clients List */}
      {attendingClients.length === 0 ? (
        <Box px="4" mt="6" textAlign="center">
          <Text fontSize="md" fontWeight="normal" color="fg.muted">
            No clients currently attending
          </Text>
        </Box>
      ) : (
        <VStack align="stretch" gap="3" px="4" mt="6">
          {attendingClients.map((client) => {
            const isExpanded = expandedClient === client.client_id

            return (
              <Box
                key={client.client_id}
                bg="bg.surface"
                borderRadius="base"
                borderWidth="1px"
                borderColor="border"
              >
                {/* Client Header */}
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

                {/* Expanded Workout Details */}
                {isExpanded && (
                  <VStack align="stretch" gap="2" px="4" pb="4" borderTopWidth="1px" borderColor="border">
                  <Text fontSize="md" fontWeight="medium" color="fg" mt="3">
                      {mockWorkout.session_title}
                    </Text>

                    {mockWorkout.exercises.map((exercise, index) => (
                      <HStack key={index} justify="space-between" py="2">
                        <Text fontSize="sm" fontWeight="normal" color="fg">
                          {exercise.name}
                        </Text>
                        <Text fontSize="sm" fontWeight="normal" color="fg.muted">
                          {exercise.sets} × {exercise.reps}
                        </Text>
                      </HStack>
                    ))}

                    <Text fontSize="xs" fontWeight="normal" color="fg.muted" mt="2">
                      Started at {client.workout_started_at ? new Date(client.workout_started_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                    </Text>
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
