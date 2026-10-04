CREATE TABLE `achievement_observations` (
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`value` text NOT NULL,
	`saved_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `kind`, `value`)
);
--> statement-breakpoint
ALTER TABLE `achievement_scans` ADD `rule_version` integer DEFAULT 1 NOT NULL;