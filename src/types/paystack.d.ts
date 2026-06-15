// Type declarations for Paystack Inline JS
interface PaystackPopupConfig {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    ref?: string;
    metadata?: Record<string, unknown>;
    channels?: string[];
    label?: string;
    onClose?: () => void;
    onSuccess?: (response: PaystackSuccessResponse) => void;
    callback?: (response: PaystackSuccessResponse) => void;
}

interface PaystackSuccessResponse {
    reference: string;
    trans: string;
    status: string;
    message: string;
    transaction: string;
    trxref: string;
}

interface PaystackPopupInstance {
    openIframe: () => void;
}

interface PaystackPopStatic {
    setup: (config: PaystackPopupConfig) => PaystackPopupInstance;
}

declare global {
    interface Window {
        PaystackPop: PaystackPopStatic;
    }
}

export type { PaystackPopupConfig, PaystackSuccessResponse, PaystackPopupInstance };
