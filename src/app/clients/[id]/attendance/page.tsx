"use client"

import { Box, Heading, Text, VStack, HStack, Button, Input } from "@chakra-ui/react"
import { ArrowLeft, ChevronLeft, ChevronRight, Filter, X } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import BottomNav from "@/components/layout/BottomNav"
import AttendanceCalendar from "@/components/attendance/AttendanceCalendar"
import { getClientMonthlyAttendance } from "@/actions/attendance"

export default function ClientAttendancePage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [clientName, setClientName] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [showFilter, setShowFilter] = useState(false)
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [isFiltering, setIsFiltering] = useState(false)

  useEffect(() => {
    loadClientInfo()
  }, [clientId])

  useEffect(() => {
    if (!isFiltering) {
      loadAttendanceData()
    }
  }, [clientId, currentDate, isFiltering])

  const loadClientInfo = async () => {
    const { data } = await supabase
      .from('clients')
      .select('name')
      .eq('id', clientId)
      .single()

    if (data) {
      setClientName(data.name)
    }
  }

  const loadAttendanceData = async () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1

    const result = await getClientMonthlyAttendance(clientId, year, month)
    
    if (result.data) {
      setAttendanceData(result.data)
    }
    setLoading(false)
  }

  const handleApplyFilter = () => {
    if (!filterStartDate || !filterEndDate) {
      alert('Please select both start and end dates')
      return
    }

    const filtered = attendanceData.filter(day => {
      return day.date >= filterStartDate && day.date <= filterEndDate
    })

    setFilteredData(filtered)
    setIsFiltering(true)
    setShowFilter(false)
  }

  const handleClearFilter = () => {
    setIsFiltering(false)
    setFilteredData([])
    setFilterStartDate('')
    setFilterEndDate('')
  }

  const goToPreviousMonth = () => {
    if (!isFiltering) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    }
  }

  const goToNextMonth = () => {
    if (!isFiltering) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    }
  }

  const goToToday = () => {
    if (!isFiltering) {
      setCurrentDate(new Date())
    }
  }

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const displayData = isFiltering ? filteredData : attendanceData
  const attendedCount = displayData.filter(d => d.status === 'attended').length
  const missedCount = displayData.filter(d => d.status === 'missed').length
  const totalScheduled = displayData.length

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
        <HStack justify="space-between">
          <HStack gap="3" cursor="pointer" onClick={() => router.push(`/clients/${clientId}`)}>
            <ArrowLeft size={20} color="#737373" />
            <Text fontSize="md" fontWeight="normal" color="fg.muted">
              Back to {clientName}
            </Text>
          </HStack>

          <Box cursor="pointer" onClick={() => setShowFilter(!showFilter)}>
            <Filter size={20} color="#737373" />
          </Box>
        </HStack>

        <Heading fontFamily="heading" fontSize="2xl" fontWeight="medium" color="fg">
          Attendance History
        </Heading>
      </VStack>

      {showFilter && (
        <Box bg="bg.surface" borderBottomWidth="1px" borderColor="border" p="4">
          <VStack align="stretch" gap="3">
            <Text fontSize="sm" fontWeight="medium" color="fg">
              Filter by Date Range
            </Text>
            
            <HStack gap="2">
              <VStack align="stretch" gap="1" flex="1">
                <Text fontSize="xs" color="fg.muted">Start Date</Text>
                <Input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  bg="input.bg"
                  borderColor="input.border"
                  borderRadius="base"
                  h="10"
                  fontSize="sm"
                />
              </VStack>

              <VStack align="stretch" gap="1" flex="1">
                <Text fontSize="xs" color="fg.muted">End Date</Text>
                <Input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  bg="input.bg"
                  borderColor="input.border"
                  borderRadius="base"
                  h="10"
                  fontSize="sm"
                />
              </VStack>
            </HStack>

            <HStack gap="2">
              <Button
                flex="1"
                bg="button.primary.bg"
                color="button.primary.text"
                _hover={{ bg: "button.primary.hover" }}
                borderRadius="base"
                h="10"
                fontSize="sm"
                onClick={handleApplyFilter}
              >
                Apply Filter
              </Button>
              <Button
                variant="ghost"
                borderRadius="base"
                h="10"
                fontSize="sm"
                onClick={() => setShowFilter(false)}
              >
                Cancel
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}

      {isFiltering && (
        <Box px="4" mt="4">
          <HStack
            bg="primary.subtle"
            borderRadius="base"
            p="3"
            justify="space-between"
          >
            <Text fontSize="sm" color="primary.fg">
              Filtered: {new Date(filterStartDate).toLocaleDateString()} - {new Date(filterEndDate).toLocaleDateString()}
            </Text>
            <Box cursor="pointer" onClick={handleClearFilter}>
              <X size={16} color="#262626" />
            </Box>
          </HStack>
        </Box>
      )}

      {!isFiltering && (
        <HStack justify="space-between" px="4" mt="6">
          <Button
            variant="ghost"
            onClick={goToPreviousMonth}
            p="2"
            minW="auto"
          >
            <ChevronLeft size={20} />
          </Button>

          <VStack gap="1">
            <Text fontSize="lg" fontWeight="medium" color="fg">
              {monthName}
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              fontSize="xs"
            >
              Today
            </Button>
          </VStack>

          <Button
            variant="ghost"
            onClick={goToNextMonth}
            p="2"
            minW="auto"
          >
            <ChevronRight size={20} />
          </Button>
        </HStack>
      )}

      {isFiltering && (
        <Box px="4" mt="6" textAlign="center">
          <Text fontSize="lg" fontWeight="medium" color="fg">
            Filtered Results
          </Text>
        </Box>
      )}

      <HStack gap="3" px="4" mt="4">
        <Box flex="1" bg="bg.surface" borderRadius="base" borderWidth="1px" borderColor="border" p="3">
          <Text fontSize="xs" color="fg.muted" mb="1">Attended</Text>
          <Text fontSize="2xl" fontWeight="medium" color="success.solid">{attendedCount}</Text>
        </Box>
        <Box flex="1" bg="bg.surface" borderRadius="base" borderWidth="1px" borderColor="border" p="3">
          <Text fontSize="xs" color="fg.muted" mb="1">Missed</Text>
          <Text fontSize="2xl" fontWeight="medium" color="danger.solid">{missedCount}</Text>
        </Box>
        <Box flex="1" bg="bg.surface" borderRadius="base" borderWidth="1px" borderColor="border" p="3">
          <Text fontSize="xs" color="fg.muted" mb="1">Total</Text>
          <Text fontSize="2xl" fontWeight="medium" color="fg">{totalScheduled}</Text>
        </Box>
      </HStack>

      <Box px="4" mt="6">
        {isFiltering ? (
          <VStack align="stretch" gap="2">
            {displayData.length === 0 ? (
              <Text fontSize="sm" color="fg.muted" textAlign="center">
                No sessions found in the selected date range
              </Text>
            ) : (
              displayData.map((day, index) => (
                <HStack
                  key={index}
                  bg="bg.surface"
                  borderRadius="base"
                  borderWidth="1px"
                  borderColor="border"
                  p="3"
                  justify="space-between"
                >
                  <VStack align="start" gap="0">
                    <Text fontSize="sm" fontWeight="medium" color="fg">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      {day.scheduled_time}
                    </Text>
                  </VStack>
                  <Box
                    bg={
                      day.status === 'attended' ? 'success.solid' :
                      day.status === 'missed' ? 'danger.solid' :
                      day.status === 'rescheduled' ? 'primary.solid' :
                      'neutral.300'
                    }
                    borderRadius="base"
                    px="3"
                    py="1"
                  >
                    <Text fontSize="xs" fontWeight="medium" color="white">
                      {day.status.charAt(0).toUpperCase() + day.status.slice(1)}
                    </Text>
                  </Box>
                </HStack>
              ))
            )}
          </VStack>
        ) : (
          <AttendanceCalendar
            year={currentDate.getFullYear()}
            month={currentDate.getMonth() + 1}
            attendanceDays={attendanceData}
          />
        )}
      </Box>

      <BottomNav />
    </Box>
  )
}
