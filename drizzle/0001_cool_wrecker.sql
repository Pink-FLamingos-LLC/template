ALTER TABLE `apikey` ADD `start` text;--> statement-breakpoint
ALTER TABLE `apikey` ADD `refill_interval` integer;--> statement-breakpoint
ALTER TABLE `apikey` ADD `refill_amount` integer;--> statement-breakpoint
ALTER TABLE `apikey` ADD `last_refill_at` integer;--> statement-breakpoint
ALTER TABLE `apikey` ADD `rate_limit_enabled` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `apikey` ADD `rate_limit_time_window` integer DEFAULT 86400000;--> statement-breakpoint
ALTER TABLE `apikey` ADD `rate_limit_max` integer DEFAULT 10;--> statement-breakpoint
ALTER TABLE `apikey` ADD `request_count` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `apikey` ADD `remaining` integer;--> statement-breakpoint
ALTER TABLE `apikey` ADD `last_request` integer;--> statement-breakpoint
ALTER TABLE `apikey` ADD `expires_at` integer;--> statement-breakpoint
ALTER TABLE `apikey` ADD `permissions` text;--> statement-breakpoint
ALTER TABLE `apikey` ADD `metadata` text;