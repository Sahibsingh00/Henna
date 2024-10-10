'use client'

import React, { useState, useEffect } from 'react'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Booking } from '@/types/booking'

type User = {
  email: string;
  name: string;
  phone: string;
  bookings: Booking[];
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    const db = getFirestore(app)
    const bookingsSnapshot = await getDocs(collection(db, "bookings"))
    const fetchedBookings = bookingsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Booking))
      .filter(booking => !booking.isDeleted)  // Add this line to filter out deleted bookings
      
    // Group bookings by userEmail and extract name and phone
    const userMap = fetchedBookings.reduce((acc, booking) => {
      if (!acc[booking.userEmail]) {
        acc[booking.userEmail] = {
          email: booking.userEmail,
          name: booking.personalDetails.name,
          phone: booking.personalDetails.phone,
          bookings: []
        }
      }
      acc[booking.userEmail].bookings.push(booking)
      return acc
    }, {} as Record<string, User>)

    setUsers(Object.values(userMap))
  }

  const calculateTotalPrice = (services: Booking['services']) => {
    return services.reduce((total, service) => {
      return total + service.prices[service.complexity as keyof typeof service.prices]
    }, 0)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Manage Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-8">
            {users.map((user) => (
              <Card key={user.email} className="p-4">
                <CardHeader>
                  <CardTitle>{user.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone}</p>
                  </div>
                  <h3 className="text-xl font-semibold mt-4 mb-2">User Bookings</h3>
                  <Table>
                    <TableCaption>User&apos;s booking history</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Services</TableHead>
                        <TableHead>Total Price</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{new Date(booking.date.seconds * 1000).toLocaleDateString('en-GB')}</TableCell>
                          <TableCell>
                            {booking.services.map((service, index) => (
                              <div key={index}>
                                {service.name} ({service.complexity}) - ${service.prices[service.complexity as keyof typeof service.prices]}
                              </div>
                            ))}
                          </TableCell>
                          <TableCell>${calculateTotalPrice(booking.services).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'destructive'}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}