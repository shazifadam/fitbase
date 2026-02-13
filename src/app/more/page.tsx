"use client"

import { Box, Heading, Text, VStack, HStack, Button } from "@chakra-ui/react"
import { LogOut, User, Settings, HelpCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import BottomNav from "@/components/layout/BottomNav"

export default function MorePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/auth/login')
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
        <Heading fontFamily="heading" fontSize="2xl" fontWeight="medium" color="fg">
          More
        </Heading>
      </VStack>

      {/* Menu Items */}
      <VStack align="stretch" gap="0" px="4" mt="4">
        <Box
          bg="bg.surface"
          borderRadius="md"
          borderWidth="1px"
          borderColor="border"
          overflow="hidden"
        >
          {/* Account */}
          <HStack
            p="4"
            cursor="pointer"
            borderBottomWidth="1px"
            borderColor="border"
            _hover={{ bg: "bg.subtle" }}
          >
            <User size={20} color="#737373" />
            <Text fontSize="md" fontWeight="normal" color="fg" flex="1">
              Account
            </Text>
          </HStack>

          {/* Settings */}
          <HStack
            p="4"
            cursor="pointer"
            borderBottomWidth="1px"
            borderColor="border"
            _hover={{ bg: "bg.subtle" }}
          >
            <Settings size={20} color="#737373" />
            <Text fontSize="md" fontWeight="normal" color="fg" flex="1">
              Settings
            </Text>
          </HStack>

          {/* Help */}
          <HStack
            p="4"
            cursor="pointer"
            _hover={{ bg: "bg.subtle" }}
          >
            <HelpCircle size={20} color="#737373" />
            <Text fontSize="md" fontWeight="normal" color="fg" flex="1">
              Help & Support
            </Text>
          </HStack>
        </Box>
      </VStack>

      {/* Sign Out Button */}
      <Box px="4" mt="6">
        <Button
          w="full"
          bg="danger.solid"
          color="danger.contrast"
          _hover={{ bg: "danger.emphasized" }}
          borderRadius="base"
          h="12"
          fontSize="md"
          fontWeight="medium"
          onClick={handleSignOut}
          isDisabled={loading}
        >
          <HStack gap="2">
            <LogOut size={20} />
            <Text>{loading ? 'Signing out...' : 'Sign Out'}</Text>
          </HStack>
        </Button>
      </Box>

      <BottomNav />
    </Box>
  )
}
