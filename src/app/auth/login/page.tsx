"use client"

import { Box, Heading, Text, VStack, Button } from "@chakra-ui/react"
import { Dumbbell } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in:', error)
      alert('Error signing in with Google')
      setLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg="bg" display="flex" alignItems="center" justifyContent="center" p="4">
      <VStack gap="8" maxW="400px" w="full">
        {/* Logo & Branding */}
        <VStack gap="4">
          <Dumbbell size={64} color="#9d174d" strokeWidth={2} />
          <Heading 
            fontFamily="heading" 
            fontSize="4xl" 
            fontWeight="medium"
            color="fg"
            textAlign="center"
          >
            Welcome Back
          </Heading>
          <Text 
            fontSize="md" 
            fontWeight="normal"
            color="fg.muted"
            textAlign="center"
          >
            Sign in to continue
          </Text>
        </VStack>
        
        {/* Sign In Card */}
        <Box
          bg="bg.surface"
          borderRadius="base"
          borderWidth="1px"
          borderColor="border"
          p="8"
          w="full"
        >
          <VStack gap="6">
            <Heading 
              fontFamily="heading" 
              fontSize="xl" 
              fontWeight="medium"
              color="fg"
              textAlign="center"
            >
              Sign in to your account
            </Heading>
            
            <Text 
              fontSize="sm" 
              fontWeight="normal"
              color="fg.muted" 
              textAlign="center"
            >
              Use your Google account to sign in
            </Text>
            
            <Button
              w="full"
              bg="button.primary.bg"
              color="button.primary.text"
              _hover={{ bg: "button.primary.hover" }}
              _active={{ bg: "button.primary.active" }}
              borderRadius="base"
              py="6"
              onClick={handleGoogleSignIn}
              isDisabled={loading}
            >
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>
            
            <Text 
              fontSize="xs" 
              fontWeight="normal"
              color="fg.muted" 
              textAlign="center"
            >
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}
