export type Gateway = {
	url: string;
	merchant: string;
	auth: string;
	secret: string;
	callbackUrl: string;
};

export type NaloResponse = {
	success: boolean;
	data: {
		order_id: string;
		status: string;
		amount: number;
		timestamp: string;
		otp_code: string;
	};
};

export type CallbackData = {
	order_id: string;
	status: "COMPLETED" | "FAILED";
	amount: string;
	charges: string;
	amount_after_charges: string;
};

export type PaymentData = {
	name: string;
	msisdn: string;
	amount: number;
	network: string;
};
