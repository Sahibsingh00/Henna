'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Loader2, MapPin } from 'lucide-react'
import { Booking } from '@/types/booking'

export default function Profile() {
  const { user, isEmailVerified, isGoogleUser } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [localIsEmailVerified, setLocalIsEmailVerified] = useState(isEmailVerified)
  const [isLoading, setIsLoading] = useState(true)
  const [address, setAddress] = useState('')
  const [googleMapsLink, setGoogleMapsLink] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLocalIsEmailVerified(user.emailVerified)
        if (user.emailVerified || user.providerData.some(provider => provider.providerId === 'google.com')) {
          fetchBookings(user.uid)
          fetchAddress()
          fetchGoogleMapsLink()
        } else {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const fetchAddress = async () => {
    try {
      const db = getFirestore(app)
      const addressDoc = await getDoc(doc(db, 'settings', 'address'))
      if (addressDoc.exists()) {
        setAddress(addressDoc.data().value)
      }
    } catch (error) {
      console.error("Error fetching address:", error)
    }
  }

  const fetchGoogleMapsLink = async () => {
    try {
      const db = getFirestore(app)
      const contactInfoDoc = await getDoc(doc(db, 'settings', 'contactInfo'))
      if (contactInfoDoc.exists()) {
        setGoogleMapsLink(contactInfoDoc.data().googleMapsLink || '')
      }
    } catch (error) {
      console.error("Error fetching Google Maps link:", error)
    }
  }

  const fetchBookings = async (userId: string) => {
    setIsLoading(true)
    try {
      const db = getFirestore(app)
      const q = query(collection(db, "bookings"), where("userId", "==", userId))
      const querySnapshot = await getDocs(q)
      const fetchedBookings: Booking[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Booking, 'id'> }))
      setBookings(fetchedBookings)
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl mb-4">Please log in to view your profile.</p>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!isGoogleUser && !localIsEmailVerified && (
        <Card className="mb-8 bg-yellow-100 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-yellow-800">Email Verification Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              Please verify your email to access all features. 
              <Button asChild className="ml-2 text-yellow-800 underline" variant="link">
                <Link href="/verify-email">Please Verify your Email</Link>
              </Button>
            </p>
          </CardContent>
        </Card>
      )}
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
              <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.displayName || 'User'}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
        </CardContent>
      </Card>

      {(isGoogleUser || localIsEmailVerified) && (
        <Card>
          <CardHeader>
            <CardTitle>Your Bookings</CardTitle>
            <CardDescription>Here are your recent and upcoming bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>{new Date(booking.date.seconds * 1000).toLocaleDateString('en-GB')}</CardTitle>
                        <Badge variant={
                          booking.status === 'confirmed' ? 'default' :
                          booking.status === 'pending' ? 'secondary' :
                          'destructive'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p><strong>Services:</strong> {booking.services.map(s => `${s.name} (${s.complexity})`).join(', ')}</p>
                      <p><strong>Total Price:</strong> ${booking.services.reduce((total, service) => total + service.prices[service.complexity], 0)}</p>
                      <p><strong>Booked on:</strong> {new Date(booking.createdAt.seconds * 1000).toLocaleDateString('en-GB')}</p>
                      {booking.status === 'confirmed' && (
                        <div className="mt-2">
                          <p className="font-semibold">Appointment Address:</p>
                          <div className="flex items-center mt-1">
                            <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                            <Link 
                              href={googleMapsLink || '#'}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {address}
                            </Link>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p>You have no bookings yet.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}