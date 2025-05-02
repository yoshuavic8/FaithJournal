import { NextResponse } from "next/server";
import TripayService from "@/lib/tripay";

export async function GET() {
    try {
        const tripay = new TripayService();
        console.log("Fetching payment channels with config:", {
            apiUrl: process.env.NEXT_PUBLIC_TRIPAY_API_URL,
            apiKey: process.env.TRIPAY_API_KEY ? "Set" : "Not set",
            merchantCode: process.env.TRIPAY_MERCHANT_CODE ? "Set" : "Not set",
        });

        const channels = await tripay.getPaymentChannels();
        console.log("Payment channels fetched:", channels.length);

        return NextResponse.json({ success: true, data: channels });
    } catch (error: any) {
        console.error("Error fetching payment channels:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to fetch payment channels",
            },
            { status: 500 },
        );
    }
}
