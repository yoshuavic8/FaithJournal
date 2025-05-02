import { NextResponse } from "next/server";
import TripayService from "@/lib/tripay";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const payCode = searchParams.get("pay_code");
    const amount = searchParams.get("amount");

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Payment method code is required" },
        { status: 400 }
      );
    }

    const tripay = new TripayService();
    const instructions = await tripay.getPaymentInstructions(
      code,
      payCode || undefined,
      amount ? Number(amount) : undefined
    );

    return NextResponse.json({ success: true, data: instructions });
  } catch (error: any) {
    console.error("Error fetching payment instructions:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch payment instructions",
      },
      { status: 500 }
    );
  }
}
