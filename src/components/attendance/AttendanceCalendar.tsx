"use client"

import { Box, HStack, VStack, Text } from "@chakra-ui/react"
import { Check, X as XIcon, Calendar as CalendarIcon } from "lucide-react"

type AttendanceDay = {
  date: string
  day: number
  dayOfWeek: string
  scheduled_time: string
  status: 'scheduled' | 'attending' | 'attended' | 'missed' | 'rescheduled'
  marked_at: string | null
}

type AttendanceCalendarProps = {
  year: number
  month: number
  attendanceDays: AttendanceDay[]
}

export default function AttendanceCalendar({ year, month, attendanceDays }: AttendanceCalendarProps) {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay() // 0 = Sunday

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Create calendar grid
  const calendarDays: (number | null)[] = []
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const getAttendanceForDay = (day: number | null) => {
    if (!day) return null
    return attendanceDays.find(a => a.day === day)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attended':
        return 'success.solid'
      case 'missed':
        return 'danger.solid'
      case 'attending':
        return 'warning.solid'
      case 'rescheduled':
        return 'primary.solid'
      case 'scheduled':
        return 'neutral.300'
      default:
        return 'neutral.300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'attended':
        return <Check size={6} color="white" />
      case 'missed':
        return <XIcon size={6} color="white" />
      case 'attending':
        return <CalendarIcon size={6} color="white" />
      case 'rescheduled':
        return <CalendarIcon size={6} color="white" />
      default:
        return null
    }
  }

  const today = new Date()
  const isToday = (day: number | null) => {
    if (!day) return false
    return today.getDate() === day && 
           today.getMonth() === month - 1 && 
           today.getFullYear() === year
  }

  const isPast = (day: number | null) => {
    if (!day) return false
    const dayDate = new Date(year, month - 1, day)
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return dayDate < todayDate
  }

  // Calculate number of weeks needed
  const totalCells = calendarDays.length
  const weeksNeeded = Math.ceil(totalCells / 7)

  return (
    <VStack align="stretch" gap="2">
      {/* Week day headers */}
      <HStack gap="1">
        {weekDays.map(day => (
          <Box key={day} flex="1" textAlign="center">
            <Text fontSize="xs" fontWeight="medium" color="fg.muted">
              {day}
            </Text>
          </Box>
        ))}
      </HStack>

      {/* Calendar grid */}
      <VStack align="stretch" gap="1">
        {Array.from({ length: weeksNeeded }).map((_, weekIndex) => (
          <HStack key={weekIndex} gap="1">
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const cellIndex = weekIndex * 7 + dayIndex
              const day = calendarDays[cellIndex]
              const attendance = getAttendanceForDay(day)
              const hasAttendance = !!attendance
              const isTodayDate = isToday(day)
              const isPastDate = isPast(day)

              return (
                <Box
                  key={dayIndex}
                  flex="1"
                  minH="50px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="base"
                  bg={day ? (isTodayDate ? 'primary.subtle' : 'bg.surface') : 'transparent'}
                  borderWidth={isTodayDate ? '2px' : '1px'}
                  borderColor={isTodayDate ? 'primary.solid' : (day ? 'border' : 'transparent')}
                  position="relative"
                >
                  {day && (
                    <>
                      <Text 
                        fontSize="sm" 
                        fontWeight={isTodayDate ? 'medium' : 'normal'}
                        color={day ? (isPastDate && !hasAttendance ? 'fg.muted' : 'fg') : 'transparent'}
                      >
                        {day}
                      </Text>
                      
                      {hasAttendance && (
                        <Box
                          position="absolute"
                          bottom="1"
                          right="1"
                          bg={getStatusColor(attendance.status)}
                          borderRadius="full"
                          w="3"
                          h="3"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          {getStatusIcon(attendance.status)}
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              )
            })}
          </HStack>
        ))}
      </VStack>

      {/* Legend */}
      <HStack gap="4" mt="2" flexWrap="wrap">
        <HStack gap="1">
          <Box w="2.5" h="2.5" bg="success.solid" borderRadius="full" />
          <Text fontSize="xs" color="fg.muted">Attended</Text>
        </HStack>
        <HStack gap="1">
          <Box w="2.5" h="2.5" bg="danger.solid" borderRadius="full" />
          <Text fontSize="xs" color="fg.muted">Missed</Text>
        </HStack>
        <HStack gap="1">
          <Box w="2.5" h="2.5" bg="primary.solid" borderRadius="full" />
          <Text fontSize="xs" color="fg.muted">Rescheduled</Text>
        </HStack>
        <HStack gap="1">
          <Box w="2.5" h="2.5" bg="neutral.300" borderRadius="full" />
          <Text fontSize="xs" color="fg.muted">Scheduled</Text>
        </HStack>
      </HStack>
    </VStack>
  )
}
