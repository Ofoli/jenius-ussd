import type winston from "winston";
import { NaloPaymentGateway } from "@/services/gateway";
import { type RedisCache, redisCache } from "@/utils/cache";
import { Request } from "@/utils/requests";

export class PaymentTokenService {
	KEY: string = "nalo:token";
	TTL: number = 10 * 60 * 1000; //1 hour
	private readonly cache: RedisCache = redisCache;
	private readonly gateway = NaloPaymentGateway;

	protected readonly logger: winston.Logger;

	constructor(logger: winston.Logger) {
		this.logger = logger;
	}

	public async retrieve() {
		const token = await this.cache.get<string>(this.KEY);
		if (token !== null) return token;
		const response = await this.createNew();
		return response?.token;
	}

	private async createNew() {
		const url = `${this.gateway.url}/generate-payment-token/`;
		const response = await Request.post(
			url,
			{
				merchant_id: this.gateway.merchant,
			},
			{ auth: this.gateway.auth },
		);

		if (!response.status) {
			this.logger.error({
				action: "generate token",
				details: response,
				data: { url, auth: this.gateway.auth },
			});
			return null;
		}

		return response.data.data as { token: string };
	}
}
