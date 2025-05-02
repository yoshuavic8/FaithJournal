'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, AlertCircle, User, Mail, Calendar, MessageSquare, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/context/AuthContext'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// List of admin emails - in a real app, this would be stored in the database
const ADMIN_EMAILS = ['admin@faithjournal.com']

interface SupportTicket {
  id: string
  user_id: string
  email: string
  subject: string
  message: string
  status: 'new' | 'in-progress' | 'resolved' | 'closed'
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export default function TicketDetailPage() {
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createSupabaseBrowserClient()
  const id = params.id as string

  // Function to fetch ticket
  const fetchTicket = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setTicket(data as SupportTicket)
      setAdminNotes(data.admin_notes || '')
    } catch (error: any) {
      console.error('Error fetching support ticket:', error)
      setError('Failed to load support ticket')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle refresh button click
  const handleRefresh = () => {
    fetchTicket()
  }

  useEffect(() => {
    // Check if user is admin
    if (user && !ADMIN_EMAILS.includes(user.email || '')) {
      router.push('/journal')
      return
    }

    // Fetch ticket initially
    fetchTicket()

    // Set up auto-refresh interval (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchTicket()
    }, 30000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [id, user, router, supabase])

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id)

      if (error) throw error

      setTicket({
        ...ticket,
        status: newStatus as any,
        updated_at: new Date().toISOString()
      })

      setSuccess('Ticket status updated successfully')
    } catch (error: any) {
      console.error('Error updating ticket status:', error)
      setError('Failed to update ticket status')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!ticket) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id)

      if (error) throw error

      setTicket({
        ...ticket,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      })

      setSuccess('Admin notes saved successfully')
    } catch (error: any) {
      console.error('Error saving admin notes:', error)
      setError('Failed to save admin notes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    router.push('/admin')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-black to-[#1A0A1F] text-white p-4 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // Check if user is admin
  if (!ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-black to-[#1A0A1F] text-white p-4 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">You do not have permission to access this page.</p>
        <Button onClick={() => router.push('/journal')}>
          Return to Journal
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-[#1A0A1F] text-white p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={handleBack} variant="ghost" className="text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 text-black hover:bg-[#3A3A3A]"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <h1 className="text-2xl font-bold mb-6">Support Ticket Details</h1>

        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-900/30 border-red-900 text-white">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-900/30 border-green-900 text-white">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6C63FF]"></div>
          </div>
        ) : !ticket ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Ticket not found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="bg-[#1A1A1A] border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">{ticket.subject}</CardTitle>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  ticket.status === 'new' ? 'bg-blue-900/50 text-blue-300' :
                  ticket.status === 'in-progress' ? 'bg-yellow-900/50 text-yellow-300' :
                  ticket.status === 'resolved' ? 'bg-green-900/50 text-green-300' :
                  'bg-gray-900/50 text-gray-300'
                }`}>
                  {ticket.status}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-gray-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Created: {formatDate(ticket.created_at)}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <User className="h-4 w-4 mr-2" />
                  <span>User ID: {ticket.user_id}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>Email: {ticket.email}</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-white font-medium mb-2 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </h3>
                  <div className="bg-[#2A2A2A] p-4 rounded-md text-white whitespace-pre-wrap">
                    {ticket.message}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-400">
                  Last updated: {formatDate(ticket.updated_at)}
                </div>
                <Select
                  value={ticket.status}
                  onValueChange={handleStatusChange}
                  disabled={isSaving}
                >
                  <SelectTrigger className="w-40 bg-[#2A2A2A] border-gray-700 text-white">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-gray-700 text-white">
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </CardFooter>
            </Card>

            <Card className="bg-[#1A1A1A] border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-white">Admin Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add private notes about this ticket..."
                  className="min-h-[150px] bg-[#2A2A2A] border-gray-700 text-white"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </CardContent>
              <CardFooter>
                <Button
                  className="ml-auto bg-[#6C63FF] hover:bg-[#5A52D5]"
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Notes'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
