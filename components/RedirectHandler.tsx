'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth, getRedirectResult } from 'firebase/auth'
import { useToast } from "@/hooks/use-toast"

export default function RedirectHandler() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const auth = getAuth()
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          toast({
            title: "Sign in successful",
            description: "You have been signed in with Google.",
          })
          router.push('/')
        }
      })
      .catch((error) => {
        console.error("Error handling redirect result:", error)
        toast({
          title: "Sign in failed",
          description: "There was an error signing in with Google. Please try again.",
          variant: "destructive",
        })
      })
  }, [router, toast])

  return null
}