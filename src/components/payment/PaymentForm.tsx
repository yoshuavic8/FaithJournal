'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import PaymentMethodSelector from './PaymentMethodSelector'
import PaymentInstructions from './PaymentInstructions'

interface PaymentFormProps {
  amount: number
}

export default function PaymentForm({ amount }: PaymentFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [customerName, setCustomerName] = useState<string>(user?.user_metadata?.full_name || '')
  const [customerEmail, setCustomerEmail] = useState<string>(user?.email || '')
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [transaction, setTransaction] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMethod) {
      setError('Please select a payment method')
      console.error('No payment method selected')
      return
    }

    console.log('Submitting payment with method:', selectedMethod)

    if (!customerName || !customerEmail || !customerPhone) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setIsProcessing(true)
      setError(null)

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: selectedMethod,
          amount,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTransaction(data.data)

        // If payment method is redirect type, redirect to payment page
        if (data.data.pay_url) {
          window.location.href = data.data.pay_url
        }
      } else {
        setError(data.message || 'Failed to create transaction')
      }
    } catch (error: any) {
      console.error('Error creating transaction:', error)
      setError(error.message || 'Failed to create transaction. Please try again later.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div>
      {!transaction ? (
        <Card className="bg-[#1A1A1A] border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-white">Complete Your Donation</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-[#2A2A2A] border-gray-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="bg-[#2A2A2A] border-gray-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone Number</Label>
                <Input
                  id="phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="bg-[#2A2A2A] border-gray-700 text-white"
                  placeholder="e.g., 081234567890"
                  required
                />
              </div>

              <div className="pt-4">
                <PaymentMethodSelector
                  selectedMethod={selectedMethod}
                  onSelectMethod={setSelectedMethod}
                  amount={amount}
                />
                {selectedMethod && (
                  <p className="text-xs text-gray-400 mt-2">
                    Selected payment method: {selectedMethod}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-[#6C63FF] hover:bg-[#5A52D5] text-black font-medium"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="bg-[#1A1A1A] border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Payment Method</p>
                  <p className="text-white font-medium">{transaction.payment_name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Amount</p>
                  <p className="text-white font-medium">${amount.toFixed(2)}</p>
                </div>
                {transaction.pay_code && (
                  <div className="col-span-2">
                    <p className="text-gray-400 text-sm">Payment Code</p>
                    <p className="text-white font-medium bg-[#2A2A2A] p-2 rounded border border-gray-700 mt-1">
                      {transaction.pay_code}
                    </p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-gray-400 text-sm">Reference ID</p>
                  <p className="text-white font-medium">{transaction.reference}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="text-white font-medium">
                    <span className="inline-block px-2 py-1 rounded bg-yellow-900/30 text-yellow-400 text-xs">
                      UNPAID
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              {transaction.checkout_url && (
                <Button
                  className="w-full bg-[#6C63FF] hover:bg-[#5A52D5] text-black font-medium"
                  onClick={() => window.open(transaction.checkout_url, '_blank')}
                >
                  Open Payment Page
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full border-gray-700 text-white hover:bg-gray-800"
                onClick={() => router.push('/support-us')}
              >
                Back to Support Page
              </Button>
            </CardFooter>
          </Card>

          {transaction.pay_code && (
            <PaymentInstructions
              paymentMethod={transaction.payment_method}
              payCode={transaction.pay_code}
              amount={amount}
            />
          )}
        </div>
      )}
    </div>
  )
}
