'use client'

import { useState, useEffect } from 'react'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type BookingData = {
  date: string;
  bookings: number;
  totalRevenue: number;
}

const chartConfig = {
  bookings: {
    label: "Bookings",
    color: "hsl(var(--chart-1))",
  },
  totalRevenue: {
    label: "Total Revenue",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export default function Reports() {
  const [bookingData, setBookingData] = useState<BookingData[]>([])

  useEffect(() => {
    fetchBookingData()
  }, [])

  const fetchBookingData = async () => {
    const db = getFirestore(app)
    const bookingsSnapshot = await getDocs(collection(db, "bookings"))
    const bookings = bookingsSnapshot.docs.map(doc => doc.data())

    const bookingCounts: { [date: string]: { count: number; revenue: number } } = {}
    bookings.forEach(booking => {
      if (booking.date && booking.date.seconds) {
        const date = new Date(booking.date.seconds * 1000)
        if (!isNaN(date.getTime())) {
          const dateString = date.toISOString().split('T')[0]
          if (!bookingCounts[dateString]) {
            bookingCounts[dateString] = { count: 0, revenue: 0 }
          }
          bookingCounts[dateString].count += 1
          bookingCounts[dateString].revenue += booking.totalPrice || 0
        } else {
          console.error('Invalid date:', booking.date)
        }
      } else {
        console.error('Missing or invalid date field:', booking)
      }
    })

    const data: BookingData[] = Object.entries(bookingCounts).map(([date, { count, revenue }]) => ({
      date,
      bookings: count,
      totalRevenue: revenue
    }))

    setBookingData(data)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Booking Reports</CardTitle>
        <CardDescription>Bookings and Revenue Overview</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart width={600} height={300} data={bookingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(5)} // Show only month-day
            />
            <YAxis yAxisId="left" orientation="left" stroke={chartConfig.bookings.color} />
            <YAxis yAxisId="right" orientation="right" stroke={chartConfig.totalRevenue.color} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar yAxisId="left" dataKey="bookings" fill="var(--color-bookings)" radius={4} />
            <Bar yAxisId="right" dataKey="totalRevenue" fill="var(--color-totalRevenue)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing bookings and revenue data for recent dates
        </div>
      </CardFooter>
    </Card>
  )
}