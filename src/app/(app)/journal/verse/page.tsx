'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BibleVerseDisplay from '@/components/journal/BibleVerseDisplay'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { v4 as uuidv4 } from 'uuid'

interface BibleVerse {
  id: string
  reference: string
  text: string
  explanation?: string
  isFromAI?: boolean
}

// Fallback verse in case database fetch fails
const fallbackVerse: BibleVerse = {
  id: '00000000-0000-0000-0000-000000000000',
  reference: 'Jeremiah 29:11',
  text: '"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."',
  explanation: 'God has good plans for our lives, even when we can\'t see them yet.',
}

export default function VersePage() {
  const [verse, setVerse] = useState<BibleVerse | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingEntry, setIsUpdatingEntry] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const emotion = searchParams.get('emotion')
  const entryId = searchParams.get('entryId')
  const { user } = useAuth()
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const getVerse = async () => {
      setIsLoading(true)

      try {
        // Map emoji to emotion category
        let emotionCategory = 'default';
        if (emotion === '😊') emotionCategory = 'happy';
        else if (emotion === '😢') emotionCategory = 'sad';
        else if (emotion === '😠') emotionCategory = 'angry';
        else if (emotion === '🙏') emotionCategory = 'peaceful';
        else if (emotion === '😰') emotionCategory = 'anxious';
        else if (emotion === '🙌') emotionCategory = 'grateful';

        // Fetch verse from Supabase based on emotion
        const { data, error } = await supabase
          .from('bible_verses')
          .select('*')
          .eq('emotion_category', emotionCategory)

        if (error) {
          throw error;
        }

        let selectedVerse: BibleVerse;

        if (data && data.length > 0) {
          // Select a random verse from the results
          const randomVerse = data[Math.floor(Math.random() * data.length)];

          // Format the verse to match our interface
          selectedVerse = {
            id: randomVerse.id,
            reference: randomVerse.reference,
            text: randomVerse.text,
            explanation: 'This verse was selected based on the emotion in your journal entry.',
          };
        } else {
          // Fallback to default verses if none found
          const { data: defaultData, error: defaultError } = await supabase
            .from('bible_verses')
            .select('*')
            .eq('emotion_category', 'default')
            .limit(1);

          if (defaultError || !defaultData || defaultData.length === 0) {
            // If all else fails, use a hardcoded fallback verse
            selectedVerse = fallbackVerse;
          } else {
            selectedVerse = {
              id: defaultData[0].id,
              reference: defaultData[0].reference,
              text: defaultData[0].text,
              explanation: 'This is a verse to encourage you in your faith journey.',
            };
          }
        }

        setVerse(selectedVerse);

        // If we have an entryId, update the journal entry with the verse_id
        if (entryId && user) {
          setIsUpdatingEntry(true);
          try {
            const { error: updateError } = await supabase
              .from('journal_entries')
              .update({ verse_id: selectedVerse.id })
              .eq('id', entryId)
              .eq('user_id', user.id);

            if (updateError) {
              console.error('Error updating journal entry with verse:', updateError);
            }
          } catch (updateError) {
            console.error('Error updating journal entry:', updateError);
          } finally {
            setIsUpdatingEntry(false);
          }
        }
      } catch (error) {
        console.error('Error fetching verse:', error);
        // Fallback to hardcoded verse
        setVerse(fallbackVerse);
      } finally {
        setIsLoading(false);
      }
    }

    getVerse();
  }, [emotion, supabase, entryId, user])

  const handleSaveFavorite = async () => {
    if (!user || !verse) return

    setIsSaving(true)

    try {
      const { error } = await supabase.from('favorite_verses').insert({
        id: uuidv4(),
        user_id: user.id,
        verse_id: verse.id,
        created_at: new Date().toISOString(),
      })

      if (error) throw error
    } catch (error) {
      console.error('Error saving favorite verse:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !verse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-[#1A0A1F]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6C63FF]"></div>
      </div>
    )
  }

  const handleContinue = () => {
    // Navigate to the journal page after viewing the verse
    router.push('/journal');
  }

  return (
    <BibleVerseDisplay
      verse={verse}
      onSaveFavorite={handleSaveFavorite}
      isSaving={isSaving}
      onContinue={handleContinue}
    />
  )
}
