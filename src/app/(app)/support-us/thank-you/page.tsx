'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

export default function ThankYouPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-[#1A0A1F] text-white p-4">
      <div className="max-w-md mx-auto pt-12">
        <Card className="bg-[#1A1A1A] border-none shadow-md overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#6C63FF] via-[#FF6584] to-[#6C63FF]"></div>
          <CardHeader className="text-center pt-8">
            <div className="mx-auto mb-4 bg-green-900/30 rounded-full p-3 w-16 h-16 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-400" />
            </div>
            <CardTitle className="text-2xl text-white">Thank You!</CardTitle>
          </CardHeader>
          <CardContent className="text-center px-8 pb-6">
            <p className="text-white mb-6">
              Your donation has been processed. We&apos;ll notify you once the payment is confirmed.
              Your generous support helps us continue to develop and improve Faith Journal.
              We&apos;re grateful for your support on this journey.
            </p>
            <Button
              onClick={() => router.push('/journal')}
              className="bg-[#6C63FF] hover:bg-[#5A52D5] text-black font-medium"
            >
              Return to Journal
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
