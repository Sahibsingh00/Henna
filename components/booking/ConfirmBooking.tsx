'use client'

import { useState, useEffect } from 'react'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingData } from '@/types/booking'
import { InfoIcon } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

interface ConfirmBookingProps {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
}

export default function ConfirmBooking({ bookingData, updateBookingData }: ConfirmBookingProps) {
  const [address, setAddress] = useState('')
  const { user, userEmail } = useAuth()
  const [showEmailInput, setShowEmailInput] = useState(false)

  useEffect(() => {
    fetchAddress()
    if (!userEmail && user) {
      setShowEmailInput(true)
    }
  }, [userEmail, user])

  const fetchAddress = async () => {
    const db = getFirestore(app)
    const addressDoc = await getDoc(doc(db, 'settings', 'address'))
    if (addressDoc.exists()) {
      setAddress(addressDoc.data().value)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    updateBookingData({ personalDetails: { ...bookingData.personalDetails, [name]: value } })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm Your Booking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <Input
              type="text"
              id="name"
              name="name"
              required
              value={bookingData.personalDetails?.name || ''}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          {showEmailInput && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <Input
                type="email"
                id="email"
                name="email"
                required
                value={bookingData.personalDetails?.email || ''}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
          )}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              required
              value={bookingData.personalDetails?.phone || ''}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium">Booking Summary</h3>
            <p>Date: {bookingData.date?.toLocaleString()}</p>
            <p>Services: {bookingData.services?.map((s) => `${s.name} (${s.complexity})`).join(', ')}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <h3 className="text-xl font-medium mb-2">Location</h3>
            <p className="text-base text-gray-700 dark:text-gray-300">Your booking is at:</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{address}</p>
            <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
              <InfoIcon className="w-4 h-4 mr-2" />
              <span>You'll find a link to the location in your profile after booking is confirmed.</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}