'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { sendEmailVerification } from 'firebase/auth'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyEmail() {
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email)
        if (user.emailVerified) {
          router.push('/')
          toast({
            title: "Email verification successful",
            description: "You have been redirected to the home page.",
          })
        }
      } else {
        // No user is signed in, redirect to login
        router.push('/login')
      }
    })

    // Check email verification status periodically
    const checkVerificationStatus = setInterval(() => {
      auth.currentUser?.reload().then(() => {
        if (auth.currentUser?.emailVerified) {
          clearInterval(checkVerificationStatus)
          router.push('/')
          toast({
            title: "Email verification successful",
            description: "You have been redirected to the home page.",
          })
        }
      })
    }, 5000) // Check every 5 seconds

    // Countdown timer
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1)
      }, 1000)
    }

    return () => {
      unsubscribe()
      clearInterval(checkVerificationStatus)
      if (timer) clearInterval(timer)
    }
  }, [router, toast, countdown])

  const handleResendVerification = async () => {
    setIsLoading(true)
    try {
      const user = auth.currentUser
      if (user) {
        await sendEmailVerification(user)
        toast({
          title: "Verification email sent",
          description: "Please check your email to verify your account.",
        })
        setCountdown(30) // Start 30-second countdown
      } else {
        throw new Error("No user is currently signed in.")
      }
    } catch (error) {
      console.error("Error sending verification email:", error)
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>Please check your email to verify your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {userEmail && (
            <p className="mb-4">We've sent a verification email to: <strong>{userEmail}</strong></p>
          )}
          <p className="mb-4">If you haven&apos;t received the verification email, you can request a new one.</p>
          <Button 
            onClick={handleResendVerification} 
            disabled={isLoading || countdown > 0}
          >
            {isLoading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}