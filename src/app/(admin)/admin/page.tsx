'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/context/AuthContext'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

export default function AdminPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createSupabaseBrowserClient()

  // Function to fetch tickets
  const fetchTickets = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error

      setTickets(data as SupportTicket[])
    } catch (error: any) {
      console.error('Error fetching support tickets:', error)
      setError('Failed to load support tickets')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle refresh button click
  const handleRefresh = () => {
    fetchTickets()
  }

  useEffect(() => {
    // Check if user is admin
    if (user && !ADMIN_EMAILS.includes(user.email || '')) {
      router.push('/journal')
      return
    }

    // Fetch tickets initially
    fetchTickets()

    // Set up auto-refresh interval (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchTickets()
    }, 30000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [user, router, statusFilter, supabase])

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)

      if (error) throw error

      // Update local state
      setTickets(tickets.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, status: newStatus as any, updated_at: new Date().toISOString() }
          : ticket
      ))
    } catch (error: any) {
      console.error('Error updating ticket status:', error)
      setError('Failed to update ticket status')
    }
  }

  const handleViewTicket = (ticketId: string) => {
    router.push(`/admin/tickets/${ticketId}`)
  }

  const filteredTickets = tickets.filter(ticket => {
    if (searchQuery === '') return true

    return (
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button onClick={() => router.push('/journal')} variant="outline" className="border-gray-700 hover:bg-[#3A3A3A] text-black">
            Return to App
          </Button>
        </div>

        <Card className="bg-[#1A1A1A] border-none shadow-md mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Support Tickets</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 hover:bg-[#3A3A3A]"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-900/30 border-red-900 text-white">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="search" className="text-white mb-2 block">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by subject, email or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#2A2A2A] border-gray-700 text-white"
                />
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="status-filter" className="text-white mb-2 block">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter" className="bg-[#2A2A2A] border-gray-700 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-gray-700 text-white">
                    <SelectItem value="all">All Tickets</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6C63FF]"></div>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No support tickets found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-white">Date</TableHead>
                      <TableHead className="text-white">Subject</TableHead>
                      <TableHead className="text-white">User</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="border-gray-800">
                        <TableCell className="text-gray-300">
                          {formatDate(ticket.created_at)}
                        </TableCell>
                        <TableCell className="font-medium text-white">
                          {ticket.subject}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {ticket.email}
                        </TableCell>
                        <TableCell>
                          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            ticket.status === 'new' ? 'bg-blue-900/50 text-blue-300' :
                            ticket.status === 'in-progress' ? 'bg-yellow-900/50 text-yellow-300' :
                            ticket.status === 'resolved' ? 'bg-green-900/50 text-green-300' :
                            'bg-gray-900/50 text-gray-300'
                          }`}>
                            {ticket.status}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Select
                              defaultValue={ticket.status}
                              onValueChange={(value) => handleStatusChange(ticket.id, value)}
                            >
                              <SelectTrigger className="h-8 w-32 bg-[#2A2A2A] border-gray-700 text-white">
                                <SelectValue placeholder="Change status" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#2A2A2A] border-gray-700 text-white">
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              className="h-8 border-gray-700 hover:bg-[#3A3A3A]"
                              onClick={() => handleViewTicket(ticket.id)}
                            >
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
