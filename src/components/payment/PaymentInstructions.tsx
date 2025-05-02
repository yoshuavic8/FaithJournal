'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface Instruction {
  title: string
  steps: string[]
}

interface PaymentInstructionsProps {
  paymentMethod: string
  payCode?: string
  amount?: number
}

export default function PaymentInstructions({
  paymentMethod,
  payCode,
  amount
}: PaymentInstructionsProps) {
  const [instructions, setInstructions] = useState<Instruction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInstructions = async () => {
      if (!paymentMethod) return

      try {
        setIsLoading(true)
        
        let url = `/api/payment/instructions?code=${paymentMethod}`
        if (payCode) url += `&pay_code=${payCode}`
        if (amount) url += `&amount=${amount}`
        
        const response = await fetch(url)
        const data = await response.json()

        if (data.success) {
          setInstructions(data.data)
        } else {
          setError(data.message || 'Failed to fetch payment instructions')
        }
      } catch (error) {
        console.error('Error fetching payment instructions:', error)
        setError('Failed to fetch payment instructions. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInstructions()
  }, [paymentMethod, payCode, amount])

  if (isLoading) {
    return (
      <Card className="bg-[#1A1A1A] border-none shadow-md mt-6">
        <CardHeader>
          <CardTitle className="text-white">Payment Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full mb-4 bg-gray-700" />
          <Skeleton className="h-4 w-full mb-2 bg-gray-700" />
          <Skeleton className="h-4 w-full mb-2 bg-gray-700" />
          <Skeleton className="h-4 w-full mb-2 bg-gray-700" />
          <Skeleton className="h-4 w-full mb-2 bg-gray-700" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-[#1A1A1A] border-none shadow-md mt-6">
        <CardHeader>
          <CardTitle className="text-white">Payment Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (instructions.length === 0) {
    return (
      <Card className="bg-[#1A1A1A] border-none shadow-md mt-6">
        <CardHeader>
          <CardTitle className="text-white">Payment Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">No payment instructions available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#1A1A1A] border-none shadow-md mt-6">
      <CardHeader>
        <CardTitle className="text-white">Payment Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {instructions.map((instruction, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-gray-700">
              <AccordionTrigger className="text-white hover:text-[#6C63FF]">
                {instruction.title}
              </AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2 text-gray-300">
                  {instruction.steps.map((step, stepIndex) => (
                    <li key={stepIndex} dangerouslySetInnerHTML={{ __html: step }} />
                  ))}
                </ol>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
