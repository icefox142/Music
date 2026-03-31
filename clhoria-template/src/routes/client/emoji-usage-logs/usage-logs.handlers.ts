import type { UsageLogsRouteHandlerType } from "./usage-logs.types";

import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";

import db from "@/db";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { Resp } from "@/utils";
import { clientEmojiUsageLogs, clientEmojis } from "@/db/schema";
import logger from "@/lib/services/logger";

/** Record emoji usage / 记录表情使用 */
export const record: UsageLogsRouteHandlerType<"record"> = async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const body = c.req.valid("json");

  const { emojiId, context, targetId, count } = body;

  await db.insert(clientEmojiUsageLogs).values({
    userId,
    emojiId,
    context,
    targetId,
    count,
    usedAt: new Date().toISOString(),
  });

  logger.info({ userId, emojiId, context, count }, "[EmojiUsageLogs]: 表情使用记录成功");

  return c.json(Resp.ok({ success: true }), HttpStatusCodes.OK);
};

/** Batch record emoji usage / 批量记录表情使用 */
export const batchRecord: UsageLogsRouteHandlerType<"batchRecord"> = async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const { usages } = c.req.valid("json");

  const values = usages.map((usage) => ({
    userId,
    emojiId: usage.emojiId,
    context: usage.context,
    targetId: usage.targetId,
    count: usage.count,
    usedAt: new Date().toISOString(),
  }));

  await db.insert(clientEmojiUsageLogs).values(values);

  logger.info({ userId, count: values.length }, "[EmojiUsageLogs]: 批量表情使用记录成功");

  return c.json(Resp.ok({ success: true, count: values.length }), HttpStatusCodes.OK);
};

/** Get user's usage history / 获取用户使用历史 */
export const getHistory: UsageLogsRouteHandlerType<"getHistory"> = async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const query = c.req.valid("query");

  const { page, pageSize, context, startDate, endDate } = query;

  // Build conditions / 构建查询条件
  const conditions = [eq(clientEmojiUsageLogs.userId, userId)];

  if (context) {
    conditions.push(eq(clientEmojiUsageLogs.context, context));
  }

  if (startDate) {
    conditions.push(gte(clientEmojiUsageLogs.usedAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(clientEmojiUsageLogs.usedAt, endDate));
  }

  // Get total count / 获取总数
  const [{ total }] = await db
    .select({ total: count() })
    .from(clientEmojiUsageLogs)
    .where(and(...conditions));

  // Get history / 获取历史记录
  const history = await db
    .select()
    .from(clientEmojiUsageLogs)
    .where(and(...conditions))
    .orderBy(desc(clientEmojiUsageLogs.usedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return c.json(Resp.ok({ data: history, total }), HttpStatusCodes.OK);
};

/** Get popular emojis / 获取热门表情 */
export const getPopular: UsageLogsRouteHandlerType<"getPopular"> = async (c) => {
  const query = c.req.valid("query");

  const { context, limit } = query;

  // Build conditions / 构建查询条件
  const conditions = [];

  if (context) {
    conditions.push(eq(clientEmojiUsageLogs.context, context));
  }

  // Query popular emojis with emoji details / 查询热门表情（包含表情详情）
  const popular = await db
    .select({
      emojiId: clientEmojiUsageLogs.emojiId,
      tags: clientEmojis.tags,
      url: clientEmojis.url,
      usageCount: sql<number>`sum(${clientEmojiUsageLogs.count})`.as("usageCount"),
    })
    .from(clientEmojiUsageLogs)
    .innerJoin(clientEmojis, eq(clientEmojiUsageLogs.emojiId, clientEmojis.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(clientEmojiUsageLogs.emojiId, clientEmojis.tags, clientEmojis.url)
    .orderBy(desc(sql`sum(${clientEmojiUsageLogs.count})`))
    .limit(limit);

  return c.json(Resp.ok(popular), HttpStatusCodes.OK);
};

/** Get emoji usage statistics / 获取表情使用统计 */
export const getStats: UsageLogsRouteHandlerType<"getStats"> = async (c) => {
  const { emojiId } = c.req.valid("param");

  // Check if emoji exists / 检查表情是否存在
  const [emoji] = await db
    .select()
    .from(clientEmojis)
    .where(eq(clientEmojis.id, emojiId))
    .limit(1);

  if (!emoji) {
    return c.json(Resp.fail("表情不存在"), HttpStatusCodes.NOT_FOUND);
  }

  // Get total usage count / 获取总使用次数
  const [{ totalCount }] = await db
    .select({ totalCount: sql<number>`coalesce(sum(${clientEmojiUsageLogs.count}), 0)` })
    .from(clientEmojiUsageLogs)
    .where(eq(clientEmojiUsageLogs.emojiId, emojiId));

  // Get unique user count / 获取使用人数
  const [{ uniqueUsers }] = await db
    .select({ uniqueUsers: sql<number>`count(distinct ${clientEmojiUsageLogs.userId})` })
    .from(clientEmojiUsageLogs)
    .where(eq(clientEmojiUsageLogs.emojiId, emojiId));

  // Get context breakdown / 获取场景分布
  const contextStats = await db
    .select({
      context: clientEmojiUsageLogs.context,
      count: sql<number>`sum(${clientEmojiUsageLogs.count})`,
    })
    .from(clientEmojiUsageLogs)
    .where(eq(clientEmojiUsageLogs.emojiId, emojiId))
    .groupBy(clientEmojiUsageLogs.context);

  const contextBreakdown = contextStats.reduce((acc, item) => {
    acc[item.context] = item.count;
    return acc;
  }, {} as Record<string, number>);

  const stats = {
    emojiId,
    totalCount,
    uniqueUsers,
    contextBreakdown,
  };

  return c.json(Resp.ok(stats), HttpStatusCodes.OK);
};
