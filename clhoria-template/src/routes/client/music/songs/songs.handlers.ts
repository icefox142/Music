import type { SongRouteHandlerType } from "./songs.types";

import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

import db from "@/db";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { Resp } from "@/utils";
import { clientSongs } from "@/db/schema";
import logger from "@/lib/services/logger";

/** List songs with search and filters / 歌曲列表（支持搜索和筛选） */
export const list: SongRouteHandlerType<"list"> = async (c) => {
  const query = c.req.valid("query");

  const { page, pageSize, search, genre, language, status, sortBy, order } = query;

  // Build conditions / 构建查询条件
  const conditions = [];

  // Search condition (title OR artist) / 搜索条件（标题或艺术家）
  if (search) {
    conditions.push(
      or(
        ilike(clientSongs.title, `%${search}%`),
        ilike(clientSongs.artist, `%${search}%`)
      )
    );
  }

  // Genre filter / 流派筛选
  if (genre) {
    conditions.push(eq(clientSongs.genre, genre));
  }

  // Language filter / 语言筛选
  if (language) {
    conditions.push(eq(clientSongs.language, language));
  }

  // Status filter / 状态筛选
  if (status) {
    conditions.push(eq(clientSongs.status, status));
  }

  // Build orderBy / 构建排序
  let orderBy;
  switch (sortBy) {
    case "playCount":
      orderBy = clientSongs.playCount;
      break;
    case "releaseDate":
      orderBy = clientSongs.releaseDate;
      break;
    case "title":
      orderBy = clientSongs.title;
      break;
    default:
      orderBy = clientSongs.createdAt;
  }

  // Execute query / 执行查询
  const songs = await db
    .select()
    .from(clientSongs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(order === "desc" ? desc(orderBy) : orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  // Get total count / 获取总数
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clientSongs)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  c.header("x-total-count", count.toString());
  return c.json(Resp.ok(songs), HttpStatusCodes.OK);
};

/** Create new song / 创建歌曲 */
export const create: SongRouteHandlerType<"create"> = async (c) => {
  const body = c.req.valid("json");
  const { sub } = c.get("jwtPayload");

  const [song] = await db
    .insert(clientSongs)
    .values({
      ...body,
      createdBy: sub,
      updatedBy: sub,
    })
    .returning();

  logger.info({ songId: song.id, title: song.title, artist: song.artist }, "[Songs]: 歌曲创建成功");

  return c.json(Resp.ok(song), HttpStatusCodes.OK);
};

/** Get song by ID / 根据ID获取歌曲 */
export const get: SongRouteHandlerType<"get"> = async (c) => {
  const { id } = c.req.valid("param");

  const [song] = await db
    .select()
    .from(clientSongs)
    .where(eq(clientSongs.id, id))
    .limit(1);

  if (!song) {
    return c.json(Resp.fail("歌曲不存在"), HttpStatusCodes.NOT_FOUND);
  }

  return c.json(Resp.ok(song), HttpStatusCodes.OK);
};

/** Update song / 更新歌曲 */
export const update: SongRouteHandlerType<"update"> = async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const { sub } = c.get("jwtPayload");

  const [song] = await db
    .update(clientSongs)
    .set({
      ...body,
      updatedBy: sub,
    })
    .where(eq(clientSongs.id, id))
    .returning();

  if (!song) {
    return c.json(Resp.fail("歌曲不存在"), HttpStatusCodes.NOT_FOUND);
  }

  logger.info({ songId: song.id, title: song.title }, "[Songs]: 歌曲更新成功");

  return c.json(Resp.ok(song), HttpStatusCodes.OK);
};

/** Delete song / 删除歌曲 */
export const remove: SongRouteHandlerType<"remove"> = async (c) => {
  const { id } = c.req.valid("param");

  const [song] = await db
    .delete(clientSongs)
    .where(eq(clientSongs.id, id))
    .returning();

  if (!song) {
    return c.json(Resp.fail("歌曲不存在"), HttpStatusCodes.NOT_FOUND);
  }

  logger.info({ songId: song.id, title: song.title }, "[Songs]: 歌曲删除成功");

  return c.json(Resp.ok({ success: true }), HttpStatusCodes.OK);
};
