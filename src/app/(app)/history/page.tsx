'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Trash2, Share2, Heart, ExternalLink } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
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
  date: Date
  content: string
  emotion: string
  preview: string
}

interface FavoriteVerse {
  id: string
  verse_id: string
  verse: {
    id: string
    reference: string
    text: string
  }
  created_at: string
}

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState('journal')
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [favoriteVerses, setFavoriteVerses] = useState<FavoriteVerse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'journal' | 'verse' } | null>(null)
  const { user } = useAuth()
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        // Fetch journal entries
        const { data: journalData, error: journalError } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (journalError) throw journalError

        if (journalData) {
          const formattedEntries = journalData.map(entry => ({
            id: entry.id,
            date: new Date(entry.created_at),
            content: entry.situation,
            emotion: entry.emotion,
            preview: entry.situation.substring(0, 60) + (entry.situation.length > 60 ? '...' : '')
          }))
          setJournalEntries(formattedEntries)
        }

        // Fetch favorite verses
        const { data: versesData, error: versesError } = await supabase
          .from('favorite_verses')
          .select(`
            id,
            verse_id,
            created_at,
            verse:verse_id(id, reference, text)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (versesError) throw versesError

        if (versesData) {
          // Transform the data to match the FavoriteVerse interface
          const formattedVerses = versesData.map(item => ({
            id: item.id,
            verse_id: item.verse_id,
            created_at: item.created_at,
            verse: {
              id: item.verse[0]?.id || '',
              reference: item.verse[0]?.reference || '',
              text: item.verse[0]?.text || ''
            }
          }))
          setFavoriteVerses(formattedVerses)
        }
      } catch (error) {
        console.error('Error fetching history data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, supabase])

  const handleDelete = async () => {
    if (!itemToDelete) return

    try {
      if (itemToDelete.type === 'journal') {
        const { error } = await supabase
          .from('journal_entries')
          .delete()
          .eq('id', itemToDelete.id)

        if (error) throw error

        setJournalEntries(entries => entries.filter(entry => entry.id !== itemToDelete.id))
      } else {
        const { error } = await supabase
          .from('favorite_verses')
          .delete()
          .eq('id', itemToDelete.id)

        if (error) throw error

        setFavoriteVerses(verses => verses.filter(verse => verse.id !== itemToDelete.id))
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const confirmDelete = (id: string, type: 'journal' | 'verse') => {
    setItemToDelete({ id, type })
    setDeleteDialogOpen(true)
  }

  const shareVerse = async (verse: FavoriteVerse['verse']) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Bible Verse from Faith Journal',
          text: `"${verse.text}" - ${verse.reference}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(`"${verse.text}" - ${verse.reference}`)
        alert('Verse copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing verse:', error)
    }
  }

  // Group journal entries by date
  const groupedEntries: Record<string, JournalEntry[]> = {}
  journalEntries.forEach(entry => {
    const dateKey = format(entry.date, 'yyyy-MM-dd')
    if (!groupedEntries[dateKey]) {
      groupedEntries[dateKey] = []
    }
    groupedEntries[dateKey].push(entry)
  })

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-[#1A0A1F] text-white p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">History</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-[#2A2A2A] p-1 mb-6">
            <TabsTrigger
              value="journal"
              className="flex-1 data-[state=active]:bg-[#6C63FF] data-[state=active]:text-white"
            >
              Journal History
            </TabsTrigger>
            <TabsTrigger
              value="verses"
              className="flex-1 data-[state=active]:bg-[#6C63FF] data-[state=active]:text-white"
            >
              Favorite Verses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journal" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6C63FF]"></div>
              </div>
            ) : Object.keys(groupedEntries).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No journal entries yet.</p>
              </div>
            ) : (
              Object.entries(groupedEntries).map(([dateKey, entries]) => (
                <div key={dateKey} className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-300">
                    {format(new Date(dateKey), 'MMMM d, yyyy')}
                  </h2>
                  {entries.map(entry => (
                    <Card
                      key={entry.id}
                      className="bg-[#1A1A1A] border-none shadow-md hover:shadow-lg transition-shadow relative group cursor-pointer"
                      onClick={() => router.push(`/journal/${entry.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{entry.emotion}</div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-300 mb-1">
                              {format(entry.date, 'h:mm a')}
                            </p>
                            <p className="text-white">{entry.preview}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(entry.id, 'journal');
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="verses" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6C63FF]"></div>
              </div>
            ) : favoriteVerses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No favorite verses yet.</p>
              </div>
            ) : (
              favoriteVerses.map(favorite => (
                <Card
                  key={favorite.id}
                  className="bg-[#1A1A1A] border-none shadow-md hover:shadow-lg transition-shadow relative group cursor-pointer"
                  onClick={() => router.push(`/verses/${favorite.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-[#6C63FF]" />
                          <p className="text-sm font-medium text-gray-300">
                            {favorite.verse.reference}
                          </p>
                        </div>
                        <p className="text-white italic mb-2">"{favorite.verse.text}"</p>
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-gray-700 hover:bg-[#3A3A3A]"
                            onClick={(e) => {
                              e.stopPropagation();
                              shareVerse(favorite.verse);
                            }}
                          >
                            <Share2 className="h-3 w-3 mr-1" />
                            Share
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-gray-700 hover:bg-red-900/30 text-red-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(favorite.id, 'verse');
                            }}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1A1A1A] text-white border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {itemToDelete?.type === 'journal'
                ? 'Are you sure you want to delete this journal entry? This action cannot be undone.'
                : 'Are you sure you want to remove this verse from your favorites?'}
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
