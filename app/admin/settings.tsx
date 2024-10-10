'use client'

import { useState, useEffect } from 'react'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

type Settings = {
  businessName: string;
  contactEmail: string;
  phoneNumber: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    businessName: '',
    contactEmail: '',
    phoneNumber: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const db = getFirestore(app)
    const settingsDoc = await getDoc(doc(db, "adminSettings", "general"))
    if (settingsDoc.exists()) {
      setSettings(settingsDoc.data() as Settings)
    }
  }

  const updateSettings = async () => {
    const db = getFirestore(app)
    await updateDoc(doc(db, "adminSettings", "general"), settings)
    toast({
      title: "Settings Updated",
      description: "Admin settings have been successfully updated",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="businessName" className="block mb-2">Business Name</label>
              <Input
                id="businessName"
                value={settings.businessName}
                onChange={(e) => setSettings({...settings, businessName: e.target.value})}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="contactEmail" className="block mb-2">Contact Email</label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block mb-2">Phone Number</label>
              <Input
                id="phoneNumber"
                value={settings.phoneNumber}
                onChange={(e) => setSettings({...settings, phoneNumber: e.target.value})}
                className="w-full"
              />
            </div>
            <Button onClick={updateSettings} className="w-full sm:w-auto">Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}