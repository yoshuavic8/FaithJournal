'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import JournalInterface from '@/components/journal/JournalInterface'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Metadata } from 'next'

interface JournalEntry {
  id: string
  date: Date
  content: string
  emotion: string
  preview: string
}

interface GroupedEntries {
  today: JournalEntry[]
  yesterday: JournalEntry[]
}

export default function JournalPage() {
  const [groupedEntries, setGroupedEntries] = useState<GroupedEntries>({ today: [], yesterday: [] })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createSupabaseBrowserClient()

  // Helper function to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  // Helper function to check if a date is yesterday
  const isYesterday = (date: Date) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
  }

  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return

      try {
        // Get entries from the last 2 days only
        const twoDaysAgo = new Date()
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
        twoDaysAgo.setHours(0, 0, 0, 0)

        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', twoDaysAgo.toISOString())
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching journal entries:', error)
          return
        }

        if (data) {
          const formattedEntries = data.map(entry => ({
            id: entry.id,
            date: new Date(entry.created_at),
            content: entry.situation,
            emotion: entry.emotion,
            preview: entry.situation.substring(0, 60) + (entry.situation.length > 60 ? '...' : '')
          }))

          // Group entries by today and yesterday
          const todayEntries = formattedEntries.filter(entry => isToday(entry.date))
          const yesterdayEntries = formattedEntries.filter(entry => isYesterday(entry.date))

          setGroupedEntries({
            today: todayEntries,
            yesterday: yesterdayEntries
          })
        }
      } catch (error) {
        console.error('Error fetching journal entries:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntries()
  }, [user, supabase])

  const handleNewEntry = () => {
    router.push('/journal/new')
  }

  const handleViewStatistics = () => {
    router.push('/statistics')
  }

  return (
    <div>
      <JournalInterface
        todayEntries={groupedEntries.today}
        yesterdayEntries={groupedEntries.yesterday}
        onNewEntry={handleNewEntry}
        onViewStatistics={handleViewStatistics}
        isLoading={isLoading}
      />
    </div>
  )
}
