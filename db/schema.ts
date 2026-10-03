import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const drawings = sqliteTable('drawings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  sceneJson: text('scene_json').notNull(),
  thumbnailKey: text('thumbnail_key').notNull(),
  title: text('title').notNull(),
  createdAt: integer('created_at').notNull(),
  isAlbum: integer('is_album', { mode: 'boolean' }).notNull().default(false),
  isHistory: integer('is_history', { mode: 'boolean' }).notNull().default(false),
}, (table) => [
  index('drawings_user_album_created').on(table.userId, table.isAlbum, table.createdAt),
  index('drawings_user_history_created').on(table.userId, table.isHistory, table.createdAt),
]);
