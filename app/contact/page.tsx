'use client'


import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { app } from '@/lib/firebase'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Add these state variables inside the component
  const [address, setAddress] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchContactInfo = async () => {
      setIsLoading(true)
      try {
        const db = getFirestore(app)
        const addressDoc = await getDoc(doc(db, 'settings', 'address'))
        const contactInfoDoc = await getDoc(doc(db, 'settings', 'contactInfo'))

        if (addressDoc.exists()) {
          setAddress(addressDoc.data().value)
        }
        if (contactInfoDoc.exists()) {
          const data = contactInfoDoc.data()
          setContactEmail(data.email || '')
          setPhoneNumber(data.phone || '')
          setMapUrl(data.mapUrl || '')
        }
      } catch (error) {
        console.error("Error fetching contact info:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContactInfo()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Use relative URL to automatically adapt to the current protocol (http or https)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('Form submission successful:', responseData)
        setSubmitStatus('success')
        setName('')
        setEmail('')
        setMessage('')
      } else {
        const errorData = await response.json()
        console.error('Error submitting form:', errorData)
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Send Us a Message</CardTitle>
            <CardDescription>We&apos;d love to hear from you!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
              {submitStatus === 'success' && (
                <p className="text-green-600">Message sent successfully!</p>
              )}
              {submitStatus === 'error' && (
                <p className="text-red-600">Failed to send message. Please try again.</p>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Information</CardTitle>
            <CardDescription>Here&apos;s how you can reach us</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span>{address}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-gray-500" />
              <span>{phoneNumber}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-gray-500" />
              <span>{contactEmail}</span>
            </div>
            <div className="aspect-w-16 aspect-h-9 mt-4">
              <iframe
                src={mapUrl}
                width="600"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full rounded-md"
              ></iframe>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}