CREATE TABLE `drawing_sequences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`history_count` integer DEFAULT 0 NOT NULL,
	`album_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE `drawings` ADD `album_title` text;--> statement-breakpoint
ALTER TABLE `drawings` ADD `history_number` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `drawings_user_history_number` ON `drawings` (`user_id`,`history_number`);--> statement-breakpoint
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at, id) AS number
  FROM drawings WHERE is_history = 1
)
UPDATE drawings SET history_number = (SELECT number FROM ranked WHERE ranked.id = drawings.id),
  title = 'Auto save ' || (SELECT number FROM ranked WHERE ranked.id = drawings.id)
WHERE is_history = 1;
--> statement-breakpoint
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at, id) AS number
  FROM drawings WHERE is_album = 1 AND is_history = 0
)
UPDATE drawings SET album_title = 'Grove ' || (SELECT number FROM ranked WHERE ranked.id = drawings.id),
  title = 'Grove ' || (SELECT number FROM ranked WHERE ranked.id = drawings.id)
WHERE is_album = 1 AND is_history = 0;
--> statement-breakpoint
UPDATE drawings SET album_title = title WHERE is_album = 1 AND album_title IS NULL;
--> statement-breakpoint
INSERT INTO drawing_sequences (user_id, history_count, album_count)
SELECT user_id, COALESCE(MAX(history_number), 0), SUM(CASE WHEN is_album = 1 AND is_history = 0 THEN 1 ELSE 0 END)
FROM drawings GROUP BY user_id;
