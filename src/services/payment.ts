import crypto from "node:crypto";
import type winston from "winston";
import { NETWORKS, STATUSES } from "@/config/constants";
import { NaloPaymentGateway } from "@/services/gateway";
import { NaloSmsService } from "@/services/sms";
import { TransactionService } from "@/services/transaction";
import type { CallbackData, Gateway, NaloResponse, PaymentData } from "@/services/types";
import { getLogger } from "@/utils/logger";
import { Request } from "@/utils/requests";
import { PaymentTokenService } from "@/utils/token";

export abstract class PaymentService {
	protected readonly gateway: Gateway = NaloPaymentGateway;
	protected readonly logger: winston.Logger = getLogger("system");

	public abstract pay(data: PaymentData): void;
}

export class NaloPaymentService extends PaymentService {
	tokenService: PaymentTokenService;
	transactionService: TransactionService;
	smsService: NaloSmsService;
	constructor() {
		super();
		this.tokenService = new PaymentTokenService(this.logger);
		this.transactionService = new TransactionService();
		this.smsService = new NaloSmsService();
	}

	public pay(data: PaymentData) {
		setTimeout(() => this.processPayment(data), 0);
	}

	private toInternalStatus(status: CallbackData["status"]) {
		if (status === "COMPLETED") return STATUSES.paid;
		return STATUSES.failed;
	}

	public async processCallback(data: CallbackData) {
		try {
			const trans = await this.transactionService.retrievePending(data.order_id);
			if (!trans) return { status: 404, message: "Transaction Not Found" };
			this.logger.info({ action: "process-callback", data });

			const updatedStatus = this.toInternalStatus(data.status);
			await this.transactionService.update(trans.id, { status: updatedStatus });

			if (updatedStatus === STATUSES.paid) {
				this.smsService.send(trans.amount.toFixed(2), trans.msisdn);
			}

			return { status: 200, message: "ok" };
		} catch (err) {
			const { message } = err as Error;
			this.logger.error({
				action: "process-nalo-callback",
				details: message,
				data,
			});
			return { status: 500, message: "Something went wrong" };
		}
	}

	private generateTransHash(reference: string, data: PaymentData) {
		const message = [this.gateway.merchant, data.msisdn, data.amount.toFixed(2), reference].join(
			"",
		);

		return crypto.createHmac("sha256", this.gateway.secret).update(message).digest("hex");
	}

	private extractTransData(data: PaymentData) {
		return Object.fromEntries(
			Object.entries(data).filter(([key, _]) => key !== "description"),
		) as Omit<PaymentData, "description">;
	}

	private toExternalNetwork(network: string) {
		const networks: Record<string, string> = {
			[NETWORKS.at]: "AT",
			[NETWORKS.mtn]: "MTN",
			[NETWORKS.telecel]: "TELECEL",
		};
		return networks[network];
	}

	private generatePaymentPayload = (reference: string, data: PaymentData) => {
		return {
			reference,
			amount: data.amount,
			account_name: data.msisdn,
			account_number: data.msisdn,
			merchant_id: this.gateway.merchant,
			callback: this.gateway.callbackUrl,
			service_name: "MOMO_TRANSACTION",
			network: this.toExternalNetwork(data.network),
			trans_hash: this.generateTransHash(reference, data),
			description: "Donation payment",
		};
	};

	private async processPayment(data: PaymentData): Promise<void> {
		try {
			const trans = await this.transactionService.create(this.extractTransData(data));
			const payload = this.generatePaymentPayload(trans.reference, data);
			const response = await this.callNaloApi(payload);

			if (!response) throw new Error("Call to NaloApi failed");
			await this.transactionService.update(trans.id, {
				externalId: response.data.order_id,
			});
		} catch (err) {
			this.logger.error({
				action: "process-payment",
				details: (err as Error).message,
			});
		}
	}

	private async callNaloApi(
		payload: ReturnType<NaloPaymentService["generatePaymentPayload"]>,
	): Promise<NaloResponse | null> {
		const event: Record<string, unknown> = {
			action: "call-nalo-payment-api",
			status: "pending",
			data: payload,
			startedAt: new Date().toISOString(),
			endedAt: null,
		};

		const token = await this.tokenService.retrieve();
		if (!token) {
			event.status = "error";
			event.details = "Token generation failed";
			event.endedAt = new Date().toISOString();
			this.logger.info(event);
			throw new Error("Token generation failed");
		}

		const url = `${this.gateway.url}/collection/`;
		const response = await Request.post(url, payload, { token });
		if (!response.status) {
			event.status = "error";
			event.details = response;
			event.endedAt = new Date().toISOString();
			this.logger.info(event);
			return null;
		}

		event.status = "success";
		event.details = response;
		event.endedAt = new Date().toISOString();
		this.logger.info(event);

		return response.data as NaloResponse;
	}
}
