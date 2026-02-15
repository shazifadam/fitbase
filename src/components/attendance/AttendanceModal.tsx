"use client"

import { useState } from "react"
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
} from "@chakra-ui/react"
import { X, Check, Calendar } from "lucide-react"
import { markAttendance } from "@/actions/attendance"
import WorkoutSelectionModal from "./WorkoutSelectionModal"

type AttendanceModalProps = {
  clientId: string
  clientName: string
  scheduledDate: string
  scheduledTime: string
  currentStatus?: 'scheduled' | 'attending' | 'attended' | 'missed' | 'rescheduled'
  onClose: () => void
}

export default function AttendanceModal({
  clientId,
  clientName,
  scheduledDate,
  scheduledTime,
  currentStatus = 'scheduled',
  onClose,
}: AttendanceModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showWorkoutSelection, setShowWorkoutSelection] = useState(false)

  const normalizeTime = (time: string): string => {
    if (time.length === 5) {
      return `${time}:00`
    }
    return time
  }

  const handleMarkAttendance = async (status: 'scheduled' | 'attending' | 'attended' | 'missed' | 'rescheduled', workoutId?: string) => {
    setLoading(true)
    setError('')

    const normalizedTime = normalizeTime(scheduledTime)

    const result = await markAttendance({
      client_id: clientId,
      scheduled_date: scheduledDate,
      scheduled_time: normalizedTime,
      status,
      workout_id: workoutId,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onClose()
    }
  }

  const handleStartSession = () => {
    setShowWorkoutSelection(true)
  }

  const handleWorkoutSelected = (workoutId: string) => {
    setShowWorkoutSelection(false)
    handleMarkAttendance('attending', workoutId)
  }

  if (showWorkoutSelection) {
    return (
      <WorkoutSelectionModal
        clientId={clientId}
        clientName={clientName}
        onSelect={handleWorkoutSelected}
        onClose={() => setShowWorkoutSelection(false)}
      />
    )
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
            {currentStatus === 'attending' ? 'Complete Session' : 'Mark Attendance'}
          </Heading>
          <Box cursor="pointer" onClick={onClose}>
            <X size={24} color="#737373" />
          </Box>
        </HStack>

        <VStack align="stretch" gap="4" p="4">
          {error && (
            <Box bg="danger.subtle" borderWidth="1px" borderColor="danger.muted" borderRadius="base" p="3">
              <Text fontSize="sm" fontWeight="normal" color="danger.fg">{error}</Text>
            </Box>
          )}

          <VStack align="stretch" gap="2">
            <Text fontSize="lg" fontWeight="medium" color="fg">
              {clientName}
            </Text>
            <HStack gap="2">
              <Calendar size={16} color="#737373" />
              <Text fontSize="sm" fontWeight="normal" color="fg.muted">
                {new Date(scheduledDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })} at {scheduledTime}
              </Text>
            </HStack>
          </VStack>

          <VStack align="stretch" gap="3" mt="4">
            {currentStatus === 'scheduled' && (
              <>
                <Button
                  w="full"
                  bg="button.primary.bg"
                  color="button.primary.text"
                  _hover={{ bg: "button.primary.hover" }}
                  borderRadius="base"
                  h="12"
                  fontSize="md"
                  fontWeight="medium"
                  onClick={handleStartSession}
                  isDisabled={loading}
                >
                  Start Session
                </Button>

                <Button
                  w="full"
                  bg="transparent"
                  color="fab.bg"
                  borderWidth="2px"
                  borderColor="fab.bg"
                  _hover={{ bg: "pink.50" }}
                  borderRadius="base"
                  h="12"
                  fontSize="md"
                  fontWeight="medium"
                  onClick={() => handleMarkAttendance('missed')}
                  isDisabled={loading}
                >
                  Mark as Absent
                </Button>

                <Button
                  w="full"
                  bg="transparent"
                  color="fg"
                  _hover={{ bg: "bg.subtle" }}
                  borderRadius="base"
                  h="12"
                  fontSize="md"
                  fontWeight="medium"
                  onClick={() => {
                    alert('Reschedule functionality coming soon!')
                  }}
                  isDisabled={loading}
                >
                  Reschedule
                </Button>
              </>
            )}

            {currentStatus === 'attending' && (
              <>
                <Button
                  w="full"
                  bg="button.primary.bg"
                  color="button.primary.text"
                  _hover={{ bg: "button.primary.hover" }}
                  borderRadius="base"
                  h="12"
                  fontSize="md"
                  fontWeight="medium"
                  onClick={() => handleMarkAttendance('attended')}
                  isDisabled={loading}
                >
                  <HStack gap="2">
                    <Check size={20} />
                    <Text>Mark as Completed</Text>
                  </HStack>
                </Button>

                <Button
                  w="full"
                  bg="transparent"
                  color="fg"
                  _hover={{ bg: "bg.subtle" }}
                  borderRadius="base"
                  h="12"
                  fontSize="md"
                  fontWeight="medium"
                  onClick={() => handleMarkAttendance('scheduled')}
                  isDisabled={loading}
                >
                  Undo (Back to Scheduled)
                </Button>
              </>
            )}

            {currentStatus === 'attended' && (
              <Button
                w="full"
                bg="button.primary.bg"
                color="button.primary.text"
                _hover={{ bg: "button.primary.hover" }}
                borderRadius="base"
                h="12"
                fontSize="md"
                fontWeight="medium"
                onClick={() => handleMarkAttendance('scheduled')}
                isDisabled={loading}
              >
                Undo (Back to Scheduled)
              </Button>
            )}

            {currentStatus === 'missed' && (
              <Button
                w="full"
                bg="button.primary.bg"
                color="button.primary.text"
                _hover={{ bg: "button.primary.hover" }}
                borderRadius="base"
                h="12"
                fontSize="md"
                fontWeight="medium"
                onClick={() => handleMarkAttendance('scheduled')}
                isDisabled={loading}
              >
                Undo (Back to Scheduled)
              </Button>
            )}

            <Button
              w="full"
              bg="transparent"
              color="fg.muted"
              _hover={{ bg: "bg.subtle" }}
              borderRadius="base"
              h="12"
              fontSize="md"
              fontWeight="normal"
              onClick={onClose}
              isDisabled={loading}
            >
              Cancel
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Box>
  )
}
