'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface JournalEntry {
  id: string
  user_id: string
  created_at: string
  situation: string
  emotion: string
  reflection?: string  // Mengubah dari thoughts ke reflection sesuai dengan database
  verse_id?: string
  bible_verse?: {
    id: string
    reference: string
    text: string
  }
}

export default function JournalDetailPage() {
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createSupabaseBrowserClient()
  const id = params.id as string

  useEffect(() => {
    const fetchEntry = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        // Fetch the journal entry first
        const { data: journalData, error: journalError } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single()

        if (journalError) {
          console.error('Error fetching journal entry:', journalError)
          throw journalError
        }

        if (!journalData) {
          return { data: null, error: null }
        }

        // If the journal entry has a verse_id, fetch the verse separately
        let verseData = null
        if (journalData.verse_id) {
          const { data: bibleVerse, error: verseError } = await supabase
            .from('bible_verses')
            .select('id, reference, text')
            .eq('id', journalData.verse_id)
            .single()

          if (verseError) {
            console.error('Error fetching bible verse:', verseError)
            // Don't throw here, we still want to show the journal entry
          } else {
            verseData = bibleVerse
          }
        }

        // Combine the data
        const data = {
          ...journalData,
          bible_verse: verseData
        }

        const error = null

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        if (data) {
          setEntry(data)
        } else {
          // Entry not found or doesn't belong to user
          router.push('/journal')
        }
      } catch (error) {
        console.error('Error fetching journal entry:', error)
        router.push('/journal')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntry()
  }, [id, user, supabase, router])

  const handleDelete = async () => {
    if (!entry) return

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entry.id)

      if (error) throw error

      router.push('/journal')
    } catch (error) {
      console.error('Error deleting journal entry:', error)
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-black to-[#1A0A1F] text-white p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6C63FF]"></div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-black to-[#1A0A1F] text-white p-4 flex flex-col items-center justify-center">
        <p className="text-xl mb-4">Journal entry not found</p>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-[#1A0A1F] text-white p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={handleBack} variant="ghost" className="text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            variant="ghost"
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>

        <div className="mb-4 flex items-center">
          <div className="text-4xl mr-3">{entry.emotion}</div>
          <div>
            <h1 className="text-2xl font-bold">Journal Entry</h1>
            <p className="text-gray-400">
              {format(new Date(entry.created_at), 'MMMM d, yyyy • h:mm a')}
            </p>
          </div>
        </div>

        <Card className="bg-[#1A1A1A] border-none shadow-md mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-2 text-white">What happened?</h2>
            <p className="text-white whitespace-pre-wrap">{entry.situation}</p>
          </CardContent>
        </Card>

        {entry.reflection && (
          <Card className="bg-[#1A1A1A] border-none shadow-md mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2 text-white">My thoughts</h2>
              <p className="text-white whitespace-pre-wrap">{entry.reflection}</p>
            </CardContent>
          </Card>
        )}

        {entry.bible_verse && (
          <Card className="bg-[#1A1A1A] border-none shadow-md mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2 text-white">Bible Verse</h2>
              <p className="text-white italic mb-2">"{entry.bible_verse.text}"</p>
              <p className="text-gray-400 text-right">— {entry.bible_verse.reference}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1A1A1A] text-white border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#2A2A2A] text-white border-gray-700 hover:bg-[#3A3A3A]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
