'use client'

import React, { useState, useEffect } from 'react'
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Service } from '@/types/booking'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ManageServices() {
  const [services, setServices] = useState<Service[]>([])
  const [newService, setNewService] = useState<Service>({
    name: '',
    complexity: 'Simple',
    prices: { Simple: 0, Medium: 0, Hard: 0 }
  })
  const [address, setAddress] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  const [googleMapsLink, setGoogleMapsLink] = useState('')
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null)

  useEffect(() => {
    fetchServices()
    fetchAddress()
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    const db = getFirestore(app)
    const contactInfoDoc = await getDoc(doc(db, 'settings', 'contactInfo'))
    if (contactInfoDoc.exists()) {
      const data = contactInfoDoc.data()
      setContactEmail(data.email || '')
      setPhoneNumber(data.phone || '')
      setMapUrl(data.mapUrl || '')
      setGoogleMapsLink(data.googleMapsLink || '')
    }
  }

  const updateContactInfo = async () => {
    const db = getFirestore(app)
    await setDoc(doc(db, 'settings', 'contactInfo'), {
      email: contactEmail,
      phone: phoneNumber,
      mapUrl: mapUrl,
      googleMapsLink: googleMapsLink
    })
    toast({
      title: "Contact Info Updated",
      description: "The contact information has been updated.",
    })
  }

  const fetchServices = async () => {
    const db = getFirestore(app)
    const servicesSnapshot = await getDocs(collection(db, "services"))
    const fetchedServices = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service))
    setServices(fetchedServices)
  }

  const fetchAddress = async () => {
    const db = getFirestore(app)
    const addressDoc = await getDoc(doc(db, 'settings', 'address'))
    if (addressDoc.exists()) {
      setAddress(addressDoc.data().value)
    }
  }

  const addService = async () => {
    const db = getFirestore(app)
    await addDoc(collection(db, "services"), newService)
    toast({
      title: "Service Added",
      description: `New service "${newService.name}" has been added.`,
    })
    setNewService({ name: '', complexity: 'Simple', prices: { Simple: 0, Medium: 0, Hard: 0 } })
    fetchServices()
  }

  const updateService = async (id: string, updatedService: Partial<Service>) => {
    const db = getFirestore(app)
    const serviceRef = doc(db, "services", id)
    
    const serviceSnapshot = await getDoc(serviceRef)
    const currentService = serviceSnapshot.data() as Service

    const updatedPrices = {
      Simple: currentService.prices?.Simple || 0,
      Medium: currentService.prices?.Medium || 0,
      Hard: currentService.prices?.Hard || 0,
      ...updatedService.prices
    }

    await updateDoc(serviceRef, {
      ...updatedService,
      prices: updatedPrices
    })

    toast({
      title: "Service Updated",
      description: `Service "${updatedService.name || currentService.name}" has been updated.`,
    })
    fetchServices()
  }

  const deleteService = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      const db = getFirestore(app)
      await deleteDoc(doc(db, "services", id))
      toast({
        title: "Service Deleted",
        description: "The service has been deleted.",
      })
      fetchServices()
    }
  }

  const updateAddress = async () => {
    const db = getFirestore(app)
    await setDoc(doc(db, 'settings', 'address'), { value: address })
    toast({
      title: "Address Updated",
      description: "The address has been updated.",
    })
  }

  const startEditingService = (service: Service) => {
    setEditingService({ ...service })
  }

  const cancelEditingService = () => {
    setEditingService(null)
  }

  const saveServiceChanges = async () => {
    if (editingService && editingService.id) {
      await updateService(editingService.id, editingService)
      setEditingService(null)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="services">
          <TabsList className="w-full flex justify-start space-x-2 mb-4">
            <TabsTrigger value="services" className="px-3 py-1 text-sm">Services</TabsTrigger>
            <TabsTrigger value="address" className="px-3 py-1 text-sm">Address</TabsTrigger>
            <TabsTrigger value="contact" className="px-3 py-1 text-sm">Contact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Service Name"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                className="flex-grow"
              />
              <Button onClick={addService} size="sm">Add Service</Button>
            </div>
            {services.map((service) => (
              <Card key={service.id}>
                <CardContent className="pt-6">
                  <Input
                    value={editingService?.id === service.id ? editingService?.name : service.name}
                    onChange={(e) => setEditingService(prev => prev ? { ...prev, name: e.target.value } : null)}
                    disabled={editingService?.id !== service.id}
                  />
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {['Simple', 'Medium', 'Hard'].map((complexity) => (
                      <div key={complexity}>
                        <label>{complexity} Price</label>
                        <Input
                          type="number"
                          value={editingService?.id === service.id 
                            ? editingService?.prices?.[complexity as keyof typeof service.prices] ?? 0
                            : service.prices?.[complexity as keyof typeof service.prices] ?? 0
                          }
                          onChange={(e) => setEditingService({ 
                            ...editingService!, 
                            prices: { 
                              ...editingService!.prices, 
                              [complexity]: Number(e.target.value) || 0 
                            } as { Simple: number; Medium: number; Hard: number }
                          })}
                          disabled={editingService?.id !== service.id}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    {editingService?.id === service.id ? (
                      <>
                        <Button onClick={saveServiceChanges} size="sm">Save</Button>
                        <Button onClick={cancelEditingService} size="sm" variant="outline">Cancel</Button>
                      </>
                    ) : (
                      <Button onClick={() => startEditingService(service)} size="sm">Edit</Button>
                    )}
                    <Button variant="destructive" onClick={() => deleteService(service.id!)} size="sm">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="address">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Manage Address</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Enter address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <Button onClick={updateAddress} size="sm" className="mt-4">Update Address</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Manage Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="Contact Email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                  <Input
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <Input
                    placeholder="Google Maps Embed URL"
                    value={mapUrl}
                    onChange={(e) => setMapUrl(e.target.value)}
                  />
                  <Input
                    placeholder="Google Maps Link"
                    value={googleMapsLink}
                    onChange={(e) => setGoogleMapsLink(e.target.value)}
                  />
                  <Button onClick={updateContactInfo} size="sm">Update Contact Info</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}