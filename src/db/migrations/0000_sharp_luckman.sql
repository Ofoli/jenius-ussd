CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`msisdn` text NOT NULL,
	`amount` integer NOT NULL,
	`reference` text NOT NULL,
	`external_id` text,
	`network` text NOT NULL,
	`retry` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_reference_unique` ON `transactions` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_external_id_unique` ON `transactions` (`external_id`);