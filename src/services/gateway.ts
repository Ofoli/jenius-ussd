import { config } from "@/config/";
import type { Gateway } from "@/services/types";

export const NaloPaymentGateway: Gateway = {
	url: config.payment.NALO_HOST,
	merchant: config.payment.NALO_MERCHANT,
	auth: config.payment.NALO_AUTH_KEY,
	secret: config.payment.NALO_SECRET_KEY,
	callbackUrl: config.payment.NALO_CALLBACK_URL.toString(),
};
