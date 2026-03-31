import type { PlaylistSongRouteHandlerType } from "./playlist-songs.types";

import { and, eq, sql } from "drizzle-orm";

import db from "@/db";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { Resp } from "@/utils";
import { clientPlaylistSongs, clientPlaylists, clientSongs } from "@/db/schema";
import logger from "@/lib/services/logger";

/** Get playlist songs / 获取歌单中的歌曲列表 */
export const list: PlaylistSongRouteHandlerType<"list"> = async (c) => {
  const { id } = c.req.valid("param");

  // Check if playlist exists / 检查歌单是否存在
  const [playlist] = await db
    .select()
    .from(clientPlaylists)
    .where(eq(clientPlaylists.id, id))
    .limit(1);

  if (!playlist) {
    return c.json(Resp.fail("歌单不存在"), HttpStatusCodes.NOT_FOUND);
  }

  // Get playlist songs with song details / 获取歌单歌曲及歌曲详情
  const playlistSongs = await db
    .select({
      id: clientPlaylistSongs.id,
      playlistId: clientPlaylistSongs.playlistId,
      songId: clientPlaylistSongs.songId,
      position: clientPlaylistSongs.position,
      addedAt: clientPlaylistSongs.addedAt,
      song: {
        id: clientSongs.id,
        title: clientSongs.title,
        artist: clientSongs.artist,
        coverUrl: clientSongs.coverUrl,
        audioUrl: clientSongs.audioUrl,
        duration: clientSongs.duration,
        genre: clientSongs.genre,
        language: clientSongs.language,
      },
    })
    .from(clientPlaylistSongs)
    .leftJoin(clientSongs, eq(clientPlaylistSongs.songId, clientSongs.id))
    .where(eq(clientPlaylistSongs.playlistId, id))
    .orderBy(clientPlaylistSongs.position);

  return c.json(Resp.ok(playlistSongs), HttpStatusCodes.OK);
};

/** Add song to playlist / 添加歌曲到歌单 */
export const add: PlaylistSongRouteHandlerType<"add"> = async (c) => {
  const { id } = c.req.valid("param");
  const { songId, position } = c.req.valid("json");
  const { sub } = c.get("jwtPayload");

  // Check ownership / 检查所有权
  const [playlist] = await db
    .select()
    .from(clientPlaylists)
    .where(eq(clientPlaylists.id, id))
    .limit(1);

  if (!playlist) {
    return c.json(Resp.fail("歌单不存在"), HttpStatusCodes.NOT_FOUND);
  }

  if (playlist.userId !== sub) {
    return c.json(Resp.fail("无权操作此歌单"), HttpStatusCodes.FORBIDDEN);
  }

  // Check if song exists / 检查歌曲是否存在
  const [song] = await db
    .select()
    .from(clientSongs)
    .where(eq(clientSongs.id, songId))
    .limit(1);

  if (!song) {
    return c.json(Resp.fail("歌曲不存在"), HttpStatusCodes.NOT_FOUND);
  }

  // Check if song already in playlist / 检查歌曲是否已在歌单中
  const [existing] = await db
    .select()
    .from(clientPlaylistSongs)
    .where(
      and(
        eq(clientPlaylistSongs.playlistId, id),
        eq(clientPlaylistSongs.songId, songId)
      )
    )
    .limit(1);

  if (existing) {
    return c.json(Resp.fail("歌曲已存在于歌单中"), HttpStatusCodes.CONFLICT);
  }

  // Get max position / 获取最大位置
  const [{ maxPosition }] = await db
    .select({ maxPosition: sql<number>`max(${clientPlaylistSongs.position})` })
    .from(clientPlaylistSongs)
    .where(eq(clientPlaylistSongs.playlistId, id));

  const newPosition = position ?? (maxPosition ?? -1) + 1;

  // Add song to playlist / 添加歌曲到歌单
  const [playlistSong] = await db
    .insert(clientPlaylistSongs)
    .values({
      playlistId: id,
      songId,
      position: newPosition,
    })
    .returning();

  // Update playlist song count / 更新歌单歌曲数
  await db
    .update(clientPlaylists)
    .set({ songCount: playlist.songCount + 1 })
    .where(eq(clientPlaylists.id, id));

  logger.info({ playlistId: id, songId, position: newPosition }, "[PlaylistSongs]: 歌曲添加到歌单成功");

  // Return with song details / 返回包含歌曲详情
  const [result] = await db
    .select({
      id: clientPlaylistSongs.id,
      playlistId: clientPlaylistSongs.playlistId,
      songId: clientPlaylistSongs.songId,
      position: clientPlaylistSongs.position,
      addedAt: clientPlaylistSongs.addedAt,
      song: {
        id: clientSongs.id,
        title: clientSongs.title,
        artist: clientSongs.artist,
        coverUrl: clientSongs.coverUrl,
        audioUrl: clientSongs.audioUrl,
        duration: clientSongs.duration,
        genre: clientSongs.genre,
        language: clientSongs.language,
      },
    })
    .from(clientPlaylistSongs)
    .leftJoin(clientSongs, eq(clientPlaylistSongs.songId, clientSongs.id))
    .where(eq(clientPlaylistSongs.id, playlistSong.id))
    .limit(1);

  return c.json(Resp.ok(result), HttpStatusCodes.OK);
};

