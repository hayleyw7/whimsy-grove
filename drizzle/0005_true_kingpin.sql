CREATE TABLE `achievement_contents` (
	`user_id` text NOT NULL,
	`content_hash` text NOT NULL,
	PRIMARY KEY(`user_id`, `content_hash`)
);
