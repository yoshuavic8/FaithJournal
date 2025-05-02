import { NextResponse } from 'next/server'

// Function to get PayPal access token
async function getPayPalAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are not configured')
  }
  
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  
  const response = await fetch(
    `https://${process.env.NEXT_PUBLIC_PAYPAL_MODE === 'production' ? 'api.paypal.com' : 'api.sandbox.paypal.com'}/v1/oauth2/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    }
  )
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(`Failed to get PayPal access token: ${data.error_description}`)
  }
  
  return data.access_token
}

// Verify PayPal payment
export async function POST(request: Request) {
  try {
    const { orderID } = await request.json()
    
    if (!orderID) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    const accessToken = await getPayPalAccessToken()
    
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_PAYPAL_MODE === 'production' ? 'api.paypal.com' : 'api.sandbox.paypal.com'}/v2/checkout/orders/${orderID}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: `Failed to verify payment: ${data.message || 'Unknown error'}` },
        { status: response.status }
      )
    }
    
    // Here you can save the payment details to your database
    // For example, you might want to store the transaction ID, amount, etc.
    
    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        status: data.status,
        payer: data.payer,
        amount: data.purchase_units[0].payments.captures[0].amount
      }
    })
  } catch (error: any) {
    console.error('Error verifying PayPal payment:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
