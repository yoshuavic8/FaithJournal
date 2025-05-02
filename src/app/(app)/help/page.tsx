'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, HelpCircle, Mail, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function HelpPage() {
  const { user } = useAuth()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!subject.trim()) {
      setError('Please enter a subject')
      return
    }

    if (!message.trim()) {
      setError('Please enter your message')
      return
    }

    setIsSubmitting(true)

    try {
      if (!user) {
        throw new Error('You must be logged in to submit a support request')
      }

      // Save to Supabase support_tickets table
      const { error } = await supabase.from('support_tickets').insert({
        id: uuidv4(),
        user_id: user.id,
        email: user.email || '',
        subject: subject,
        message: message,
        status: 'new',
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error('Error saving support ticket:', error)
        throw new Error('Failed to send message. Please try again later.')
      }

      setSuccess('Your message has been sent. We will get back to you soon.')
      setSubject('')
      setMessage('')
    } catch (error: any) {
      setError(error.message || 'Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-[#1A0A1F] text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button onClick={handleBack} variant="ghost" className="text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <h1 className="text-2xl font-bold mb-6">Help & Support</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card className="bg-[#1A1A1A] border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <HelpCircle className="mr-2 h-5 w-5 text-[#6C63FF]" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-b border-gray-800">
                    <AccordionTrigger className="text-white hover:text-[#6C63FF]">
                      How do I create a journal entry?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      To create a new journal entry, click the + button at the bottom of the main journal page.
                      Fill in your situation, select an emotion, and optionally add your thoughts.
                      After saving, you'll receive a Bible verse related to your emotion.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="border-b border-gray-800">
                    <AccordionTrigger className="text-white hover:text-[#6C63FF]">
                      How are Bible verses selected?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      Bible verses are selected based on the emotion you choose for your journal entry.
                      Each emotion is linked to verses that provide comfort, guidance, or encouragement
                      relevant to that emotional state.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3" className="border-b border-gray-800">
                    <AccordionTrigger className="text-white hover:text-[#6C63FF]">
                      Can I save my favorite verses?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      Yes! When viewing a Bible verse, click the "Save as Favorite" button.
                      You can view all your saved verses in the History page by selecting the "Favorite Verses" tab.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4" className="border-b border-gray-800">
                    <AccordionTrigger className="text-white hover:text-[#6C63FF]">
                      How do I view my journal statistics?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      Access your journal statistics by clicking on "Statistics & Reports" in the main menu.
                      Here you can see visualizations of your emotional patterns and journaling frequency.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5" className="border-b border-gray-800">
                    <AccordionTrigger className="text-white hover:text-[#6C63FF]">
                      Is my data private and secure?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      Yes, your journal entries and account information are private and secure.
                      We use encryption and secure authentication to protect your data.
                      Only you can access your personal journal entries.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1A] border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Mail className="mr-2 h-5 w-5 text-[#6C63FF]" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-gray-300">
                  For general inquiries:
                </p>
                <p className="text-white">support@faithjournal.com</p>
                <p className="text-gray-300 mt-4">
                  For technical support:
                </p>
                <p className="text-white">tech@faithjournal.com</p>
                <p className="text-gray-300 mt-4">
                  Response time: Within 24-48 hours
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#1A1A1A] border-none shadow-md h-fit">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-[#6C63FF]" />
                Contact Support
              </CardTitle>
              <CardDescription className="text-gray-400">
                Send us a message and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4 bg-red-900/30 border-red-900 text-white">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mb-4 bg-green-900/30 border-green-900 text-white">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-white">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-[#2A2A2A] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="subject" className="text-white">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-[#2A2A2A] border-gray-700 text-white"
                    placeholder="e.g., Question about journal entries"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-white">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[150px] bg-[#2A2A2A] border-gray-700 text-white"
                    placeholder="Describe your issue or question in detail..."
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#6C63FF] hover:bg-[#5A52D5]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
