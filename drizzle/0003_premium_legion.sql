CREATE TABLE `current_drafts` (
	`user_id` text PRIMARY KEY NOT NULL,
	`scene_json` text NOT NULL,
	`edit_id` text NOT NULL,
	`updated_at` integer NOT NULL
);
