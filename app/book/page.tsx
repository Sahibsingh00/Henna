'use client'
import React, { Suspense } from 'react'
import BookingPageContent from './BookingPageContent'
import { Loader2 } from 'lucide-react'
function Spinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}
export default function BookingPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <BookingPageContent />
    </Suspense>
  )
}