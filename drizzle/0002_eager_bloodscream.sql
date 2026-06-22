CREATE TABLE `stripe_subscription` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`stripe_customer_id` text NOT NULL,
	`status` text DEFAULT 'none' NOT NULL,
	`price_id` text,
	`current_period_start` integer,
	`current_period_end` integer,
	`cancel_at_period_end` integer DEFAULT false,
	`payment_method_brand` text,
	`payment_method_last4` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `stripe_subscription_userId_idx` ON `stripe_subscription` (`user_id`);--> statement-breakpoint
CREATE INDEX `stripe_subscription_customerId_idx` ON `stripe_subscription` (`stripe_customer_id`);--> statement-breakpoint
ALTER TABLE `user` ADD `stripe_customer_id` text;