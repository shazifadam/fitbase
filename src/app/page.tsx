"use client"

import { Box, Heading, Text, VStack, HStack, Badge } from "@chakra-ui/react"
import { Home, Users, BarChart3, Menu, Plus, MoreVertical } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth/login')
      } else {
        setUser(session.user)
        setLoading(false)
      }
    }
    
    checkUser()
  }, [router, supabase.auth])

  if (loading) {
    return (
      <Box minH="100vh" bg="bg" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="lg" color="fg.muted">Loading...</Text>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="bg" pb="24">
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
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Trainer'}
            </Heading>
          </VStack>
          <Box
            bg="neutral.900"
            color="white"
            w="12"
            h="12"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="base"
            fontWeight="medium"
            fontSize="lg"
          >
            {user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'DA'}
          </Box>
        </HStack>
        
        <HStack
          bg="bg"
          borderRadius="base"
          borderWidth="1px"
          borderColor="border"
          p="3"
          justify="space-between"
          cursor="pointer"
        >
          <Text fontSize="md" fontWeight="normal" color="fg">
            Friday, January 30
          </Text>
        </HStack>
      </VStack>
      
      <Box mx="4" mt="4">
        <Box
          bg="neutral.800"
          borderRadius="base"
          p="4"
          color="white"
        >
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="normal">
              Clients for the day
            </Text>
            <Badge 
              bg="white" 
              color="neutral.800" 
              px="3" 
              py="1" 
              borderRadius="sm"
              fontSize="md" 
              fontWeight="medium"
            >
              7 clients
            </Badge>
          </HStack>
        </Box>
      </Box>
      
      <VStack align="stretch" gap="4" px="4" mt="6">
        <Text fontSize="sm" fontWeight="medium" color="fg.muted">
          06:00
        </Text>
        
        <Box bg="bg.surface" borderRadius="base" borderWidth="1px" borderColor="border" p="4">
          <HStack justify="space-between">
            <VStack align="start" gap="1">
              <Text fontFamily="heading" fontSize="lg" fontWeight="medium" color="fg">
                Ahmed Ali
              </Text>
              <Text fontSize="sm" fontWeight="normal" color="fg.muted">
                Strength • Body-Trans
              </Text>
            </VStack>
            <Box cursor="pointer">
              <MoreVertical size={20} color="#737373" />
            </Box>
          </HStack>
      </Box>
      </VStack>

      <HStack position="fixed" bottom="0" left="0" right="0" bg="bg.surface" borderTopWidth="1px" borderColor="border" justify="space-around" py="3" px="2">
        <Link href="/">
          <VStack gap="1" cursor="pointer">
            <Home size={24} color="#0a0a0a" strokeWidth={2} />
            <Text fontSize="xs" fontWeight="normal" color="fg">
              Home
            </Text>
          </VStack>
        </Link>
        
        <Link href="/clients">
          <VStack gap="1" cursor="pointer">
            <Users size={24} color="#737373" strokeWidth={2} />
            <Text fontSize="xs" fontWeight="normal" color="fg.muted">
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
