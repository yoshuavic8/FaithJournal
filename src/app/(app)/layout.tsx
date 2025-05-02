'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, BarChart2, History, Heart } from 'lucide-react'
import { AuthProvider } from '@/context/AuthContext'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-[#1A0A1F]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6C63FF]"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-b from-black to-[#1A0A1F] text-white">
        <main className="pb-20">
          {children}
        </main>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-gray-800 p-2">
          <Tabs defaultValue={pathname} className="w-full">
            <TabsList className="w-full bg-[#2A2A2A] p-1">
              <TabsTrigger
                value="/journal"
                className="flex-1 data-[state=active]:bg-[#6C63FF] data-[state=active]:text-white"
                onClick={() => router.push('/journal')}
              >
                <div className="flex flex-col items-center">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-xs mt-1">Journal</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="/history"
                className="flex-1 data-[state=active]:bg-[#6C63FF] data-[state=active]:text-white"
                onClick={() => router.push('/history')}
              >
                <div className="flex flex-col items-center">
                  <History className="h-5 w-5" />
                  <span className="text-xs mt-1">History</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="/statistics"
                className="flex-1 data-[state=active]:bg-[#6C63FF] data-[state=active]:text-white"
                onClick={() => router.push('/statistics')}
              >
                <div className="flex flex-col items-center">
                  <BarChart2 className="h-5 w-5" />
                  <span className="text-xs mt-1">Stats</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="/support-us"
                className="flex-1 data-[state=active]:bg-[#6C63FF] data-[state=active]:text-white"
                onClick={() => router.push('/support-us')}
              >
                <div className="flex flex-col items-center">
                  <Heart className="h-5 w-5" />
                  <span className="text-xs mt-1">Support</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </AuthProvider>
  )
}
