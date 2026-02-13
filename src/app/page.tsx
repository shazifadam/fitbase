"use client"

import { Box, Heading, Text, VStack, HStack, Badge } from "@chakra-ui/react"
import { MoreVertical } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import BottomNav from "@/components/layout/BottomNav"
import UserMenu from "@/components/layout/UserMenu"

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
        return
      }

      // Ensure user record exists in database
      const { data: dbUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', session.user.id)
        .single()

      if (!dbUser) {
        // Create user record if it doesn't exist
        await supabase
          .from('users')
          .insert({
            auth_id: session.user.id,
            email: session.user.email || '',
            display_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            photo_url: session.user.user_metadata?.avatar_url || null,
          })
      }

      setUser(session.user)
      setLoading(false)
    }
    
    checkUser()
  }, [router, supabase])

  if (loading) {
    return (
      <Box minH="100vh" bg="bg" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="lg" color="fg.muted">Loading...</Text>
      </Box>
    )
  }

  const userInitials = user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'DA'
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Trainer'

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
              {userName}
            </Heading>
          </VStack>
          <UserMenu userInitials={userInitials} userName={userName} />
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
            <Text fontSize="md" fontWeight="normal">
              Clients for the day
            </Text>
            <Badge 
              bg="white" 
              color="neutral.800" 
              px="3" 
              py="3" 
              borderRadius="base"
              fontSize="md" 
              fontWeight="normal"
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

      <BottomNav />
    </Box>
  )
}
