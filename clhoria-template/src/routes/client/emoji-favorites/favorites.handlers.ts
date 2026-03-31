import type { FavoriteRouteHandlerType } from "./favorites.types";

import { and, eq } from "drizzle-orm";

import db from "@/db";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { Resp } from "@/utils";
import { clientEmojis } from "@/db/schema";
import { clientEmojiFavorites } from "@/db/schema";
import logger from "@/lib/services/logger";

/** Get user's favorite emojis / 获取用户收藏的表情列表 */
export const list: FavoriteRouteHandlerType<"list"> = async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const query = c.req.valid("query");

  const { page, pageSize } = query;

  // Query user's favorites with emoji details / 查询用户的收藏（包含表情详情）
  const favorites = await db
    .select({
      userId: clientEmojiFavorites.userId,
      emojiId: clientEmojiFavorites.emojiId,
      favoritedAt: clientEmojiFavorites.favoritedAt,
      emoji: {
        id: clientEmojis.id,
        tags: clientEmojis.tags,
        url: clientEmojis.url,
        description: clientEmojis.description,
        status: clientEmojis.status,
      },
    })
    .from(clientEmojiFavorites)
    .innerJoin(clientEmojis, eq(clientEmojiFavorites.emojiId, clientEmojis.id))
    .where(eq(clientEmojiFavorites.userId, userId))
    .orderBy(clientEmojiFavorites.favoritedAt)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return c.json(Resp.ok(favorites), HttpStatusCodes.OK);
};

/** Add emoji to favorites / 添加收藏 */
export const add: FavoriteRouteHandlerType<"add"> = async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const { emojiId } = c.req.valid("json");

  // Check if emoji exists / 检查表情是否存在
  const [emoji] = await db
    .select()
    .from(clientEmojis)
    .where(eq(clientEmojis.id, emojiId))
    .limit(1);

  if (!emoji) {
    return c.json(Resp.fail("表情包不存在"), HttpStatusCodes.NOT_FOUND);
  }

  // Try to insert (will fail silently if already exists due to primary key)
  // 尝试插入（如果已存在会因为主键约束而静默失败）
  try {
    await db
      .insert(clientEmojiFavorites)
      .values({
        userId,
        emojiId,
        favoritedAt: new Date().toISOString(),
      });
  }
  catch (error) {
    // Ignore duplicate key error / 忽略重复键错误
    if (error instanceof Error && !error.message.includes("duplicate key")) {
      throw error;
    }
  }

  // Fetch the favorite record / 获取收藏记录
  const [favorite] = await db
    .select()
    .from(clientEmojiFavorites)
    .where(
      and(
        eq(clientEmojiFavorites.userId, userId),
        eq(clientEmojiFavorites.emojiId, emojiId)
      )
    )
    .limit(1);

  logger.info({ userId, emojiId }, "[EmojiFavorites]: 表情收藏成功");

  return c.json(Resp.ok(favorite), HttpStatusCodes.OK);
};

/** Remove emoji from favorites / 取消收藏 */
export const remove: FavoriteRouteHandlerType<"remove"> = async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const { emojiId } = c.req.valid("param");

  const [favorite] = await db
    .delete(clientEmojiFavorites)
    .where(
      and(
        eq(clientEmojiFavorites.userId, userId),
        eq(clientEmojiFavorites.emojiId, emojiId)
      )
    )
    .returning();

  if (!favorite) {
    return c.json(Resp.fail("收藏记录不存在"), HttpStatusCodes.NOT_FOUND);
  }

  logger.info({ userId, emojiId }, "[EmojiFavorites]: 表情取消收藏");

  return c.json(Resp.ok({ success: true }), HttpStatusCodes.OK);
};

/** Check if emoji is favorited / 检查是否已收藏 */
export const check: FavoriteRouteHandlerType<"check"> = async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const { emojiId } = c.req.valid("param");

  const [favorite] = await db
    .select()
    .from(clientEmojiFavorites)
    .where(
      and(
        eq(clientEmojiFavorites.userId, userId),
        eq(clientEmojiFavorites.emojiId, emojiId)
      )
    )
    .limit(1);

  const isFavorited = !!favorite;

  return c.json(Resp.ok({ isFavorited }), HttpStatusCodes.OK);
};
