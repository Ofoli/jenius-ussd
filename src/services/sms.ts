import { config } from "@/config";
import { getLogger } from "@/utils/logger";
import { Request } from "@/utils/requests";

abstract class SmsService {
	protected readonly logger = getLogger("sms");
	public abstract send(amount: string, msisdn: string): Promise<boolean>;
}

export class NaloSmsService extends SmsService {
	public async send(amount: string, msisdn: string) {
		const message = this.generateMessage(amount);
		return this.callApi(message, msisdn);
	}

	private async callApi(message: string, msisdn: string) {
		const event: Record<string, unknown> = {
			action: "call-nalo-sms-api",
			status: "pending",
			details: {
				message,
				msisdn,
			},
		};

		const response = await Request.post(config.sms.HOST, {
			msisdn,
			message,
			key: config.sms.KEY,
			sender_id: config.sms.SENDER,
			callback_url: config.sms.CALLBACK_URL,
		});

		event.status = response.status ? "success" : "error";
		event.response = response;
		this.logger.info(event);
		return response.status;
	}

	private generateMessage(amount: string) {
		return config.sms.TEMPLATE.replace("_amount_", amount);
	}

	public handleCallback(data: Record<string, unknown>) {
		this.logger.info({
			action: "handle-sms-callback",
			details: data,
		});
	}
}
