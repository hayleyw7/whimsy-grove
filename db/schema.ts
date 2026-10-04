import { sqliteTable, text, integer, index, primaryKey, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const drawings = sqliteTable('drawings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  sceneJson: text('scene_json').notNull(),
  thumbnailKey: text('thumbnail_key').notNull(),
  title: text('title').notNull(),
  albumTitle: text('album_title'),
  historyNumber: integer('history_number'),
  createdAt: integer('created_at').notNull(),
  isAlbum: integer('is_album', { mode: 'boolean' }).notNull().default(false),
  isHistory: integer('is_history', { mode: 'boolean' }).notNull().default(false),
}, (table) => [
  uniqueIndex('drawings_user_history_number').on(table.userId, table.historyNumber),
  index('drawings_user_album_created').on(table.userId, table.isAlbum, table.createdAt),
  index('drawings_user_history_created').on(table.userId, table.isHistory, table.createdAt),
]);

export const favoriteItems = sqliteTable('favorite_items', {
  userId: text('user_id').notNull(),
  itemId: text('item_id').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => [primaryKey({ columns: [table.userId, table.itemId] })]);

export const drawingSequences = sqliteTable('drawing_sequences', {
  userId: text('user_id').primaryKey(),
  historyCount: integer('history_count').notNull().default(0),
  albumCount: integer('album_count').notNull().default(0),
});

export const currentDrafts = sqliteTable('current_drafts', {
  userId: text('user_id').primaryKey(),
  sceneJson: text('scene_json').notNull(),
  editId: text('edit_id').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const achievementBadges = sqliteTable('achievement_badges', {
  userId: text('user_id').notNull(),
  badgeId: text('badge_id').notNull(),
  earnedAt: integer('earned_at').notNull(),
}, table => [primaryKey({ columns: [table.userId, table.badgeId] })]);

export const achievementCreations = sqliteTable('achievement_creations', {
  userId: text('user_id').notNull(),
  creationId: text('creation_id').notNull(),
  contentHash: text('content_hash').notNull(),
  savedAt: integer('saved_at').notNull(),
}, table => [primaryKey({ columns: [table.userId, table.creationId] }), uniqueIndex('achievement_creation_content').on(table.userId, table.contentHash)]);

export const achievementBiomes = sqliteTable('achievement_biomes', {
  userId: text('user_id').notNull(),
  biomeId: text('biome_id').notNull(),
  savedAt: integer('saved_at').notNull(),
}, table => [primaryKey({ columns: [table.userId, table.biomeId] })]);

export const achievementScans = sqliteTable('achievement_scans', {
  userId: text('user_id').notNull(),
  drawingId: text('drawing_id').notNull(),
}, table => [primaryKey({ columns: [table.userId, table.drawingId] })]);

export const achievementContents = sqliteTable('achievement_contents', {
  userId: text('user_id').notNull(),
  contentHash: text('content_hash').notNull(),
}, table => [primaryKey({ columns: [table.userId, table.contentHash] })]);

export const promptCompletions = sqliteTable('prompt_completions', {
  userId: text('user_id').notNull(),
  promptId: text('prompt_id').notNull(),
  completedAt: integer('completed_at').notNull(),
}, table => [primaryKey({ columns: [table.userId, table.promptId] })]);
