"use client"

import { Box, Heading, Text, VStack, HStack, Badge } from "@chakra-ui/react"
import { Dumbbell, Users, TrendingUp } from "lucide-react"

export default function Home() {
  return (
    <Box minH="100vh" bg="bg" display="flex" alignItems="center" justifyContent="center" p="4">
      <VStack gap="8" maxW="600px" w="full">
        {/* Logo & Title */}
        <VStack gap="4">
          <Dumbbell size={64} color="#9d174d" strokeWidth={2} />
          <Heading 
            fontFamily="heading" 
            fontSize="4xl" 
            fontWeight="medium"  // 500 - Medium
            color="fg"
            textAlign="center"
          >
            Fitbase
          </Heading>
          <Text 
            fontSize="lg" 
            fontWeight="normal"  // 400 - Regular
            color="fg.muted"
            textAlign="center"
          >
            Personal Trainer Client Management
          </Text>
        </VStack>

        {/* Feature Cards */}
        <VStack gap="3" w="full">
          <Box
            bg="bg.surface"
            borderWidth="1px"
            borderColor="border"
            borderRadius="md"
            p="4"
            w="full"
          >
            <HStack gap="3">
              <Box bg="primary.solid" p="2" borderRadius="base">
                <Users size={20} color="white" />
              </Box>
              <VStack align="start" gap="0">
                <Text fontWeight="medium" color="fg">  {/* Medium */}
                  Client Management
                </Text>
                <Text fontSize="sm" fontWeight="normal" color="fg.muted">  {/* Regular */}
                  Track attendance & progress
                </Text>
              </VStack>
            </HStack>
          </Box>

          <Box
            bg="bg.surface"
            borderWidth="1px"
            borderColor="border"
            borderRadius="md"
            p="4"
            w="full"
          >
            <HStack gap="3">
              <Box bg="success.solid" p="2" borderRadius="base">
                <TrendingUp size={20} color="white" />
              </Box>
              <VStack align="start" gap="0">
                <Text fontWeight="medium" color="fg">  {/* Medium */}
                  Analytics Dashboard
                </Text>
                <Text fontSize="sm" fontWeight="normal" color="fg.muted">  {/* Regular */}
                  Monitor your business growth
                </Text>
              </VStack>
            </HStack>
          </Box>
        </VStack>

        {/* Status Badge */}
        <HStack gap="2">
          <Badge 
            bg="primary.solid" 
            color="primary.contrast"
            px="4"
            py="2"
            borderRadius="md"
            fontWeight="medium"  // Medium
          >
            Coming Soon
          </Badge>
          <Badge 
            bg="bg.surface"
            borderWidth="1px"
            borderColor="border"
            color="fg.muted"
            px="4"
            py="2"
            borderRadius="md"
            fontWeight="normal"  // Regular
          >
            Version 1.0
          </Badge>
        </HStack>

        {/* Typography Demo */}
        <Box 
          bg="bg.surface" 
          borderWidth="1px" 
          borderColor="border" 
          borderRadius="md" 
          p="6" 
          w="full"
        >
          <VStack align="start" gap="3">
            <Heading fontSize="2xl" fontWeight="medium" color="fg">
              Font Weights Demo
            </Heading>
            <Text fontSize="md" fontWeight="normal" color="fg.muted">
              Body text uses Inter Regular (400) for optimal readability
            </Text>
            <Text fontSize="md" fontWeight="medium" color="fg">
              Emphasized text uses Inter Medium (500) for headers
            </Text>
            <HStack gap="2">
              <Text fontSize="sm" fontWeight="normal" color="fg.subtle">
                Regular
              </Text>
              <Text fontSize="sm" fontWeight="medium" color="fg">
                Medium
              </Text>
              <Text fontSize="sm" fontWeight="semibold" color="fg">
                Semibold
              </Text>
              <Text fontSize="sm" fontWeight="bold" color="fg">
                Bold
              </Text>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}
