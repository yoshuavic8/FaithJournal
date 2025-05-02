'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'

interface PaymentMethod {
  code: string
  name: string
  icon_url: string
  group: string
  type: string
  fee_merchant: {
    flat: number
    percent: number
  }
  fee_customer: {
    flat: number
    percent: number
  }
  minimum_amount: number
  maximum_amount: number
  active: boolean
}

interface PaymentMethodSelectorProps {
  selectedMethod: string
  onSelectMethod: (method: string) => void
  amount: number
}

export default function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  amount
}: PaymentMethodSelectorProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('Fetching payment methods for amount:', amount)
        const response = await fetch('/api/payment/channels')
        const data = await response.json()
        
        console.log('Payment methods response:', data)
        
        if (data.success) {
          // Filter payment methods based on minimum amount
          const filteredMethods = data.data.filter(
            (method: PaymentMethod) => method.minimum_amount <= amount
          )
          console.log('Filtered payment methods:', filteredMethods)
          setPaymentMethods(filteredMethods)
        } else {
          setError(data.message || 'Failed to load payment methods')
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error)
        setError('Failed to load payment methods. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [amount])

  if (isLoading) {
    return (
      <Card className="bg-[#1A1A1A] border-none shadow-md">
        <CardContent className="p-4">
          <h3 className="text-white text-lg font-medium mb-4">Payment Method</h3>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-3 mb-4">
              <Skeleton className="h-4 w-4 rounded-full bg-gray-700" />
              <Skeleton className="h-10 w-10 rounded bg-gray-700" />
              <Skeleton className="h-6 flex-1 bg-gray-700" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-[#1A1A1A] border-none shadow-md">
        <CardContent className="p-4">
          <h3 className="text-white text-lg font-medium mb-4">Payment Method</h3>
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#1A1A1A] border-none shadow-md">
      <CardContent className="p-4">
        <h3 className="text-white text-lg font-medium mb-4">Payment Method</h3>
        {paymentMethods.length === 0 ? (
          <p className="text-gray-400">No payment methods available for this amount.</p>
        ) : (
          <RadioGroup value={selectedMethod} onValueChange={onSelectMethod}>
            {paymentMethods.map((method) => (
              <div key={method.code} className="flex items-center space-x-3 mb-4">
                <RadioGroupItem
                  value={method.code}
                  id={method.code}
                  className="border-gray-600 text-[#6C63FF]"
                />
                <div className="h-10 w-10 relative overflow-hidden rounded bg-white p-1 flex items-center justify-center">
                  {method.icon_url ? (
                    <Image
                      src={method.icon_url}
                      alt={method.name}
                      width={32}
                      height={32}
                      style={{ objectFit: 'contain' }}
                      unoptimized
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                      {method.name.substring(0, 2)}
                    </div>
                  )}
                </div>
                <Label
                  htmlFor={method.code}
                  className="text-white font-medium cursor-pointer flex-1"
                >
                  {method.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </CardContent>
    </Card>
  )
}
