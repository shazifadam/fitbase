"use client"

import { Box, HStack, VStack, Text } from "@chakra-ui/react"
import { Home, Users, Plus, BarChart3, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <Box
      position="fixed"
      bottom="4"
      left="4"
      right="4"
      zIndex="999"
    >
      <HStack
        bg="bg.surface"
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="base"
        justify="space-around"
        py="3"
        px="2"
        boxShadow="0 10px 40px rgba(0, 0, 0, 0.1)"
      >
        {/* Home */}
        <Link href="/">
          <VStack gap="1" cursor="pointer" minW="16">
            <Home 
              size={24} 
              color={isActive('/') ? "#0a0a0a" : "#737373"} 
              strokeWidth={2} 
            />
            <Text 
              fontSize="2xs" 
              fontWeight="normal" 
              color={isActive('/') ? "fg" : "fg.muted"}
            >
              Home
            </Text>
          </VStack>
        </Link>
        
        {/* Clients */}
        <Link href="/clients">
          <VStack gap="1" cursor="pointer" minW="16">
            <Users 
              size={24} 
              color={isActive('/clients') && !pathname.includes('/add') ? "#0a0a0a" : "#737373"} 
              strokeWidth={2} 
            />
            <Text 
              fontSize="2xs" 
              fontWeight="normal" 
              color={isActive('/clients') && !pathname.includes('/add') ? "fg" : "fg.muted"}
            >
              Clients
            </Text>
          </VStack>
        </Link>
        
        {/* FAB - Add (contained within navbar) */}
        <Link href="/clients/add">
          <VStack gap="1" cursor="pointer" minW="16">
            <Box 
              bg="fab.bg" 
              borderRadius="base"
              p="3" 
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Plus size={24} color="white" strokeWidth={2.5} />
            </Box>
          </VStack>
        </Link>
        
        {/* Stats */}
        <VStack gap="1" cursor="pointer" opacity="0.5" minW="16">
          <BarChart3 size={24} color="#737373" strokeWidth={2} />
          <Text fontSize="2xs" fontWeight="normal" color="fg.muted">
            Stats
          </Text>
        </VStack>
        
        {/* More */}
        <Link href="/more">
          <VStack gap="1" cursor="pointer" minW="16">
            <Menu 
              size={24} 
              color={isActive('/more') ? "#0a0a0a" : "#737373"} 
              strokeWidth={2} 
            />
            <Text 
              fontSize="2xs" 
              fontWeight="normal" 
              color={isActive('/more') ? "fg" : "fg.muted"}
            >
              More
            </Text>
          </VStack>
        </Link>
      </HStack>
    </Box>
  )
}
