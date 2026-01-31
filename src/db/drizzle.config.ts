import { defineConfig } from "drizzle-kit";
import { config } from "@/config";

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./src/db/migrations",
	dbCredentials: {
		url: config.app.DATABASE_URL,
	},
	dialect: "sqlite",
	verbose: true,
	strict: true,
});
