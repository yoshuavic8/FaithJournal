'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell } from 'recharts'
import { format, subDays } from 'date-fns'
import { Folder, Quote, Calendar } from 'lucide-react'

interface EmotionCount {
  emotion: string
  count: number
  color?: string
}

interface DailyCount {
  date: string
  count: number
}

interface WordCount {
  word: string
  count: number
}

// Define emotion labels with colors outside the component
const emotionLabels: Record<string, { label: string, color: string }> = {
  '😊': { label: 'Happy', color: '#2196F3' },    // Blue
  '🙏': { label: 'Peaceful', color: '#4CAF50' }, // Green
  '😢': { label: 'Sad', color: '#FF9800' },      // Orange
  '😠': { label: 'Angry', color: '#9C27B0' },    // Purple
  '😰': { label: 'Anxious', color: '#F44336' },  // Red
  '🙌': { label: 'Grateful', color: '#FFEB3B' }, // Yellow
}

export default function StatisticsPage() {
  const [emotionData, setEmotionData] = useState<EmotionCount[]>([])
  const [trendData, setTrendData] = useState<DailyCount[]>([])
  const [wordData, setWordData] = useState<WordCount[]>([])
  const [entryStats, setEntryStats] = useState({
    totalEntries: 0,
    totalWords: 0,
    avgWordsPerEntry: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createSupabaseBrowserClient()

  // Inisialisasi data emosi kosong dengan semua emosi yang tersedia
  useEffect(() => {
    // Inisialisasi data emosi kosong saat komponen dimount
    const initialEmotionData = Object.entries(emotionLabels).map(([emotion, { color }]) => ({
      emotion,
      count: 0,
      color
    }));
    setEmotionData(initialEmotionData);
  }, []);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        // Initialize all emotions with count 0
        const emotionCounts: Record<string, number> = {}
        Object.keys(emotionLabels).forEach(emotion => {
          emotionCounts[emotion] = 0
        })

        // Fetch journal entries
        const { data: journalData, error: journalError } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)

        if (journalError) throw journalError

        // Default values for stats if no entries
        let totalWords = 0
        let entriesCount = 0
        const wordCounts: Record<string, number> = {}
        const entriesByDate: Record<string, number> = {}

        if (journalData && journalData.length > 0) {
          entriesCount = journalData.length

          // Update counts from journal data
          journalData.forEach(entry => {
            if (emotionCounts[entry.emotion] !== undefined) {
              emotionCounts[entry.emotion] += 1
            }

            // For trend data
            const dateKey = format(new Date(entry.created_at), 'yyyy-MM-dd')
            entriesByDate[dateKey] = (entriesByDate[dateKey] || 0) + 1

            // For word statistics
            if (entry.situation) {
              const words = entry.situation
                .toLowerCase()
                .replace(/[^\w\s]/g, '')
                .split(/\s+/)
                .filter((word: string) => word.length > 3 && !['this', 'that', 'with', 'from', 'have', 'were', 'they', 'their'].includes(word))

              totalWords += words.length

              words.forEach((word: string) => {
                wordCounts[word] = (wordCounts[word] || 0) + 1
              })
            }
          })
        }

        // Convert emotion data to array format for the chart
        const emotionDistribution = Object.entries(emotionCounts).map(([emotion, count]) => ({
          emotion,
          count,
          // Tambahkan warna untuk setiap emosi
          color: emotionLabels[emotion]?.color || '#6C63FF'
        }))

        setEmotionData(emotionDistribution)

        // Calculate journaling trend (last 30 days)
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = subDays(new Date(), i)
          return format(date, 'yyyy-MM-dd')
        }).reverse()

        const trendDistribution = last30Days.map(date => ({
          date: format(new Date(date), 'MMM d'),
          count: entriesByDate[date] || 0,
        }))

        setTrendData(trendDistribution)

        // Get top words
        const topWords = Object.entries(wordCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([word, count]) => ({ word, count }))

        setWordData(topWords)

        // Set entry statistics
        setEntryStats({
          totalEntries: entriesCount,
          totalWords,
          avgWordsPerEntry: entriesCount > 0 ? Math.round(totalWords / entriesCount) : 0,
        })
      } catch (error) {
        console.error('Error fetching statistics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatistics()
  }, [user, supabase])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1A1A] p-2 border border-gray-800 rounded shadow-md">
          <p className="text-sm text-white">{`${label}: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-[#1A0A1F] text-white p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Statistics & Reports</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6C63FF]"></div>
          </div>
        ) : entryStats.totalEntries === 0 ? (
          <div className="text-center py-12">
            <p className="text-white">No journal entries yet to generate statistics.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-[#1A1A1A] border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-[#64B5F6]/20">
                      <Folder className="h-6 w-6 text-[#64B5F6]" />
                    </div>
                    <div>
                      <p className="text-sm text-white">Total Entries</p>
                      <p className="text-2xl font-bold text-white">{entryStats.totalEntries}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1A1A1A] border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-[#FF6464]/20">
                      <Quote className="h-6 w-6 text-[#FF6464]" />
                    </div>
                    <div>
                      <p className="text-sm text-white">Avg. Words</p>
                      <p className="text-2xl font-bold text-white">{entryStats.avgWordsPerEntry}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1A1A1A] border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-[#9C64FF]/20">
                      <Calendar className="h-6 w-6 text-[#9C64FF]" />
                    </div>
                    <div>
                      <p className="text-sm text-white">Total Words</p>
                      <p className="text-2xl font-bold text-white">{entryStats.totalWords}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Emotion Distribution */}
            <Card className="bg-[#1A1A1A] border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Emotion Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={emotionData}
                      layout="vertical"
                      barSize={30}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis
                        type="number"
                        tick={{ fill: '#FFFFFF' }}
                        axisLine={{ stroke: '#333333' }}
                        tickLine={false}
                        tickCount={5}
                        domain={[0, 'dataMax']}
                        allowDecimals={false}
                      />
                      <YAxis
                        dataKey="emotion"
                        type="category"
                        tick={(props) => {
                          const { x, y, payload } = props;
                          const emotion = payload.value;
                          const label = emotionLabels[emotion]?.label || emotion;

                          return (
                            <g transform={`translate(${x},${y})`}>
                              <text x={-10} y={0} dy={4} textAnchor="end" fill="#FFFFFF" fontSize={14}>
                                {emotion} {label}
                              </text>
                            </g>
                          );
                        }}
                        width={120}
                        axisLine={{ stroke: '#333333' }}
                        tickLine={false}
                      />
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#333333"
                        vertical={false}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                      />
                      <Bar
                        dataKey="count"
                        radius={[0, 4, 4, 0]}
                      >
                        {emotionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#6C63FF'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {Object.entries(emotionLabels).map(([emoji, { label, color }]) => (
                    <div key={emoji} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                      <span className="text-white text-sm">{emoji} {label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Journaling Trend */}
            <Card className="bg-[#1A1A1A] border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Journaling Trend (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#333"
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#FFFFFF' }}
                        interval={6}
                      />
                      <YAxis
                        tick={{ fill: '#FFFFFF' }}
                        allowDecimals={false}
                        domain={[0, 'dataMax']}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#9C64FF"
                        strokeWidth={2}
                        dot={{ fill: '#9C64FF', r: 4 }}
                        activeDot={{ r: 6, fill: '#FFFFFF' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Frequently Used Words */}
            <Card className="bg-[#1A1A1A] border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Frequently Used Words</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {wordData.map((item, index) => (
                    <div
                      key={index}
                      className="bg-[#2A2A2A] p-3 rounded-lg flex justify-between items-center"
                    >
                      <span className="font-medium capitalize text-white">{item.word}</span>
                      <span className="text-sm bg-[#6C63FF] px-2 py-1 rounded-full text-white">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
