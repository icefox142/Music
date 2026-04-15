import type { LyricsRouteHandlerType } from "./lyrics.types";

import { and, desc, eq, sql } from "drizzle-orm";

import db from "@/db";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { Resp } from "@/utils";
import { clientLyrics, clientSongs } from "@/db/schema";
import logger from "@/lib/services/logger";

/** List lyrics with filters / 歌词列表（支持筛选） */
export const list: LyricsRouteHandlerType<"list"> = async (c) => {
  const query = c.req.valid("query");
  const userId = c.get("userId");

  const { songId, language, isVerified, page = 1, limit = 20 } = query;

  try {
    // Build conditions / 构建查询条件
    const conditions = [];
    if (songId) conditions.push(eq(clientLyrics.songId, songId));
    if (language) conditions.push(eq(clientLyrics.language, language));
    if (isVerified !== undefined) conditions.push(eq(clientLyrics.isVerified, isVerified));

    // Get total count / 获取总数
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clientLyrics)
      .where(and(...conditions));

    // Get lyrics / 获取歌词
    const data = await db
      .select()
      .from(clientLyrics)
      .where(and(...conditions))
      .orderBy(desc(clientLyrics.qualityScore))
      .limit(limit)
      .offset((page - 1) * limit);

    logger.info({ userId, query }, "[Lyrics]: 获取歌词列表");

    return c.json(
      Resp.ok({
        data,
        meta: {
          total: count,
          page,
          limit,
        },
      }),
      HttpStatusCodes.OK
    );
  } catch (error) {
    logger.error({ error }, "[Lyrics]: 获取歌词列表失败");
    return c.json(
      Resp.fail("获取歌词列表失败"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

/** Get lyrics by ID / 根据ID获取歌词 */
export const get: LyricsRouteHandlerType<"get"> = async (c) => {
  const { id } = c.req.valid("param");
  const userId = c.get("userId");

  try {
    const [lyrics] = await db
      .select()
      .from(clientLyrics)
      .where(eq(clientLyrics.id, id))
      .limit(1);

    if (!lyrics) {
      return c.json(
        Resp.fail("歌词不存在"),
        HttpStatusCodes.NOT_FOUND
      );
    }

    // Increment view count / 增加查看次数
    await db
      .update(clientLyrics)
      .set({ viewCount: lyrics.viewCount + 1 })
      .where(eq(clientLyrics.id, id));

    logger.info({ userId, lyricsId: id }, "[Lyrics]: 获取歌词详情");

    return c.json(
      Resp.ok({ ...lyrics, viewCount: lyrics.viewCount + 1 }),
      HttpStatusCodes.OK
    );
  } catch (error) {
    logger.error({ error, lyricsId: id }, "[Lyrics]: 获取歌词详情失败");
    return c.json(
      Resp.fail("获取歌词详情失败"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

/** Create lyrics / 创建歌词 */
export const create: LyricsRouteHandlerType<"create"> = async (c) => {
  const userId = c.get("userId");
  const body = c.req.valid("json");

  try {
    // Check if song exists / 检查歌曲是否存在
    const [song] = await db
      .select()
      .from(clientSongs)
      .where(eq(clientSongs.id, body.songId))
      .limit(1);

    if (!song) {
      return c.json(
        Resp.fail("歌曲不存在"),
        HttpStatusCodes.BAD_REQUEST
      );
    }

    // Check if lyrics already exist / 检查歌词是否已存在
    const [existing] = await db
      .select()
      .from(clientLyrics)
      .where(eq(clientLyrics.songId, body.songId))
      .limit(1);

    if (existing) {
      return c.json(
        Resp.fail("该歌曲已存在歌词"),
        HttpStatusCodes.BAD_REQUEST
      );
    }

    // Create lyrics / 创建歌词
    const [newLyrics] = await db
      .insert(clientLyrics)
      .values({
        ...body,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    logger.info({ userId, songId: body.songId }, "[Lyrics]: 创建歌词");

    return c.json(
      Resp.ok(newLyrics),
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    logger.error({ error, userId, body }, "[Lyrics]: 创建歌词失败");
    return c.json(
      Resp.fail("创建歌词失败"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

/** Update lyrics / 更新歌词 */
export const update: LyricsRouteHandlerType<"update"> = async (c) => {
  const { id } = c.req.valid("param");
  const userId = c.get("userId");
  const body = c.req.valid("json");

  try {
    // Check if lyrics exist / 检查歌词是否存在
    const [existing] = await db
      .select()
      .from(clientLyrics)
      .where(eq(clientLyrics.id, id))
      .limit(1);

    if (!existing) {
      return c.json(
        Resp.fail("歌词不存在"),
        HttpStatusCodes.NOT_FOUND
      );
    }

    // Update lyrics / 更新歌词
    const [updatedLyrics] = await db
      .update(clientLyrics)
      .set({
        ...body,
        updatedBy: userId,
      })
      .where(eq(clientLyrics.id, id))
      .returning();

    logger.info({ userId, lyricsId: id }, "[Lyrics]: 更新歌词");

    return c.json(
      Resp.ok(updatedLyrics),
      HttpStatusCodes.OK
    );
  } catch (error) {
    logger.error({ error, lyricsId: id, userId, body }, "[Lyrics]: 更新歌词失败");
    return c.json(
      Resp.fail("更新歌词失败"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

/** Delete lyrics / 删除歌词 */
export const remove: LyricsRouteHandlerType<"remove"> = async (c) => {
  const { id } = c.req.valid("param");
  const userId = c.get("userId");

  try {
    // Check if lyrics exist / 检查歌词是否存在
    const [existing] = await db
      .select()
      .from(clientLyrics)
      .where(eq(clientLyrics.id, id))
      .limit(1);

    if (!existing) {
      return c.json(
        Resp.fail("歌词不存在"),
        HttpStatusCodes.NOT_FOUND
      );
    }

    // Delete lyrics / 删除歌词
    await db.delete(clientLyrics).where(eq(clientLyrics.id, id));

    logger.info({ userId, lyricsId: id }, "[Lyrics]: 删除歌词");

    return c.json(
      Resp.ok({ success: true }),
      HttpStatusCodes.OK
    );
  } catch (error) {
    logger.error({ error, lyricsId: id, userId }, "[Lyrics]: 删除歌词失败");
    return c.json(
      Resp.fail("删除歌词失败"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
