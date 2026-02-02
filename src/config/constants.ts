export const LOGGERS = ["system", "sms"] as const;
export const STATUSES = {
	paid: "PAID",
	pending: "PENDING",
	failed: "FAILED",
} as const;
export const NETWORKS = {
	mtn: "MTN",
	at: "AIRTELTIGO",
	telecel: "VODAFONE",
} as const;
