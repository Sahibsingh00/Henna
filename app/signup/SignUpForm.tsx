'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import GoogleSignIn from '@/components/GoogleSignIn'

export default function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  useEffect(() => {
    setIsFormValid(email.includes('@') && password.length >= 6)
  }, [email, password])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await sendEmailVerification(userCredential.user)
      toast({
        title: "Signup successful",
        description: "Your account has been created. Please check your email to verify your account.",
      })
      router.push('/verify-email')
    } catch (error) {
      console.error("Signup error:", error);
      let errorMessage = "An unknown error occurred during signup.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      if (errorMessage.includes('auth/email-already-in-use')) {
        toast({
          title: "Email already in use",
          description: "This email is already registered. Please use a different email or try logging in.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Signup failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create a new account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !isFormValid}>
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>
          <div className="mt-4">
            <GoogleSignIn />
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={`/login${redirectTo ? `?redirectTo=${redirectTo}` : ''}`} className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}