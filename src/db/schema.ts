import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { NETWORKS, STATUSES } from "../config/constants";

const statusEnum = Object.values(STATUSES) as [string, ...string[]];
const networkEnum = Object.values(NETWORKS) as [string, ...string[]];

export const transactions = sqliteTable("transactions", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	msisdn: text("msisdn").notNull(),
	name: text("name").notNull().default("Anonymous"),
	amount: integer("amount").notNull(),
	reference: text("reference")
		.notNull()
		.unique()
		.$defaultFn(() => nanoid(15)),
	externalId: text("external_id").unique(),
	network: text("network", { enum: networkEnum }).notNull(),
	retry: integer("retry").notNull().default(0),
	status: text("status", { enum: statusEnum }).notNull().default(STATUSES.pending),
	createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text("updated_at")
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => new Date().toISOString()),
});
