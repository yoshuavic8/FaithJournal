'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'
import { Button } from '@/components/ui/button'

interface PayPalButtonProps {
  amount: number
  onSuccess?: (details: any) => void
  onError?: (error: any) => void
}

declare global {
  interface Window {
    paypal?: any
  }
}

export default function PayPalButton({ amount, onSuccess, onError }: PayPalButtonProps) {
  const paypalButtonRef = useRef<HTMLDivElement>(null)
  const paypalScriptLoaded = useRef(false)

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          description: 'Donation to Faith Journal',
          amount: {
            currency_code: 'USD',
            value: amount.toString()
          }
        }
      ],
      application_context: {
        shipping_preference: 'NO_SHIPPING'
      }
    })
  }

  const onApprove = (data: any, actions: any) => {
    return actions.order.capture().then(function(details: any) {
      console.log('Transaction completed by ' + details.payer.name.given_name)
      if (onSuccess) {
        onSuccess(details)
      } else {
        // Default success behavior - redirect to thank you page
        window.location.href = '/support-us/thank-you'
      }
    })
  }

  const onPayPalScriptLoad = () => {
    if (window.paypal && paypalButtonRef.current && !paypalScriptLoaded.current) {
      paypalScriptLoaded.current = true
      
      window.paypal.Buttons({
        style: {
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 40
        },
        createOrder: createOrder,
        onApprove: onApprove,
        onError: (err: any) => {
          console.error('PayPal error:', err)
          if (onError) {
            onError(err)
          }
        }
      }).render(paypalButtonRef.current)
    }
  }

  // Fallback button in case PayPal script fails to load
  const handleFallbackButtonClick = () => {
    // Create a simple form to submit to PayPal
    const form = document.createElement('form')
    form.method = 'post'
    form.action = 'https://www.paypal.com/cgi-bin/webscr'
    form.target = '_blank'

    const cmd = document.createElement('input')
    cmd.type = 'hidden'
    cmd.name = 'cmd'
    cmd.value = '_donations'
    form.appendChild(cmd)

    const business = document.createElement('input')
    business.type = 'hidden'
    business.name = 'business'
    business.value = 'your-paypal-email@example.com' // Replace with your PayPal email
    form.appendChild(business)

    const currencyCode = document.createElement('input')
    currencyCode.type = 'hidden'
    currencyCode.name = 'currency_code'
    currencyCode.value = 'USD'
    form.appendChild(currencyCode)

    const amountInput = document.createElement('input')
    amountInput.type = 'hidden'
    amountInput.name = 'amount'
    amountInput.value = amount.toString()
    form.appendChild(amountInput)

    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }

  return (
    <div className="space-y-4">
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`}
        strategy="afterInteractive"
        onLoad={onPayPalScriptLoad}
        onError={() => {
          console.error('Failed to load PayPal script')
          paypalScriptLoaded.current = false
        }}
      />
      
      <div ref={paypalButtonRef} className="paypal-button-container">
        {/* PayPal buttons will be rendered here */}
      </div>
      
      {/* Fallback button that only shows if PayPal script fails to load */}
      {!paypalScriptLoaded.current && (
        <Button
          onClick={handleFallbackButtonClick}
          className="w-full bg-[#0070BA] hover:bg-[#005ea6] text-white font-medium"
        >
          Pay with PayPal
        </Button>
      )}
      
      <p className="text-xs text-gray-400 text-center mt-2">
        Secure payment processing via PayPal
      </p>
    </div>
  )
}
