"use client"

import { Box, Heading, Text, VStack, HStack, Input, Badge } from "@chakra-ui/react"
import { Search, MoreVertical, Home, Users, BarChart3, Menu, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { getClients } from "@/actions/clients"
import Link from "next/link"

type Client = {
  id: string
  name: string
  phone: string
  training_programs: string[]
  schedule_set: string
  session_times: any
  tier: any
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'sunday' | 'saturday' | 'custom'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    filterClients()
  }, [clients, searchQuery, activeTab])

  const loadClients = async () => {
    const result = await getClients(false)
    if (result.data) {
      setClients(result.data as any)
    }
    setLoading(false)
  }

  const filterClients = () => {
    let filtered = clients

    // Filter by tab
    if (activeTab === 'sunday') {
      filtered = filtered.filter(c => c.schedule_set === 'sunday')
    } else if (activeTab === 'saturday') {
      filtered = filtered.filter(c => c.schedule_set === 'saturday')
    } else if (activeTab === 'custom') {
      filtered = filtered.filter(c => c.schedule_set === 'custom')
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredClients(filtered)
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="bg" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="lg" color="fg.muted">Loading...</Text>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="bg" pb="24">
      {/* Header */}
      <VStack align="stretch" gap="4" bg="bg.surface" px="4" pt="6" pb="4" borderBottomWidth="1px" borderColor="border">
        <Heading fontFamily="heading" fontSize="2xl" fontWeight="medium" color="fg">
          Clients
        </Heading>

        {/* Search */}
        <HStack bg="bg" borderRadius="base" borderWidth="1px" borderColor="border" px="3" py="2">
          <Search size={20} color="#737373" />
          <Input
            placeholder="Search clients..."
            border="none"
            bg="transparent"
            _focus={{ outline: 'none', boxShadow: 'none' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </HStack>

        {/* Tabs */}
        <HStack gap="2" overflowX="auto">
          <Box
            px="4"
            py="2"
            borderRadius="base"
            bg={activeTab === 'all' ? 'primary.solid' : 'bg'}
            color={activeTab === 'all' ? 'primary.contrast' : 'fg'}
            cursor="pointer"
            onClick={() => setActiveTab('all')}
          >
            <Text fontSize="sm" fontWeight="normal">All</Text>
          </Box>
          <Box
            px="4"
            py="2"
            borderRadius="base"
            bg={activeTab === 'sunday' ? 'primary.solid' : 'bg'}
            color={activeTab === 'sunday' ? 'primary.contrast' : 'fg'}
            cursor="pointer"
            onClick={() => setActiveTab('sunday')}
            whiteSpace="nowrap"
          >
            <Text fontSize="sm" fontWeight="normal">Sun Set</Text>
          </Box>
          <Box
            px="4"
            py="2"
            borderRadius="base"
            bg={activeTab === 'saturday' ? 'primary.solid' : 'bg'}
            color={activeTab === 'saturday' ? 'primary.contrast' : 'fg'}
            cursor="pointer"
            onClick={() => setActiveTab('saturday')}
            whiteSpace="nowrap"
          >
            <Text fontSize="sm" fontWeight="normal">Sat Set</Text>
          </Box>
          <Box
            px="4"
            py="2"
            borderRadius="base"
            bg={activeTab === 'custom' ? 'primary.solid' : 'bg'}
            color={activeTab === 'custom' ? 'primary.contrast' : 'fg'}
            cursor="pointer"
            onClick={() => setActiveTab('custom')}
          >
            <Text fontSize="sm" fontWeight="normal">Custom</Text>
          </Box>
        </HStack>
      </VStack>

      {/* Client List */}
      <VStack align="stretch" gap="3" px="4" mt="4">
        {filteredClients.length === 0 ? (
          <Box py="12" textAlign="center">
            <Text color="fg.muted" fontWeight="normal">
              {searchQuery ? 'No clients found' : 'No clients yet. Add your first client!'}
            </Text>
          </Box>
        ) : (
          filteredClients.map((client) => (
            <Box
              key={client.id}
              bg="bg.surface"
              borderRadius="base"
              borderWidth="1px"
              borderColor="border"
              p="4"
            >
              <HStack justify="space-between" mb="2">
                <VStack align="start" gap="1">
                  <Text fontFamily="heading" fontSize="lg" fontWeight="medium" color="fg">
                    {client.name}
                  </Text>
                  <Text fontSize="sm" fontWeight="normal" color="fg.muted">
                    {client.training_programs.join(' • ')}
                  </Text>
                </VStack>
                <Box cursor="pointer">
                  <MoreVertical size={20} color="#737373" />
                </Box>
              </HStack>
              
              <HStack gap="2" mt="2">
                <Badge
                  bg="tag.strength.bg"
                  color="tag.strength.text"
                  borderColor="tag.strength.border"
                  borderWidth="1px"
                  px="2"
                  py="0.5"
                  fontSize="xs"
                  fontWeight="normal"
                  borderRadius="sm"
              >
                  {client.schedule_set === 'sunday' ? 'Sun Set' : client.schedule_set === 'saturday' ? 'Sat Set' : 'Custom'}
                </Badge>
                {client.tier && (
                  <Badge
                    bg="neutral.100"
                    color="neutral.900"
                    px="2"
                    py="0.5"
                    fontSize="xs"
                    fontWeight="normal"
                    borderRadius="sm"
                  >
                    {client.tier.name}
                  </Badge>
                )}
              </HStack>
            </Box>
          ))
        )}
      </VStack>

      {/* Bottom Navigation - Fixed */}
      <HStack 
        position="fixed" 
        bottom="0" 
        left="0" 
        right="0" 
        bg="bg.surface" 
        borderTopWidth="1px" 
        borderColor="border"
        justify="space-around"
        py="3"
        px="2"
        zIndex="999"
      >
        <Link href="/">
          <VStack gap="1" cursor="pointer">
            <Home size={24} color="#737373" strokeWidth={2} />
            <Text fontSize="xs" fontWeight="normal" color="fg.muted">
              Home
            </Text>
          </VStack>
        </Link>
        
        <Link href="/clients">
          <VStack gap="1" cursor="pointer">
            <Users size={24} color="#0a0a0a" strokeWidth={2} />
            <Text fontSize="xs" fontWeight="normal" color="fg">
              Clients
            </Text>
          </VStack>
        </Link>
        
        <Box bg="fab.bg" borderRadius="full" p="3" cursor="pointer" position="relative" top="-4" boxShadow="lg">
          <Plus size={24} color="white" strokeWidth={2.5} />
        </Box>
        
        <VStack gap="1" cursor="pointer">
          <BarChart3 size={24} color="#737373" strokeWidth={2} />
          <Text fontSize="xs" fontWeight="normal" color="fg.muted">
            Stats
          </Text>
        </VStack>
        
        <VStack gap="1" cursor="pointer">
          <Menu size={24} color="#737373" strokeWidth={2} />
          <Text fontSize="xs" fontWeight="normal" color="fg.muted">
            More
          </Text>
        </VStack>
      </HStack>
    </Box>
  )
}
