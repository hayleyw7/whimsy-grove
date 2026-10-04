CREATE TABLE `achievement_badges` (
	`user_id` text NOT NULL,
	`badge_id` text NOT NULL,
	`earned_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `badge_id`)
);
--> statement-breakpoint
CREATE TABLE `achievement_biomes` (
	`user_id` text NOT NULL,
	`biome_id` text NOT NULL,
	`saved_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `biome_id`)
);
--> statement-breakpoint
CREATE TABLE `achievement_creations` (
	`user_id` text NOT NULL,
	`creation_id` text NOT NULL,
	`content_hash` text NOT NULL,
	`saved_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `creation_id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `achievement_creation_content` ON `achievement_creations` (`user_id`,`content_hash`);--> statement-breakpoint
CREATE TABLE `achievement_scans` (
	`user_id` text NOT NULL,
	`drawing_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `drawing_id`)
);
--> statement-breakpoint
CREATE TABLE `prompt_completions` (
	`user_id` text NOT NULL,
	`prompt_id` text NOT NULL,
	`completed_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `prompt_id`)
);
