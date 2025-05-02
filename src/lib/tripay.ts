import axios from "axios";
import crypto from "crypto-js";

interface TripayConfig {
    apiKey: string;
    privateKey: string;
    merchantCode: string;
    apiUrl: string;
}

interface PaymentChannel {
    code: string;
    name: string;
    type: string;
    fee_merchant: {
        flat: number;
        percent: number;
    };
    fee_customer: {
        flat: number;
        percent: number;
    };
    total_fee: {
        flat: number;
        percent: string;
    };
    minimum_fee?: number;
    maximum_fee?: number;
    minimum_amount: number;
    maximum_amount: number;
    icon_url: string;
    active: boolean;
}

interface OrderItem {
    sku: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
    product_url?: string;
    image_url?: string;
}

interface CreateTransactionParams {
    method: string;
    merchant_ref: string;
    amount: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    order_items: OrderItem[];
    callback_url?: string;
    return_url?: string;
    expired_time?: number;
    signature?: string;
}

interface TransactionDetail {
    reference: string;
    merchant_ref: string;
    payment_selection_type: string;
    payment_method: string;
    payment_name: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    callback_url: string;
    return_url: string;
    amount: number;
    fee_merchant: number;
    fee_customer: number;
    total_fee: number;
    amount_received: number;
    pay_code: string;
    pay_url: string | null;
    checkout_url: string;
    status: string;
    paid_at: string | null;
    expired_time: number;
    order_items: OrderItem[];
    instructions: {
        title: string;
        steps: string[];
    }[];
}

export class TripayService {
    private config: TripayConfig;

    constructor() {
        this.config = {
            apiKey: process.env.TRIPAY_API_KEY || "",
            privateKey: process.env.TRIPAY_PRIVATE_KEY || "",
            merchantCode: process.env.TRIPAY_MERCHANT_CODE || "",
            apiUrl:
                process.env.NEXT_PUBLIC_TRIPAY_API_URL ||
                "https://tripay.co.id/api",
        };
    }

    /**
     * Get available payment channels
     */
    async getPaymentChannels(): Promise<PaymentChannel[]> {
        try {
            console.log(
                "Making request to:",
                `${this.config.apiUrl}/merchant/payment-channel`,
            );

            const response = await axios.get(
                `${this.config.apiUrl}/merchant/payment-channel`,
                {
                    headers: {
                        Authorization: `Bearer ${this.config.apiKey}`,
                    },
                },
            );

            console.log("Response status:", response.status);
            console.log("Response data:", response.data);

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error(
                response.data.message || "Failed to get payment channels",
            );
        } catch (error: any) {
            console.error("Error getting payment channels:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                console.error("Response headers:", error.response.headers);
            } else if (error.request) {
                console.error("No response received:", error.request);
            }
            throw new Error(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to get payment channels",
            );
        }
    }

    /**
     * Calculate transaction fee
     */
    async calculateFee(amount: number, code: string): Promise<any> {
        try {
            const response = await axios.get(
                `${this.config.apiUrl}/merchant/fee-calculator`,
                {
                    params: {
                        amount,
                        code,
                    },
                    headers: {
                        Authorization: `Bearer ${this.config.apiKey}`,
                    },
                },
            );

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Failed to calculate fee");
        } catch (error: any) {
            console.error("Error calculating fee:", error);
            throw new Error(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to calculate fee",
            );
        }
    }

    /**
     * Create signature for transaction
     */
    createSignature(
        merchantRef: string,
        amount: number,
        method: string,
    ): string {
        const signatureString = `${this.config.merchantCode}${merchantRef}${amount}`;
        return crypto
            .HmacSHA256(signatureString, this.config.privateKey)
            .toString();
    }

    /**
     * Create a new transaction
     */
    async createTransaction(params: CreateTransactionParams): Promise<any> {
        try {
            // Create signature if not provided
            if (!params.signature) {
                params.signature = this.createSignature(
                    params.merchant_ref,
                    params.amount,
                    params.method,
                );
            }

            const response = await axios.post(
                `${this.config.apiUrl}/transaction/create`,
                {
                    ...params,
                    merchant_code: this.config.merchantCode,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.config.apiKey}`,
                    },
                },
            );

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error(
                response.data.message || "Failed to create transaction",
            );
        } catch (error: any) {
            console.error("Error creating transaction:", error);
            throw new Error(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to create transaction",
            );
        }
    }

    /**
     * Get transaction details
     */
    async getTransactionDetail(reference: string): Promise<TransactionDetail> {
        try {
            const response = await axios.get(
                `${this.config.apiUrl}/transaction/detail`,
                {
                    params: {
                        reference,
                    },
                    headers: {
                        Authorization: `Bearer ${this.config.apiKey}`,
                    },
                },
            );

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error(
                response.data.message || "Failed to get transaction details",
            );
        } catch (error: any) {
            console.error("Error getting transaction details:", error);
            throw new Error(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to get transaction details",
            );
        }
    }

    /**
     * Get payment instructions
     */
    async getPaymentInstructions(
        code: string,
        payCode?: string,
        amount?: number,
    ): Promise<any> {
        try {
            const params: any = { code };
            if (payCode) params.pay_code = payCode;
            if (amount) params.amount = amount;

            const response = await axios.get(
                `${this.config.apiUrl}/payment/instruction`,
                {
                    params,
                    headers: {
                        Authorization: `Bearer ${this.config.apiKey}`,
                    },
                },
            );

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error(
                response.data.message || "Failed to get payment instructions",
            );
        } catch (error: any) {
            console.error("Error getting payment instructions:", error);
            throw new Error(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to get payment instructions",
            );
        }
    }
}

export default TripayService;
