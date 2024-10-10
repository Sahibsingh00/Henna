'use client'

import { useState, useEffect } from 'react'
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type TimeSlot = {
  id: string;
  date: string;
  time: string;
  isAvailable: boolean;
}

export default function ManageTimeSlots() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [newDate, setNewDate] = useState<Date>()
  const [newHour, setNewHour] = useState<string>('')
  const [newMinute, setNewMinute] = useState<string>('')

  useEffect(() => {
    fetchTimeSlots()
  }, [])

  const fetchTimeSlots = async () => {
    const db = getFirestore(app)
    const timeSlotsSnapshot = await getDocs(collection(db, "timeSlots"))
    const fetchedTimeSlots = timeSlotsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeSlot))
    setTimeSlots(fetchedTimeSlots)
  }

  const addTimeSlot = async () => {
    if (!newDate || !newHour || !newMinute) {
      toast({
        title: "Error",
        description: "Please select both date and time",
        variant: "destructive",
      })
      return
    }
    const newTime = `${newHour}:${newMinute}`
    const db = getFirestore(app)
    await addDoc(collection(db, "timeSlots"), {
      date: format(newDate, "yyyy-MM-dd"),
      time: newTime,
      isAvailable: true
    })
    toast({
      title: "Time Slot Added",
      description: `New time slot added for ${format(newDate, "PPP")} at ${newTime}`,
    })
    setNewDate(undefined)
    setNewHour('')
    setNewMinute('')
    fetchTimeSlots()
  }

  const toggleAvailability = async (id: string, currentAvailability: boolean) => {
    const db = getFirestore(app)
    await updateDoc(doc(db, "timeSlots", id), {
      isAvailable: !currentAvailability
    })
    toast({
      title: "Time Slot Updated",
      description: `Time slot availability toggled`,
    })
    fetchTimeSlots()
  }

  const deleteTimeSlot = async (id: string) => {
    const db = getFirestore(app)
    await deleteDoc(doc(db, "timeSlots", id))
    toast({
      title: "Time Slot Deleted",
      description: `Time slot has been removed`,
    })
    fetchTimeSlots()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Manage Time Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !newDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newDate ? format(newDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newDate}
                  onSelect={setNewDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex space-x-2">
              <Select onValueChange={setNewHour}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Hour">
                    {newHour ? newHour : <span className="text-muted-foreground">Hour</span>}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                    <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                      {hour.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setNewMinute}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Minute">
                    {newMinute ? newMinute : <span className="text-muted-foreground">Minute</span>}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {['00', '15', '30', '45'].map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addTimeSlot} className="w-full sm:w-auto">Add Time Slot</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeSlots.map((slot) => (
              <Card key={slot.id} className="p-4">
                <p>{slot.date} at {slot.time}</p>
                <p>Status: {slot.isAvailable ? 'Available' : 'Unavailable'}</p>
                <div className="mt-2 space-x-2">
                  <Button onClick={() => toggleAvailability(slot.id, slot.isAvailable)}>
                    Toggle Availability
                  </Button>
                  <Button variant="destructive" onClick={() => deleteTimeSlot(slot.id)}>
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}