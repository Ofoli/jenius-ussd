import { and, count, eq, type SQL } from "drizzle-orm";
import { STATUSES } from "@/config/constants";
import { db } from "@/db/index";
import { transactions } from "@/db/schema";
import type { TransactionQuery } from "@/features/payment/schema";

type CreateTransactionData = typeof transactions.$inferInsert;
type UpdateTransactionData = {
	externalId?: string;
	status?: "PAID" | "FAILED";
};

export class TransactionService {
	public async create(data: CreateTransactionData) {
		const [trans] = await db
			.insert(transactions)
			.values(data)
			.returning({ id: transactions.id, reference: transactions.reference });
		return trans;
	}

	public async update(id: string, data: UpdateTransactionData) {
		await db.update(transactions).set(data).where(eq(transactions.id, id));
	}

	public async retrievePending(externalId: string) {
		return await db.query.transactions.findFirst({
			where: (transaction, { eq, and }) =>
				and(eq(transaction.externalId, externalId), eq(transaction.status, STATUSES.pending)),
			columns: {
				id: true,
				msisdn: true,
				amount: true,
				externalId: true,
			},
		});
	}

	public static async retrieveByNumber(msisdn: string) {
		try {
			const trans = await db.query.transactions.findMany({
				where: (transaction, { eq }) => eq(transaction.msisdn, msisdn),
			});

			return { status: Array.isArray(trans), data: trans };
		} catch (_) {
			return { status: false, data: null };
		}
	}

	public static async query(params: TransactionQuery) {
		const conditions: SQL[] = [];

		if (params.status) {
			conditions.push(eq(transactions.status, params.status));
		}

		if (params.msisdn) {
			conditions.push(eq(transactions.msisdn, params.msisdn));
		}

		const where = conditions.length > 0 ? and(...conditions) : undefined;

		const [data, [{ total }]] = await Promise.all([
			db
				.select()
				.from(transactions)
				.where(where)
				.limit(params.limit)
				.offset(params.offset)
				.orderBy(transactions.createdAt),
			db.select({ total: count() }).from(transactions).where(where),
		]);

		return { data, total };
	}
}
