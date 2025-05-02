'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import JournalEntryForm from '@/components/journal/JournalEntryForm'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Metadata } from 'next'
import { v4 as uuidv4 } from 'uuid'

export default function NewJournalEntryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createSupabaseBrowserClient()

  const handleSubmit = async (data: {
    situation: string
    emotion: string
    reflection?: string
  }) => {
    if (!user) {
      throw new Error('You must be logged in to create a journal entry')
    }

    setIsSubmitting(true)

    try {
      const entryId = uuidv4();

      const { error } = await supabase.from('journal_entries').insert({
        id: entryId,
        user_id: user.id,
        situation: data.situation,
        emotion: data.emotion,
        reflection: data.reflection || null,
        created_at: new Date().toISOString(),
      })

      if (error) {
        throw error
      }

      // Redirect to verse recommendation based on emotion, passing the entry ID
      router.push(`/journal/verse?emotion=${encodeURIComponent(data.emotion)}&entryId=${entryId}`)
    } catch (error: any) {
      console.error('Error creating journal entry:', error)
      throw new Error(error.message || 'Failed to save journal entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <JournalEntryForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
  )
}
