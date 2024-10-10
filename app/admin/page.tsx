'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AdminPanel from './AdminPanel'
import ManageTimeSlots from './manage-time-slots'
import ManageUsers from './manage-users'
import Reports from './reports'
import AdminSettings from './settings'
import Trash from './trash'
import ManageServices from './ManageServices'
import ManageImages from './ManageImages'
import ManageAdmins from './ManageAdmins'

export default function AdminPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (!isAdmin) {
    router.push('/')
    return null
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminPanel />
      case 'timeSlots':
        return <ManageTimeSlots />
      case 'users':
        return <ManageUsers />
      case 'reports':
        return <Reports />
      case 'settings':
        return <AdminSettings />
      case 'trash':
        return <Trash />
      case 'services':
        return <ManageServices />
      case 'images':
        return <ManageImages />
      case 'admins':
        return <ManageAdmins />
      default:
        return <AdminPanel />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-4">
              <Button onClick={() => setActiveTab('dashboard')} variant={activeTab === 'dashboard' ? 'default' : 'outline'}>Dashboard</Button>
              <Button onClick={() => setActiveTab('timeSlots')} variant={activeTab === 'timeSlots' ? 'default' : 'outline'}>Manage Time Slots</Button>
              <Button onClick={() => setActiveTab('users')} variant={activeTab === 'users' ? 'default' : 'outline'}>Manage Users</Button>
              <Button onClick={() => setActiveTab('reports')} variant={activeTab === 'reports' ? 'default' : 'outline'}>Reports</Button>
              <Button onClick={() => setActiveTab('trash')} variant={activeTab === 'trash' ? 'default' : 'outline'}>Trash</Button>
              <Button onClick={() => setActiveTab('services')} variant={activeTab === 'services' ? 'default' : 'outline'}>Manage Services</Button>
              <Button onClick={() => setActiveTab('images')} variant={activeTab === 'images' ? 'default' : 'outline'}>Manage Images</Button>
              <Button onClick={() => setActiveTab('settings')} variant={activeTab === 'settings' ? 'default' : 'outline'}>Settings</Button>
              <Button onClick={() => setActiveTab('admins')} variant={activeTab === 'admins' ? 'default' : 'outline'}>Manage Admins</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="w-full overflow-x-auto">
        {renderContent()}
      </div>
    </div>
  )
}