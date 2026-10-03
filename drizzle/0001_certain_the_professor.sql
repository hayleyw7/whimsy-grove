CREATE TABLE `favorite_items` (
	`user_id` text NOT NULL,
	`item_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `item_id`)
);
