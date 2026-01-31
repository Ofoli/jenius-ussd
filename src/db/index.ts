import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { config } from "@/config";
import * as schema from "./schema";

const client = createClient({
	url: config.app.DATABASE_URL,
	authToken: config.app.DATABASE_AUTH_TOKEN,
});
export const db = drizzle(client, { schema });
