'use client'

import { useState, useEffect } from 'react'
import { format, addDays } from "date-fns"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { BookingData } from '@/types/booking'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'
import { app } from '@/lib/firebase'


interface DateSelectionProps {
  selectedDate: Date | null;
  updateBookingData: (data: Partial<BookingData>) => void;
}

export default function DateSelection({ selectedDate, updateBookingData }: DateSelectionProps) {
  const [date, setDate] = useState<Date | undefined>(selectedDate || undefined)
  const [time, setTime] = useState<string | null>(null)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])

  const [availableDates, setAvailableDates] = useState<string[]>([])

  useEffect(() => {
    if (date) {
      fetchAvailableTimeSlots(date);
    }
  }, [date]);

  const fetchAvailableTimeSlots = async (selectedDate: Date) => {
    const db = getFirestore(app);
    const timeSlotsRef = collection(db, "timeSlots");
    const q = query(
      timeSlotsRef,
      where("date", "==", format(selectedDate, "yyyy-MM-dd")),
      where("isAvailable", "==", true)
    );
    const querySnapshot = await getDocs(q);
    const slots = querySnapshot.docs.map(doc => doc.data().time);
    setAvailableTimeSlots(slots);
  };

  const fetchAvailableDates = async () => {
    const db = getFirestore(app);
    const timeSlotsRef = collection(db, "timeSlots");
    const q = query(
      timeSlotsRef,
      where("isAvailable", "==", true)
    );
    const querySnapshot = await getDocs(q);
    const dates = Array.from(new Set(querySnapshot.docs.map(doc => doc.data().date)));
    setAvailableDates(dates);
  };

  useEffect(() => {
    if (date && time) {
      const [hours, minutes] = time.split(':')
      const dateTime = new Date(date)
      dateTime.setHours(parseInt(hours), parseInt(minutes))
      updateBookingData({ date: dateTime })
    } else {
      updateBookingData({ date: null })
    }
  }, [date, time, updateBookingData])

  useEffect(() => {
    fetchAvailableDates();
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
          <CardDescription>Choose your preferred date for the appointment</CardDescription>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] pl-3 text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                {date ? (
                  format(date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate: Date | undefined) => setDate(newDate)}
                initialFocus
                disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                modifiers={{
                  available: (date) => availableDates.includes(format(date, "yyyy-MM-dd")),
                }}
                modifiersStyles={{
                  available: {
                    backgroundColor: "var(--available-date-bg)",
                    color: "var(--available-date-color)",
                  },
                }}
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Select Time</CardTitle>
          <CardDescription>Choose an available time slot</CardDescription>
        </CardHeader>
        <CardContent>
          {date ? (
            availableTimeSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {availableTimeSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={time === slot ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setTime(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No slots available for this date</p>
            )
          ) : (
            <p className="text-muted-foreground">Please select a date first</p>
          )}
        </CardContent>
      </Card>
      <div className="mt-2 text-sm flex items-center">
        <span className="inline-block w-3 h-3 mr-1 bg-[var(--available-date-bg)] rounded-full"></span>
        Dates with available slots
      </div>
    </div>
  )
}