/** Batch add songs / 批量添加歌曲 */
export const batchAdd: PlaylistSongRouteHandlerType<"batchAdd"> = async (c) => {
  const { id } = c.req.valid("param");
  const { songIds } = c.req.valid("json");
  const { sub } = c.get("jwtPayload");

  // Check ownership / 检查所有权
  const [playlist] = await db
    .select()
    .from(clientPlaylists)
    .where(eq(clientPlaylists.id, id))
    .limit(1);

  if (!playlist) {
    return c.json(Resp.fail("歌单不存在"), HttpStatusCodes.NOT_FOUND);
  }

  if (playlist.userId !== sub) {
    return c.json(Resp.fail("无权操作此歌单"), HttpStatusCodes.FORBIDDEN);
  }

  // Get existing song IDs / 获取已存在的歌曲ID
  const existingSongs = await db
    .select({ songId: clientPlaylistSongs.songId })
    .from(clientPlaylistSongs)
    .where(eq(clientPlaylistSongs.playlistId, id));

  const existingSongIds = new Set(existingSongs.map(s => s.songId));
  const newSongIds = songIds.filter(id => !existingSongIds.has(id));

  if (newSongIds.length === 0) {
    return c.json(Resp.ok({ count: 0, added: [] }), HttpStatusCodes.OK);
  }

  // Get max position / 获取最大位置
  const [{ maxPosition }] = await db
    .select({ maxPosition: sql<number>`max(${clientPlaylistSongs.position})` })
    .from(clientPlaylistSongs)
    .where(eq(clientPlaylistSongs.playlistId, id));

  // Insert new songs / 插入新歌曲
  const values = newSongIds.map((songId, index) => ({
    playlistId: id,
    songId,
    position: (maxPosition ?? -1) + 1 + index,
  }));

  const added = await db
    .insert(clientPlaylistSongs)
    .values(values)
    .returning();

  // Update playlist song count / 更新歌单歌曲数
  await db
    .update(clientPlaylists)
    .set({ songCount: playlist.songCount + added.length })
    .where(eq(clientPlaylists.id, id));

  logger.info({ playlistId: id, count: added.length }, "[PlaylistSongs]: 批量添加歌曲成功");

  return c.json(Resp.ok({ count: added.length, added }), HttpStatusCodes.OK);
};

/** Remove song from playlist / 从歌单移除歌曲 */
export const remove: PlaylistSongRouteHandlerType<"remove"> = async (c) => {
  const { id, songId } = c.req.valid("param");
  const { sub } = c.get("jwtPayload");

  // Check ownership / 检查所有权
  const [playlist] = await db
    .select()
    .from(clientPlaylists)
    .where(eq(clientPlaylists.id, id))
    .limit(1);

  if (!playlist) {
    return c.json(Resp.fail("歌单不存在"), HttpStatusCodes.NOT_FOUND);
  }

  if (playlist.userId !== sub) {
    return c.json(Resp.fail("无权操作此歌单"), HttpStatusCodes.FORBIDDEN);
  }

  // Delete song from playlist / 从歌单删除歌曲
  const [deleted] = await db
    .delete(clientPlaylistSongs)
    .where(
      and(
        eq(clientPlaylistSongs.playlistId, id),
        eq(clientPlaylistSongs.songId, songId)
      )
    )
    .returning();

  if (!deleted) {
    return c.json(Resp.fail("歌曲不在歌单中"), HttpStatusCodes.NOT_FOUND);
  }

  // Update playlist song count / 更新歌单歌曲数
  await db
    .update(clientPlaylists)
    .set({ songCount: sql<number>`GREATEST(${clientPlaylists.songCount} - 1, 0)` })
    .where(eq(clientPlaylists.id, id));

  logger.info({ playlistId: id, songId }, "[PlaylistSongs]: 从歌单移除歌曲成功");

  return c.json(Resp.ok({ success: true }), HttpStatusCodes.OK);
};

