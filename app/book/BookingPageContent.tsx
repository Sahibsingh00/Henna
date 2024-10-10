'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import ServiceSelection from '@/components/booking/ServiceSelection'
import DateSelection from '@/components/booking/DateSelection'
import ConfirmBooking from '@/components/booking/ConfirmBooking'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { BookingData, Service } from '@/types/booking'
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { useAuth } from '@/components/AuthProvider'

const steps = ['Select Services', 'Choose Date', 'Confirm Booking']

export default function BookingPageContent() {
    const { user, isEmailVerified, isGoogleUser, userEmail } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const [currentStep, setCurrentStep] = useState(0)
    const [bookingData, setBookingData] = useState<BookingData>({
      services: [],
      date: null,
      personalDetails: {}
    })
    const [availableServices, setAvailableServices] = useState<Service[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
  
    useEffect(() => {
      fetchServices();
      const savedBookingData = localStorage.getItem('tempBookingData');
      if (savedBookingData) {
        const parsedData = JSON.parse(savedBookingData);
        setBookingData(parsedData);
        setCurrentStep(2); // Set to confirmation step
        localStorage.removeItem('tempBookingData'); // Clear the saved data
      }
  
      // Check if redirected from login
      const step = searchParams.get('step');
      if (step === 'confirm') {
        setCurrentStep(2);
      }
    }, [searchParams]);
  
    useEffect(() => {
      if (user && currentStep === 2) {
        // If user is logged in and on the confirmation step, update the personal details
        updateBookingData({
          personalDetails: {
            ...bookingData.personalDetails,
            name: user.displayName || bookingData.personalDetails.name || '',
            email: user.email || bookingData.personalDetails.email || '',
          }
        });
      }
    }, [user, currentStep]);
  
    const fetchServices = async () => {
      const db = getFirestore(app);
      const servicesSnapshot = await getDocs(collection(db, "services"));
      const fetchedServices = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setAvailableServices(fetchedServices);
    };
  
    const handleNext = () => {
      if (!isNextDisabled()) {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  
    const handleBack = () => {
      setCurrentStep((prev) => Math.max(prev - 1, 0))
    }
  
    const updateBookingData = useCallback((data: Partial<BookingData>) => {
      setBookingData((prev) => ({ ...prev, ...data }))
    }, [])
  
    const isNextDisabled = () => {
      if (currentStep === 0 && bookingData.services.length === 0) return true
      if (currentStep === 1 && !bookingData.date) return true
      return false
    }
  
    const handleBookingError = (error: unknown) => {
      console.error('Booking error:', error)
      toast({
        title: "Booking Error",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive",
      })
    }
  
    const handleConfirmBooking = async () => {
      if (!user) {
        // Save current booking data to local storage
        localStorage.setItem('tempBookingData', JSON.stringify(bookingData));
        router.push('/login?redirectTo=booking');
        return;
      }
  
      if (!isEmailVerified && !isGoogleUser) {
        toast({
          title: "Email verification required",
          description: "Please verify your email before booking.",
          variant: "destructive",
        })
        router.push('/verify-email')
        return
      }
  
      if (!userEmail) {
        toast({
          title: "Email not available",
          description: "We couldn't retrieve your email. Please try logging in again.",
          variant: "destructive",
        })
        return
      }
  
      setIsSubmitting(true)
      try {
        const db = getFirestore(app)
        const bookingsRef = collection(db, 'bookings')
        await addDoc(bookingsRef, {
          ...bookingData,
          userId: user.uid,
          userEmail: userEmail,
          status: 'pending',
          createdAt: new Date(),
          isDeleted: false,
        })
        toast({
          title: "Booking Confirmed",
          description: (
            <div>
              Your booking has been successfully created.
              <p className="mt-2">
                You can find the location details in your profile.
              </p>
            </div>
          ),
        })
        router.push('/profile')
      } catch (error) {
        console.error("Error creating booking:", error)
        handleBookingError(error)
      } finally {
        setIsSubmitting(false)
      }
    }
  
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Book Your Henna Session</CardTitle>
            <CardDescription>Follow the steps below to book your appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8 flex flex-row items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${index <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {index + 1}
                    </div>
                    <span className={`hidden sm:inline-block text-sm mt-2 text-center ${index === currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
                      {step}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-grow mx-2 sm:mx-4">
                      <Progress 
                        value={currentStep > index ? 100 : 0} 
                        className="h-1 w-full"
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            {currentStep === 0 && (
              <ServiceSelection
                selectedServices={bookingData.services}
                updateBookingData={updateBookingData}
                availableServices={availableServices}
              />
            )}
            {currentStep === 1 && (
              <DateSelection
                selectedDate={bookingData.date}
                updateBookingData={updateBookingData}
              />
            )}
            {currentStep === 2 && (
              <ConfirmBooking
                bookingData={bookingData}
                updateBookingData={updateBookingData}
              />
            )}
            <div className="mt-8 flex justify-between">
              {currentStep > 0 && (
                <Button onClick={handleBack} variant="outline">Back</Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} disabled={isNextDisabled()} className="ml-auto">Next</Button>
              ) : (
                <Button 
                  onClick={handleConfirmBooking} 
                  disabled={isSubmitting} 
                  className="ml-auto"
                >
                  {isSubmitting ? "Confirming..." : "Confirm Booking"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }