import React, { useState, useEffect } from 'react'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'
import { app } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export default function ManageAdmins() {
  const [adminEmails, setAdminEmails] = useState<string[]>([])
  const [newAdminEmail, setNewAdminEmail] = useState('')

  useEffect(() => {
    fetchAdminEmails()
  }, [])

  const fetchAdminEmails = async () => {
    const db = getFirestore(app)
    const adminDoc = await getDoc(doc(db, 'adminSettings', 'adminEmails'))
    if (adminDoc.exists()) {
      setAdminEmails(adminDoc.data().emails)
    } else {
      setAdminEmails(['singh0sahib@gmail.com'])
    }
  }

  const addAdminEmail = async () => {
    if (!newAdminEmail || adminEmails.includes(newAdminEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid and unique email address.",
        variant: "destructive",
      })
      return
    }

    const db = getFirestore(app)
    const updatedEmails = [...adminEmails, newAdminEmail]
    await setDoc(doc(db, 'adminSettings', 'adminEmails'), { emails: updatedEmails })
    setAdminEmails(updatedEmails)
    setNewAdminEmail('')
    toast({
      title: "Admin Added",
      description: `${newAdminEmail} has been added as an admin.`,
    })
  }

  const removeAdminEmail = async (email: string) => {
    if (email === 'singh0sahib@gmail.com') {
      toast({
        title: "Error",
        description: "Cannot remove the default admin email.",
        variant: "destructive",
      })
      return
    }

    const db = getFirestore(app)
    const updatedEmails = adminEmails.filter(e => e !== email)
    await setDoc(doc(db, 'adminSettings', 'adminEmails'), { emails: updatedEmails })
    setAdminEmails(updatedEmails)
    toast({
      title: "Admin Removed",
      description: `${email} has been removed from admin list.`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Admin Emails</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            placeholder="New admin email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
          />
          <Button onClick={addAdminEmail}>Add Admin</Button>
        </div>
        <ul className="space-y-2">
          {adminEmails.map((email) => (
            <li key={email} className="flex justify-between items-center">
              <span>{email}</span>
              {email !== 'singh0sahib@gmail.com' && (
                <Button variant="destructive" onClick={() => removeAdminEmail(email)}>Remove</Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}