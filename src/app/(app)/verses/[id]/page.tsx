'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2, Share2, Heart } from 'lucide-react'
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

interface FavoriteVerse {
  id: string
  user_id: string
  verse_id: string
  created_at: string
  verse: {
    id: string
    reference: string
    text: string
    emotion_category?: string
  }
}

export default function VerseDetailPage() {
  const [favoriteVerse, setFavoriteVerse] = useState<FavoriteVerse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSharing, setIsSharing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createSupabaseBrowserClient()
  const id = params.id as string

  useEffect(() => {
    const fetchVerse = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        const { data, error } = await supabase
          .from('favorite_verses')
          .select(`
            *,
            verse:bible_verses!verse_id (
              id,
              reference,
              text,
              emotion_category
            )
          `)
          .eq('id', id)
          .eq('user_id', user.id)
          .single()

        if (error) throw error

        if (data) {
          setFavoriteVerse(data)
        } else {
          // Verse not found or doesn't belong to user
          router.push('/history')
        }
      } catch (error) {
        console.error('Error fetching favorite verse:', error)
        router.push('/history')
      } finally {
        setIsLoading(false)
      }
    }

    fetchVerse()
  }, [id, user, supabase, router])

  const handleDelete = async () => {
    if (!favoriteVerse) return

    try {
      const { error } = await supabase
        .from('favorite_verses')
        .delete()
        .eq('id', favoriteVerse.id)

      if (error) throw error

      router.push('/history')
    } catch (error) {
      console.error('Error deleting favorite verse:', error)
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const handleShare = async () => {
    if (!favoriteVerse) return

    setIsSharing(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Bible Verse from Faith Journal',
          text: `"${favoriteVerse.verse.text}" - ${favoriteVerse.verse.reference}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(`"${favoriteVerse.verse.text}" - ${favoriteVerse.verse.reference}`)
        alert('Verse copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing verse:', error)
    } finally {
      setIsSharing(false)
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

  if (!favoriteVerse) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-black to-[#1A0A1F] text-white p-4 flex flex-col items-center justify-center">
        <p className="text-xl mb-4">Favorite verse not found</p>
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
            Remove from Favorites
          </Button>
        </div>

        <div className="mb-4">
          <div className="flex items-center">
            <Heart className="h-5 w-5 text-red-400 mr-2 fill-current" />
            <h1 className="text-2xl font-bold">Favorite Verse</h1>
          </div>
          <p className="text-gray-400">
            Saved on {format(new Date(favoriteVerse.created_at), 'MMMM d, yyyy')}
          </p>
        </div>

        <Card className="bg-[#1A1A1A] border-none shadow-md mb-6">
          <CardContent className="p-6">
            <p className="text-white italic text-xl mb-4">"{favoriteVerse.verse.text}"</p>
            <p className="text-gray-300 text-right font-medium">— {favoriteVerse.verse.reference}</p>

            {favoriteVerse.verse.emotion_category && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-gray-400">
                  This verse is associated with the emotion: <span className="text-[#6C63FF]">{favoriteVerse.verse.emotion_category}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={handleShare}
            disabled={isSharing}
            className="bg-[#6C63FF] hover:bg-[#5A52D5] text-white"
          >
            <Share2 className="mr-2 h-4 w-4" />
            {isSharing ? 'Sharing...' : 'Share Verse'}
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1A1A1A] text-white border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to remove this verse from your favorites?
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
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
