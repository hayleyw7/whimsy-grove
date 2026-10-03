CREATE TABLE `drawings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`scene_json` text NOT NULL,
	`thumbnail_key` text NOT NULL,
	`title` text NOT NULL,
	`created_at` integer NOT NULL,
	`is_album` integer DEFAULT false NOT NULL,
	`is_history` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `drawings_user_album_created` ON `drawings` (`user_id`,`is_album`,`created_at`);--> statement-breakpoint
CREATE INDEX `drawings_user_history_created` ON `drawings` (`user_id`,`is_history`,`created_at`);