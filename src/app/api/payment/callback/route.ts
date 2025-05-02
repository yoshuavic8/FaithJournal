import { NextResponse } from "next/server";
import crypto from "crypto-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    // Get the callback signature from headers
    const callbackSignature = request.headers.get("X-Callback-Signature");

    // Get the callback event from headers
    const callbackEvent = request.headers.get("X-Callback-Event");

    // Get the request body
    const body = await request.json();

    // Verify that this is a payment status callback
    if (callbackEvent !== "payment_status") {
      return NextResponse.json(
        { success: false, message: "Invalid callback event" },
        { status: 400 }
      );
    }

    // Verify the signature
    const privateKey = process.env.TRIPAY_PRIVATE_KEY || "";
    const signature = crypto
      .HmacSHA256(JSON.stringify(body), privateKey)
      .toString();

    if (signature !== callbackSignature) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    // Extract data from the callback
    const { reference, merchant_ref, status } = body;

    // Update the donation status in the database
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("donations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("reference", reference)
      .eq("merchant_ref", merchant_ref);

    if (error) {
      console.error("Error updating donation status:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update donation status" },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error processing callback:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to process callback",
      },
      { status: 500 }
    );
  }
}
