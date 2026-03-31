import { sql } from "drizzle-orm";
import { index, integer, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { clientPlaylists } from "./playlists";
import { clientSongs } from "./songs";

/**
 * Playlist songs association table / 歌单歌曲关联表
 *
 * Many-to-many relationship between playlists and songs
 * 歌单和歌曲之间的多对多关系
 */
export const clientPlaylistSongs = pgTable("client_playlist_songs", {
  /** Association record ID / 关联记录ID */
  id: uuid().primaryKey().default(sql`uuidv7()`),
  /** Playlist ID / 歌单ID */
  playlistId: uuid().notNull().references(() => clientPlaylists.id, { onDelete: "cascade" }),
  /** Song ID / 歌曲ID */
  songId: uuid().notNull().references(() => clientSongs.id, { onDelete: "restrict" }),
  /** Position in playlist / 歌曲在歌单中的位置 */
  position: integer().notNull(),
  /** When the song was added to the playlist / 添加到歌单的时间 */
  addedAt: timestamp({ mode: "string" }).$defaultFn(() => new Date().toISOString()),
}, table => [
  // Unique constraint: one song can only appear once in a playlist / 唯一约束：一首歌在一个歌单中只能出现一次
  unique("client_playlist_songs_playlist_song_unique").on(table.playlistId, table.songId),
  // Index for querying playlist songs / 查询歌单歌曲索引
  index("client_playlist_songs_playlist_position_idx").on(table.playlistId, table.position),
  // Index for querying song's playlists / 查询歌曲所在歌单索引
  index("client_playlist_songs_song_idx").on(table.songId),
  // Index for recently added / 最近添加索引
  index("client_playlist_songs_added_at_idx").on(table.addedAt.desc()),
]);

/**
 * Select Schema
 */
export const selectClientPlaylistSongsSchema = createSelectSchema(clientPlaylistSongs, {
  id: schema => schema.meta({ description: "关联记录ID" }),
  playlistId: schema => schema.meta({ description: "歌单ID" }),
  songId: schema => schema.meta({ description: "歌曲ID" }),
  position: schema => schema.meta({ description: "位置" }),
  addedAt: schema => schema.meta({ description: "添加时间" }),
});

/**
 * Insert Schema
 */
export const insertClientPlaylistSongsSchema = createInsertSchema(clientPlaylistSongs).extend({
  playlistId: z.string().uuid("歌单ID格式不正确"),
  songId: z.string().uuid("歌曲ID格式不正确"),
  position: z.number().int().min(0, "位置不能为负数"),
}).omit({
  id: true,
  addedAt: true,
});
