'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import CoffeeImage from '@/assets/buy-me-a-coffee.jpg'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Coffee, Heart, ExternalLink } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import PaymentForm from '@/components/payment/PaymentForm'
import PayPalButton from '@/components/payment/PayPalButton'

export default function SupportUsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(5)
  const [customAmount, setCustomAmount] = useState('')
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  // Predefined amounts in USD
  const predefinedAmounts = [5, 10, 25, 50]

  // Exchange rate USD to IDR (approximate)
  const exchangeRate = 15000

  const handleBack = () => {
    if (showPaymentForm) {
      setShowPaymentForm(false)
    } else {
      router.back()
    }
  }

  const handleDonate = async () => {
    setShowPaymentForm(true)
  }

  const getAmount = () => {
    if (customAmount && parseFloat(customAmount) > 0) {
      return parseFloat(customAmount)
    }
    return selectedAmount || 5
  }

  // Convert USD to IDR for payment processing
  const getAmountInRupiah = () => {
    return Math.ceil(getAmount() * exchangeRate)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-[#1A0A1F] text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button onClick={handleBack} variant="ghost" className="text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {showPaymentForm ? (
          <PaymentForm amount={getAmountInRupiah()} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h1 className="text-2xl font-bold mb-4">Support Faith Journal</h1>
              <p className="text-gray-300 mb-6">
                Faith Journal is developed by an independent developer passionate about
                creating tools that help people in their faith journey. Your support
                helps keep this project alive and growing.
              </p>

              <div className="bg-[#1A1A1A] rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-pink-400" />
                  Why Support Us?
                </h2>
                <ul className="space-y-2 text-gray-300">
                  <li>• Keep Faith Journal free for everyone</li>
                  <li>• Help fund new features and improvements</li>
                  <li>• Support independent Christian software</li>
                  <li>• Be part of our growing community</li>
                </ul>
              </div>

              <div className="relative h-48 w-full rounded-lg overflow-hidden mb-6">
                <Image
                  src={CoffeeImage}
                  alt="Buy me a coffee"
                  fill
                  style={{objectFit: 'cover'}}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <p className="text-white text-xl font-medium px-4 text-center">
                    "Every cup of coffee fuels new features"
                  </p>
                </div>
              </div>
            </div>

            <Card className="bg-[#1A1A1A] border-none shadow-md h-fit">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#6C63FF] via-[#FF6584] to-[#6C63FF]"></div>
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Coffee className="mr-2 h-5 w-5 text-[#FF9D66]" />
                  Buy Me a Coffee
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your support helps keep Faith Journal growing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block">Select Amount</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {predefinedAmounts.map(amount => (
                      <Button
                        key={amount}
                        type="button"
                        variant={selectedAmount === amount ? "default" : "outline"}
                        className={selectedAmount === amount
                          ? "bg-[#6C63FF] hover:bg-[#5A52D5] text-black font-medium"
                          : "border-gray-700 bg-white text-black font-medium hover:bg-gray-100"
                        }
                        onClick={() => {
                          setSelectedAmount(amount)
                          setCustomAmount('')
                        }}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="custom-amount" className="text-white mb-2 block">Custom Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <Input
                      id="custom-amount"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value)
                        setSelectedAmount(null)
                      }}
                      className="pl-8 bg-[#2A2A2A] border-gray-700 text-white"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Minimum donation: $1 (≈ Rp15.000)</p>
                </div>

                <div className="pt-4">
                  <Button
                    className="w-full bg-[#6C63FF] hover:bg-[#5A52D5] text-black font-medium"
                    onClick={handleDonate}
                  >
                    {`Donate $${getAmount()} (≈ Rp${getAmountInRupiah().toLocaleString('id-ID')})`}
                  </Button>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Secure payment processing via Tripay
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start space-y-4 border-t border-gray-800 pt-4">
                <p className="text-sm text-gray-300">
                  Or donate with PayPal:
                </p>
                <div className="w-full">
                  <PayPalButton
                    amount={getAmount()}
                    onSuccess={(details) => {
                      console.log('PayPal transaction completed:', details)
                      router.push('/support-us/thank-you')
                    }}
                    onError={(error) => {
                      console.error('PayPal error:', error)
                      // You could show an error message here
                    }}
                  />
                </div>

                <p className="text-sm text-gray-300 mt-4">
                  Other ways to support:
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-700 bg-white text-black font-medium hover:bg-gray-100 justify-start"
                  onClick={() => window.open('https://github.com/yourusername/faith-journal', '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Star on GitHub
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-700 bg-white text-black font-medium hover:bg-gray-100 justify-start"
                  onClick={() => window.open('https://twitter.com/intent/tweet?text=Check%20out%20Faith%20Journal%20-%20a%20beautiful%20app%20for%20spiritual%20journaling%20and%20reflection!%20%23FaithJournal%20%23ChristianApps&url=https://faithjournal.app', '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Share on Twitter
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
