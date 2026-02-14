"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Heading,
} from "@chakra-ui/react"
import { X, Check } from "lucide-react"
import { createClientAction, getClients } from "@/actions/clients"
import { getTiers, createDefaultTiers } from "@/actions/tiers"
import { useRouter } from "next/navigation"

type AddClientFormProps = {
  onClose: () => void
}

const TRAINING_PROGRAMS = [
  'Strength',
  'Body-Trans',
  'Rehab',
  'Athlete',
  'Netbees',
  'Volley',
  'Weight-loss'
]

const DAYS = [
  { value: 'sun', label: 'Sunday' },
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
]

export default function AddClientForm({ onClose }: AddClientFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'details'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tiers, setTiers] = useState<any[]>([])
  const [existingClients, setExistingClients] = useState<any[]>([])

  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [tierId, setTierId] = useState('')
  const [trainingPrograms, setTrainingPrograms] = useState<string[]>([])
  const [scheduleSet, setScheduleSet] = useState<'sunday' | 'saturday' | 'custom'>('sunday')
  const [customDays, setCustomDays] = useState<string[]>([])
  const [sameTimeAllDays, setSameTimeAllDays] = useState(true)
  const [defaultTime, setDefaultTime] = useState('09:00')
  const [dayTimes, setDayTimes] = useState<Record<string, string>>({})

  useEffect(() => {
    loadTiers()
    loadExistingClients()
  }, [])

  const loadTiers = async () => {
    let result = await getTiers()
    
    if (!result.data || result.data.length === 0) {
      await createDefaultTiers()
      result = await getTiers()
    }
    
    if (result.data) {
      setTiers(result.data)
    }
  }

  const loadExistingClients = async () => {
    const result = await getClients(false)
    if (result.data) {
      setExistingClients(result.data)
    }
  }

  const validatePhone = (phoneNumber: string): boolean => {
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '')
    
    // Must be exactly 7 digits
    if (digitsOnly.length !== 7) {
      return false
    }
    
    // First digit should be 7, 9, or 3 (common Maldives mobile prefixes)
    const firstDigit = digitsOnly[0]
    if (!['7', '9', '3'].includes(firstDigit)) {
      return false
    }
    
    return true
  }

  const formatPhone = (value: string): string => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '')
    // Limit to 7 digits
    return digitsOnly.slice(0, 7)
  }

  const checkPhoneExists = (phoneNumber: string): boolean => {
    const fullPhone = `+960${phoneNumber}`
    return existingClients.some(client => client.phone === fullPhone)
  }

  const handlePhoneSubmit = async () => {
    const formattedPhone = formatPhone(phone)
    
    if (!formattedPhone) {
      setError('Phone number is required')
      return
    }

    if (!validatePhone(formattedPhone)) {
      setError('Please enter a valid 7-digit Maldives number (starting with 7, 9, or 3)')
      return
    }

    // Check if phone already exists
    if (checkPhoneExists(formattedPhone)) {
      setError('A client with this phone number already exists')
      return
    }

    setPhone(formattedPhone)
    setStep('details')
    setError('')
  }

  const handleSubmit = async () => {
    if (!name || !phone || trainingPrograms.length === 0) {
      setError('Please fill in all required fields')
      return
    }

    if (scheduleSet === 'custom' && customDays.length === 0) {
      setError('Please select at least one day for custom schedule')
      return
    }

    setLoading(true)
    setError('')

    let sessionTimes: Record<string, string> = {}
    
    if (scheduleSet === 'sunday') {
      sessionTimes = {
        sun: sameTimeAllDays ? defaultTime : (dayTimes.sun || defaultTime),
        tue: sameTimeAllDays ? defaultTime : (dayTimes.tue || defaultTime),
        thu: sameTimeAllDays ? defaultTime : (dayTimes.thu || defaultTime),
      }
    } else if (scheduleSet === 'saturday') {
      sessionTimes = {
        sat: sameTimeAllDays ? defaultTime : (dayTimes.sat || defaultTime),
        mon: sameTimeAllDays ? defaultTime : (dayTimes.mon || defaultTime),
        wed: sameTimeAllDays ? defaultTime : (dayTimes.wed || defaultTime),
      }
    } else {
      customDays.forEach(day => {
        sessionTimes[day] = sameTimeAllDays ? defaultTime : (dayTimes[day] || defaultTime)
      })
    }

    const result = await createClientAction({
      name,
      phone: `+960${phone}`,
      tier_id: tierId || null,
      training_programs: trainingPrograms,
      schedule_set: scheduleSet,
      custom_days: scheduleSet === 'custom' ? customDays : [],
      session_times: sessionTimes,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/clients')
      router.refresh()
    }
  }

  const toggleTrainingProgram = (program: string) => {
    if (trainingPrograms.includes(program)) {
      setTrainingPrograms(trainingPrograms.filter(p => p !== program))
    } else {
      setTrainingPrograms([...trainingPrograms, program])
    }
  }

  const toggleCustomDay = (day: string) => {
    if (customDays.includes(day)) {
      setCustomDays(customDays.filter(d => d !== day))
    } else {
      setCustomDays([...customDays, day])
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
            {step === 'phone' ? 'Add Client' : 'Client Details'}
          </Heading>
          <Box cursor="pointer" onClick={onClose}>
            <X size={24} color="#737373" />
          </Box>
        </HStack>

        <VStack align="stretch" gap="4" p="4" overflowY="auto" flex="1">
          {error && (
            <Box bg="danger.subtle" borderWidth="1px" borderColor="danger.muted" borderRadius="base" p="3">
              <Text fontSize="sm" fontWeight="normal" color="danger.fg">{error}</Text>
            </Box>
          )}

          {step === 'phone' ? (
            <>
              <VStack align="stretch" gap="2">
                <Text fontSize="sm" fontWeight="medium" color="fg">
                  Phone Number *
                </Text>
                <HStack gap="0">
                  <Box
                    bg="bg.muted"
                    borderWidth="1px"
                    borderColor="border"
                    borderRightWidth="0"
                    borderTopLeftRadius="base"
                    borderBottomLeftRadius="base"
                    px="4"
                    h="12"
                    display="flex"
                    alignItems="center"
                  >
                    <Text fontSize="md" fontWeight="normal" color="fg.muted">
                      +960
                    </Text>
                  </Box>
                  <Input
                    type="tel"
                    placeholder="7XXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    bg="input.bg"
                    borderColor="input.border"
                    borderTopLeftRadius="0"
                    borderBottomLeftRadius="0"
                    borderTopRightRadius="base"
                    borderBottomRightRadius="base"
                    _focus={{ borderColor: "input.focusBorder", outline: "none" }}
                    px="4"
                    h="12"
                    fontSize="md"
                    fontWeight="normal"
                    flex="1"
                    maxLength={7}
                  />
                </HStack>
                <Text fontSize="xs" fontWeight="normal" color="fg.muted">
                  Enter 7-digit Maldives mobile number
                </Text>
              </VStack>
            </>
          ) : (
            <>
              <VStack align="stretch" gap="2">
                <Text fontSize="sm" fontWeight="medium" color="fg">
                  Name *
                </Text>
                <Input
                  placeholder="Client name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  bg="input.bg"
                  borderColor="input.border"
                  borderRadius="base"
                  _focus={{ borderColor: "input.focusBorder", outline: "none" }}
                  px="4"
                  h="12"
                  fontSize="md"
                  fontWeight="normal"
                />
              </VStack>

              <VStack align="stretch" gap="2">
                <Text fontSize="sm" fontWeight="medium" color="fg">
                  Tier (Optional)
                </Text>
                <Box
                  as="select"
                  value={tierId}
                  onChange={(e: any) => setTierId(e.target.value)}
                  bg="input.bg"
                  borderColor="input.border"
                  borderWidth="1px"
                  borderRadius="base"
                  h="12"
                  px="4"
                  color="fg"
                  fontSize="md"
                  fontWeight="normal"
                  _focus={{ borderColor: "input.focusBorder", outline: "none" }}
                >
                  <option value="">Select tier (optional)</option>
                  {tiers.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} - MVR {tier.amount}
                    </option>
                  ))}
                </Box>
              </VStack>

              <VStack align="stretch" gap="2">
                <Text fontSize="sm" fontWeight="medium" color="fg">
                  Training Programs *
                </Text>
                <HStack gap="2" flexWrap="wrap">
                  {TRAINING_PROGRAMS.map((program) => (
                    <Box
                      key={program}
                      px="3"
                      py="2"
                      borderRadius="base"
                      borderWidth="1px"
                      borderColor={trainingPrograms.includes(program) ? "primary.solid" : "border"}
                      bg={trainingPrograms.includes(program) ? "primary.muted" : "transparent"}
                      cursor="pointer"
                      onClick={() => toggleTrainingProgram(program)}
                    >
                      <Text fontSize="sm" fontWeight="normal" color={trainingPrograms.includes(program) ? "primary.fg" : "fg"}>
                        {program}
                      </Text>
                    </Box>
                  ))}
                </HStack>
              </VStack>

              <VStack align="stretch" gap="2">
                <Text fontSize="sm" fontWeight="medium" color="fg">
                  Schedule Set *
                </Text>
                <VStack align="stretch" gap="2">
                  <HStack
                    p="3"
                    borderRadius="base"
                    borderWidth="1px"
                    borderColor={scheduleSet === 'sunday' ? "primary.solid" : "border"}
                    bg={scheduleSet === 'sunday' ? "primary.subtle" : "transparent"}
                    cursor="pointer"
                    onClick={() => setScheduleSet('sunday')}
                  >
                    <Text fontSize="sm" fontWeight="normal" color="fg">
                      Sun Set (Sun, Tue, Thu)
                    </Text>
                  </HStack>
                  <HStack
                    p="3"
                    borderRadius="base"
                    borderWidth="1px"
                    borderColor={scheduleSet === 'saturday' ? "primary.solid" : "border"}
                    bg={scheduleSet === 'saturday' ? "primary.subtle" : "transparent"}
                    cursor="pointer"
                    onClick={() => setScheduleSet('saturday')}
                  >
                    <Text fontSize="sm" fontWeight="normal" color="fg">
                      Sat Set (Sat, Mon, Wed)
                    </Text>
                  </HStack>
                  <HStack
                    p="3"
                    borderRadius="base"
                    borderWidth="1px"
                    borderColor={scheduleSet === 'custom' ? "primary.solid" : "border"}
                    bg={scheduleSet === 'custom' ? "primary.subtle" : "transparent"}
                    cursor="pointer"
                    onClick={() => setScheduleSet('custom')}
                  >
                    <Text fontSize="sm" fontWeight="normal" color="fg">
                      Custom Schedule
                    </Text>
                  </HStack>
                </VStack>
              </VStack>

              {scheduleSet === 'custom' && (
                <VStack align="stretch" gap="2">
                  <Text fontSize="sm" fontWeight="medium" color="fg">
                    Select Days
                  </Text>
                  <VStack align="stretch" gap="2">
                    {DAYS.map((day) => (
                      <HStack
                        key={day.value}
                        p="3"
                        borderRadius="base"
                        borderWidth="1px"
                        borderColor={customDays.includes(day.value) ? "primary.solid" : "border"}
                        bg={customDays.includes(day.value) ? "primary.subtle" : "transparent"}
                        cursor="pointer"
                        onClick={() => toggleCustomDay(day.value)}
                        justify="space-between"
                      >
                        <Text fontSize="sm" fontWeight="normal" color="fg">
                          {day.label}
                        </Text>
                        {customDays.includes(day.value) && (
                          <Check size={18} color="#262626" />
                        )}
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              )}

              <VStack align="stretch" gap="2">
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium" color="fg">
                    Session Time *
                  </Text>
                  <HStack
                    px="3"
                    py="1"
                    borderRadius="base"
                    borderWidth="1px"
                    borderColor={sameTimeAllDays ? "primary.solid" : "border"}
                    bg={sameTimeAllDays ? "primary.subtle" : "transparent"}
                    cursor="pointer"
                    onClick={() => setSameTimeAllDays(!sameTimeAllDays)}
                    gap="1"
                  >
                    {sameTimeAllDays && <Check size={14} color="#262626" />}
                    <Text fontSize="xs" fontWeight="normal" color="fg">
                      Same time all days
                    </Text>
                  </HStack>
                </HStack>
                
                {sameTimeAllDays ? (
                  <Input
                    type="time"
                    value={defaultTime}
                    onChange={(e) => setDefaultTime(e.target.value)}
                    bg="input.bg"
                    borderColor="input.border"
                    borderRadius="base"
                    _focus={{ borderColor: "input.focusBorder", outline: "none" }}
                    px="4"
                    h="12"
                    fontSize="md"
                    fontWeight="normal"
                  />
                ) : (
                  <VStack align="stretch" gap="2">
                    {(scheduleSet === 'sunday' ? ['sun', 'tue', 'thu'] :
                      scheduleSet === 'saturday' ? ['sat', 'mon', 'wed'] :
                      customDays).map((day) => (
                      <HStack key={day} gap="3">
                        <Text fontSize="sm" color="fg" minW="24" fontWeight="normal">
                          {DAYS.find(d => d.value === day)?.label}:
                        </Text>
                        <Input
                          type="time"
                          value={dayTimes[day] || defaultTime}
                          onChange={(e) => setDayTimes({ ...dayTimes, [day]: e.target.value })}
                          bg="input.bg"
                          borderColor="input.border"
                          borderRadius="base"
                          _focus={{ borderColor: "input.focusBorder", outline: "none" }}
                          px="4"
                          h="12"
                          fontSize="md"
                          fontWeight="normal"
                        />
                      </HStack>
                    ))}
                  </VStack>
                )}
              </VStack>
            </>
          )}
        </VStack>

        <Box p="4" borderTopWidth="1px" borderColor="border" bg="bg.surface" flexShrink="0">
          <Button
            w="full"
            bg="button.primary.bg"
            color="button.primary.text"
            _hover={{ bg: "button.primary.hover" }}
            borderRadius="base"
            h="12"
            fontSize="md"
            fontWeight="medium"
            onClick={step === 'phone' ? handlePhoneSubmit : handleSubmit}
            isDisabled={loading}
          >
            {loading ? 'Creating...' : step === 'phone' ? 'Continue' : 'Create Client'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