/** Batch remove songs / 批量移除歌曲 */
export const batchRemove: PlaylistSongRouteHandlerType<"batchRemove"> = async (c) => {
  const { id } = c.req.valid("param");
  const { songIds } = c.req.valid("json");
  const { sub } = c.get("jwtPayload");

  // Check ownership / 检查所有权
  const [playlist] = await db
    .select()
    .from(clientPlaylists)
    .where(eq(clientPlaylists.id, id))
    .limit(1);

  if (!playlist) {
    return c.json(Resp.fail("歌单不存在"), HttpStatusCodes.NOT_FOUND);
  }

  if (playlist.userId !== sub) {
    return c.json(Resp.fail("无权操作此歌单"), HttpStatusCodes.FORBIDDEN);
  }

  // Delete songs from playlist / 从歌单删除歌曲
  const result = await db
    .delete(clientPlaylistSongs)
    .where(
      and(
        eq(clientPlaylistSongs.playlistId, id),
        sql`${clientPlaylistSongs.songId} = ANY(${songIds})`
      )
    )
    .returning();

  // Update playlist song count / 更新歌单歌曲数
  await db
    .update(clientPlaylists)
    .set({ songCount: sql<number>`GREATEST(${clientPlaylists.songCount} - ${result.length}, 0)` })
    .where(eq(clientPlaylists.id, id));

  logger.info({ playlistId: id, count: result.length }, "[PlaylistSongs]: 批量移除歌曲成功");

  return c.json(Resp.ok({ count: result.length }), HttpStatusCodes.OK);
};

/** Update song position / 更新歌曲位置 */
export const update: PlaylistSongRouteHandlerType<"update"> = async (c) => {
  const { id, songId } = c.req.valid("param");
  const { position } = c.req.valid("json");
  const { sub } = c.get("jwtPayload");

  // Check ownership / 检查所有权
  const [playlist] = await db
    .select()
    .from(clientPlaylists)
    .where(eq(clientPlaylists.id, id))
    .limit(1);

  if (!playlist) {
    return c.json(Resp.fail("歌单不存在"), HttpStatusCodes.NOT_FOUND);
  }

  if (playlist.userId !== sub) {
    return c.json(Resp.fail("无权操作此歌单"), HttpStatusCodes.FORBIDDEN);
  }

  // Update position / 更新位置
  const [updated] = await db
    .update(clientPlaylistSongs)
    .set({ position })
    .where(
      and(
        eq(clientPlaylistSongs.playlistId, id),
        eq(clientPlaylistSongs.songId, songId)
      )
    )
    .returning();

  if (!updated) {
    return c.json(Resp.fail("歌曲不在歌单中"), HttpStatusCodes.NOT_FOUND);
  }

  logger.info({ playlistId: id, songId, position }, "[PlaylistSongs]: 更新歌曲位置成功");

  return c.json(Resp.ok(updated), HttpStatusCodes.OK);
};

/** Batch update positions / 批量更新歌曲位置 */
export const batchUpdate: PlaylistSongRouteHandlerType<"batchUpdate"> = async (c) => {
  const { id } = c.req.valid("param");
  const { updates } = c.req.valid("json");
  const { sub } = c.get("jwtPayload");

  // Check ownership / 检查所有权
  const [playlist] = await db
    .select()
    .from(clientPlaylists)
    .where(eq(clientPlaylists.id, id))
    .limit(1);

  if (!playlist) {
    return c.json(Resp.fail("歌单不存在"), HttpStatusCodes.NOT_FOUND);
  }

  if (playlist.userId !== sub) {
    return c.json(Resp.fail("无权操作此歌单"), HttpStatusCodes.FORBIDDEN);
  }

  // Batch update positions / 批量更新位置
  for (const { songId, position } of updates) {
    await db
      .update(clientPlaylistSongs)
      .set({ position })
      .where(
        and(
          eq(clientPlaylistSongs.playlistId, id),
          eq(clientPlaylistSongs.songId, songId)
        )
      );
  }

  logger.info({ playlistId: id, count: updates.length }, "[PlaylistSongs]: 批量更新歌曲位置成功");

  return c.json(Resp.ok({ count: updates.length }), HttpStatusCodes.OK);
};
