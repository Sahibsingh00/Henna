import React, { useState, useEffect } from 'react'
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Booking } from '@/types/booking'
import { RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function TrashComponent() {
  const [trashedBookings, setTrashedBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchTrashedBookings()
  }, [])

  const fetchTrashedBookings = async () => {
    setIsLoading(true)
    try {
      const db = getFirestore(app)
      const bookingsQuery = query(collection(db, "bookings"), where("isDeleted", "==", true))
      const bookingsSnapshot = await getDocs(bookingsQuery)
      const fetchedBookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking))
      setTrashedBookings(fetchedBookings)
    } catch (error) {
      console.error("Error fetching trashed bookings:", error)
      toast({
        title: "Error",
        description: "Failed to fetch trashed bookings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const restoreBooking = async (bookingId: string) => {
    try {
      const db = getFirestore(app)
      await updateDoc(doc(db, "bookings", bookingId), { isDeleted: false })
      toast({
        title: "Booking Restored",
        description: "The booking has been restored.",
      })
      fetchTrashedBookings()
    } catch (error) {
      console.error("Error restoring booking:", error)
      toast({
        title: "Error",
        description: "Failed to restore the booking. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deletePermanently = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this booking? This action cannot be undone.")) {
      try {
        const db = getFirestore(app)
        await deleteDoc(doc(db, "bookings", bookingId))
        toast({
          title: "Booking Deleted",
          description: "The booking has been permanently deleted.",
        })
        fetchTrashedBookings()
      } catch (error) {
        console.error("Error deleting booking:", error)
        toast({
          title: "Error",
          description: "Failed to delete the booking. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const calculateTotalPrice = (services: Booking['services']) => {
    return services.reduce((total, service) => {
      return total + service.prices[service.complexity as keyof typeof service.prices]
    }, 0)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Trash</CardTitle>
        <Button
          onClick={() => fetchTrashedBookings()}
          variant="outline"
          size="icon"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trashedBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{new Date(booking.date.seconds * 1000).toLocaleDateString('en-GB')}</TableCell>
                <TableCell>{booking.personalDetails.name}</TableCell>
                <TableCell>{booking.userEmail}</TableCell>
                <TableCell>{booking.personalDetails.phone}</TableCell>
                <TableCell>{booking.services.map(s => `${s.name} (${s.complexity})`).join(', ')}</TableCell>
                <TableCell>${calculateTotalPrice(booking.services).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={
                    booking.status === 'confirmed' ? 'default' :
                    booking.status === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button onClick={() => restoreBooking(booking.id)} className="mr-2">
                    Restore
                  </Button>
                  <Button variant="destructive" onClick={() => deletePermanently(booking.id)}>
                    Delete Permanently
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}