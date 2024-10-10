'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  isEmailVerified: boolean
  isGoogleUser: boolean
  userEmail: string | null
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isEmailVerified: false,
  isGoogleUser: false,
  userEmail: null,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isGoogleUser, setIsGoogleUser] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const auth = getAuth(app)
    const db = getFirestore(app)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setIsEmailVerified(user?.emailVerified ?? false)
      setIsGoogleUser(user?.providerData[0]?.providerId === 'google.com')
      setUserEmail(user?.email ?? null)

      if (user?.email) {
        const adminDoc = await getDoc(doc(db, 'adminSettings', 'adminEmails'))
        const adminEmails = adminDoc.exists() ? adminDoc.data().emails : ['singh0sahib@gmail.com']
        setIsAdmin(adminEmails.includes(user.email))
      } else {
        setIsAdmin(false)
      }
    })
    return () => unsubscribe()
  }, [])

  const logout = async () => {
    const auth = getAuth(app)
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, isEmailVerified, isGoogleUser, userEmail, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)