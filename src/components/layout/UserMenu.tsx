"use client"

import { useState, useRef, useEffect } from "react"
import { Box, VStack, HStack, Text } from "@chakra-ui/react"
import { LogOut, User, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type UserMenuProps = {
  userInitials: string
  userName: string
}

export default function UserMenu({ userInitials, userName }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <Box position="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <Box
        bg="neutral.900"
        color="white"
        w="12"
        h="12"
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="md"
        fontWeight="medium"
        fontSize="lg"
        cursor="pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {userInitials}
      </Box>

      {/* Dropdown Menu */}
      {isOpen && (
        <Box
          position="absolute"
          top="14"
          right="0"
          bg="bg.surface"
          borderRadius="md"
          borderWidth="1px"
          borderColor="border"
          boxShadow="0 10px 40px rgba(0, 0, 0, 0.1)"
          minW="48"
          overflow="hidden"
          zIndex="1000"
        >
          <VStack align="stretch" gap="0">
            {/* User Info */}
            <Box p="4" borderBottomWidth="1px" borderColor="border">
              <Text fontSize="sm" fontWeight="medium" color="fg">
                {userName}
              </Text>
            </Box>

            {/* Account */}
            <HStack
              p="3"
              cursor="pointer"
              _hover={{ bg: "bg.subtle" }}
              onClick={() => {
                setIsOpen(false)
                // Navigate to account page when implemented
              }}
            >
              <User size={18} color="#737373" />
              <Text fontSize="sm" fontWeight="normal" color="fg">
                Account
              </Text>
            </HStack>

            {/* Settings */}
            <HStack
              p="3"
              cursor="pointer"
              _hover={{ bg: "bg.subtle" }}
              onClick={() => {
                setIsOpen(false)
                // Navigate to settings page when implemented
              }}
            >
              <Settings size={18} color="#737373" />
              <Text fontSize="sm" fontWeight="normal" color="fg">
                Settings
              </Text>
            </HStack>

            {/* Sign Out */}
            <HStack
              p="3"
              cursor="pointer"
              borderTopWidth="1px"
              borderColor="border"
              _hover={{ bg: "danger.subtle" }}
              onClick={handleSignOut}
            >
              <LogOut size={18} color="#dc2626" />
              <Text fontSize="sm" fontWeight="normal" color="danger.fg">
                Sign Out
              </Text>
            </HStack>
          </VStack>
        </Box>
      )}
    </Box>
  )
}
