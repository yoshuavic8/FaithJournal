import { NextResponse } from "next/server";
import TripayService from "@/lib/tripay";
import { v4 as uuidv4 } from "uuid";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { method, amount, customer_name, customer_email, customer_phone } =
      body;

    if (
      !method ||
      !amount ||
      !customer_name ||
      !customer_email ||
      !customer_phone
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a unique merchant reference
    const merchantRef = `FJ-${uuidv4().substring(0, 8)}`;

    // Create order items
    const orderItems = [
      {
        sku: "DONATION",
        name: "Donation to Faith Journal",
        price: amount,
        quantity: 1,
        subtotal: amount,
      },
    ];

    // Set expiry time to 24 hours from now
    const expiredTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

    const tripay = new TripayService();
    const transaction = await tripay.createTransaction({
      method,
      merchant_ref: merchantRef,
      amount,
      customer_name,
      customer_email,
      customer_phone,
      order_items: orderItems,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/support-us/thank-you`,
      expired_time: expiredTime,
    });

    // Save transaction to database
    const { error } = await supabase.from("donations").insert({
      id: uuidv4(),
      user_id: session.user.id,
      reference: transaction.reference,
      merchant_ref: merchantRef,
      amount,
      payment_method: method,
      status: "UNPAID",
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error saving donation:", error);
      // Continue anyway, as the transaction was created successfully
    }

    return NextResponse.json({ success: true, data: transaction });
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create transaction",
      },
      { status: 500 }
    );
  }
}
