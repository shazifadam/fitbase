"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
} from "@chakra-ui/react"
import { X, Play, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Workout = {
  id: string
  name: string
  description: string
  exercises: any[]
}

type WorkoutSelectionModalProps = {
  clientId: string
  clientName: string
  onSelect: (workoutId: string) => void
  onClose: () => void
}

export default function WorkoutSelectionModal({
  clientId,
  clientName,
  onSelect,
  onClose,
}: WorkoutSelectionModalProps) {
  const supabase = createClient()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkouts()
  }, [clientId])

  const loadWorkouts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: trainer } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!trainer) return

    // Get workouts for this client
    const { data: workoutsData } = await supabase
      .from('workouts')
      .select('*')
      .eq('trainer_id', trainer.id)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (workoutsData) {
      setWorkouts(workoutsData)
      if (workoutsData.length > 0) {
        setSelectedWorkoutId(workoutsData[0].id)
      }
    }

    setLoading(false)
  }

  const handleConfirm = () => {
    if (selectedWorkoutId) {
      onSelect(selectedWorkoutId)
    }
  }

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(0, 0, 0, 0.5)"
      display="flex"
      alignItems="flex-end"
      zIndex="9999"
      onClick={onClose}
    >
      <Box
        bg="bg.surface"
        borderTopRadius="xl"
        w="full"
        maxH="90vh"
        display="flex"
        flexDirection="column"
        onClick={(e) => e.stopPropagation()}
      >
        <HStack justify="space-between" p="4" borderBottomWidth="1px" borderColor="border" flexShrink="0">
          <Heading fontSize="xl" fontWeight="medium" color="fg">
            Select Workout
          </Heading>
          <Box cursor="pointer" onClick={onClose}>
            <X size={24} color="#737373" />
          </Box>
        </HStack>

        <VStack align="stretch" gap="3" p="4" overflowY="auto" flex="1">
          <Text fontSize="sm" color="fg.muted">
            Choose a workout for {clientName}'s session
          </Text>

          {loading ? (
            <Text fontSize="sm" color="fg.muted">Loading workouts...</Text>
          ) : workouts.length === 0 ? (
            <Box bg="bg.muted" borderRadius="base" p="4" textAlign="center">
              <Text fontSize="sm" color="fg.muted">
                No workouts found for this client. Create some workouts first!
              </Text>
            </Box>
          ) : (
            <VStack align="stretch" gap="2">
              {workouts.map((workout) => (
                <Box
                  key={workout.id}
                  bg={selectedWorkoutId === workout.id ? 'primary.subtle' : 'bg.surface'}
                  borderWidth="2px"
                  borderColor={selectedWorkoutId === workout.id ? 'primary.solid' : 'border'}
                  borderRadius="base"
                  p="3"
                  cursor="pointer"
                  onClick={() => setSelectedWorkoutId(workout.id)}
                >
                  <HStack justify="space-between">
                    <VStack align="start" gap="1" flex="1">
                      <Text fontSize="md" fontWeight="medium" color="fg">
                        {workout.name}
                      </Text>
                      <Text fontSize="sm" color="fg.muted">
                        {workout.description}
                      </Text>
                      <Text fontSize="xs" color="fg.muted">
                        {workout.exercises.length} exercises
                      </Text>
                    </VStack>
                    {selectedWorkoutId === workout.id && (
                      <Box bg="primary.solid" borderRadius="full" p="1">
                        <Check size={16} color="white" />
                      </Box>
                    )}
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}

          <Button
            w="full"
            bg="button.primary.bg"
            color="button.primary.text"
            _hover={{ bg: "button.primary.hover" }}
            borderRadius="base"
            h="12"
            fontSize="md"
            fontWeight="medium"
            onClick={handleConfirm}
            isDisabled={!selectedWorkoutId || loading}
            mt="4"
          >
            <HStack gap="2">
              <Play size={20} />
              <Text>Start Session</Text>
            </HStack>
          </Button>
        </VStack>
      </Box>
    </Box>
  )
}
