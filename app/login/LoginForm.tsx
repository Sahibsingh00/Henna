'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import GoogleSignIn from '@/components/GoogleSignIn'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      if (!userCredential.user.emailVerified) {
        toast({
          title: "Email verification Pending",
          description: "Please verify your email before logging in.",
          variant: "destructive",
        })
        router.push('/verify-email')
      } else {
        toast({
          title: "Login successful",
          description: "You have been logged in successfully.",
        })
        if (redirectTo === 'booking') {
          router.push('/book?step=confirm')
        } else {
          router.push('/')
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "Please check your email and password.",
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
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4">
            <GoogleSignIn />
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/reset-password" className="text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href={`/signup${redirectTo ? `?redirectTo=${redirectTo}` : ''}`} className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}