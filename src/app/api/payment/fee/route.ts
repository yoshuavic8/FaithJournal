import { NextResponse } from 'next/server';
import TripayService from '@/lib/tripay';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const amount = searchParams.get('amount');
    const code = searchParams.get('code');

    if (!amount || !code) {
      return NextResponse.json(
        { success: false, message: 'Amount and code are required' },
        { status: 400 }
      );
    }

    const tripay = new TripayService();
    const fee = await tripay.calculateFee(Number(amount), code);
    
    return NextResponse.json({ success: true, data: fee });
  } catch (error: any) {
    console.error('Error calculating fee:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to calculate fee' },
      { status: 500 }
    );
  }
}
