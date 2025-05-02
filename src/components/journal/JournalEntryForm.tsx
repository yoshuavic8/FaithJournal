'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'

interface EmotionOption {
  emoji: string
  label: string
  value: string
}

interface JournalEntryFormProps {
  onSubmit: (data: {
    situation: string
    emotion: string
    reflection?: string
  }) => Promise<void>
  isSubmitting: boolean
}

const emotionOptions: EmotionOption[] = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😢', label: 'Sad', value: 'sad' },
  { emoji: '😠', label: 'Angry', value: 'angry' },
  { emoji: '🙏', label: 'Peaceful', value: 'peaceful' },
  { emoji: '😰', label: 'Anxious', value: 'anxious' },
  { emoji: '🙌', label: 'Grateful', value: 'grateful' },
]

export default function JournalEntryForm({ onSubmit, isSubmitting }: JournalEntryFormProps) {
  const [situation, setSituation] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionOption | null>(null)
  const [reflection, setReflection] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const MAX_CHARS = 250
  const situationCharsLeft = MAX_CHARS - situation.length
  const reflectionCharsLeft = MAX_CHARS - reflection.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!situation.trim()) {
      setError('Please enter your journal content')
      return
    }

    if (situation.length > MAX_CHARS) {
      setError(`Journal content exceeds maximum ${MAX_CHARS} characters`)
      return
    }

    if (reflection.length > MAX_CHARS) {
      setError(`Reflection exceeds maximum ${MAX_CHARS} characters`)
      return
    }

    if (!selectedEmotion) {
      setError('Please select an emotion')
      return
    }

    try {
      await onSubmit({
        situation,
        emotion: selectedEmotion.emoji,
        reflection: reflection.trim() || undefined,
      })
    } catch (error: any) {
      setError(error.message || 'Failed to save journal entry')
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-[#1A0A1F] text-white p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-[#1A1A1A] border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">New Journal Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-900/30 border-red-900 text-white">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-white">
                    What's on your mind today?
                  </label>
                  <span className={`text-xs ${situationCharsLeft < 0 ? 'text-red-400' : 'text-white'}`}>
                    {situationCharsLeft} characters left
                  </span>
                </div>
                <Textarea
                  placeholder="Write about your situation, thoughts, or feelings..."
                  className="min-h-[150px] bg-[#2A2A2A] border-gray-700 text-white"
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  maxLength={MAX_CHARS}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  How are you feeling?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {emotionOptions.map((emotion) => (
                    <Button
                      key={emotion.value}
                      type="button"
                      variant={selectedEmotion?.value === emotion.value ? 'default' : 'outline'}
                      className={`h-16 ${
                        selectedEmotion?.value === emotion.value
                          ? 'bg-[#6C63FF] hover:bg-[#5A52D5]'
                          : 'bg-[#2A2A2A] border-gray-700 hover:bg-[#3A3A3A]'
                      }`}
                      onClick={() => setSelectedEmotion(emotion)}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-2xl">{emotion.emoji}</span>
                        <span className="text-xs mt-1 text-white">{emotion.label}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-white">
                    Reflection (optional)
                  </label>
                  <span className={`text-xs ${reflectionCharsLeft < 0 ? 'text-red-400' : 'text-white'}`}>
                    {reflectionCharsLeft} characters left
                  </span>
                </div>
                <Textarea
                  placeholder="Add any spiritual reflections or insights..."
                  className="min-h-[100px] bg-[#2A2A2A] border-gray-700 text-white"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  maxLength={MAX_CHARS}
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              className="border-gray-700 hover:bg-[#3A3A3A]"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-[#6C63FF] to-[#9C64FF] hover:opacity-90"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
