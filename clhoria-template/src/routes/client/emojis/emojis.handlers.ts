import type { EmojiRouteHandlerType } from "./emojis.types";

import { and, count, eq, or, sql } from "drizzle-orm";

import db from "@/db";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { Resp } from "@/utils";
import { clientEmojis } from "@/db/schema";
import logger from "@/lib/services/logger";

/** List emojis with tag filtering / 表情包列表（支持标签过滤） */
export const list: EmojiRouteHandlerType<"list"> = async (c) => {
  const query = c.req.valid("query");

  const { page, pageSize, tags, tagsAll, status } = query;

  // Build conditions / 构建查询条件
  const conditions = [];

  // Status filter / 状态过滤
  if (status) {
    conditions.push(eq(clientEmojis.status, status));
  }

  // Tag filtering (OR logic) / 标签过滤（OR 逻辑）
  // tags: ["happy", "sad"] => find emojis that contain "happy" OR "sad"
  if (tags && tags.length > 0) {
    const tagConditions = tags.map(tag =>
      // JSONB contains operator: tags @> '["tag"]'::jsonb
      sql`${clientEmojis.tags} @> ${JSON.stringify([tag])}::jsonb`
    );
    conditions.push(or(...tagConditions));
  }

  // Tag filtering (AND logic) / 标签过滤（AND 逻辑）
  // tagsAll: ["happy", "cat"] => find emojis that contain BOTH "happy" AND "cat"
  if (tagsAll && tagsAll.length > 0) {
    conditions.push(
      sql`${clientEmojis.tags} @> ${JSON.stringify(tagsAll)}::jsonb`
    );
  }

  // Get total count / 获取总数
  const [{ total }] = await db
    .select({ total: count() })
    .from(clientEmojis)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  // Execute query / 执行查询
  const emojis = await db
    .select()
    .from(clientEmojis)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(clientEmojis.createdAt)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return c.json(
    Resp.ok({
      data: emojis,
      total,
      page,
      pageSize,
    }),
    HttpStatusCodes.OK
  );
};

/** Create new emoji / 创建表情包 */
export const create: EmojiRouteHandlerType<"create"> = async (c) => {
  const body = c.req.valid("json");
  const { sub } = c.get("jwtPayload");

  const [emoji] = await db
    .insert(clientEmojis)
    .values({
      ...body,
      createdBy: sub,
      updatedBy: sub,
    })
    .returning();

  logger.info({ emojiId: emoji.id, tags: emoji.tags }, "[Emojis]: 表情包创建成功");

  return c.json(Resp.ok(emoji), HttpStatusCodes.OK);
};

/** Get emoji by ID / 根据ID获取表情包 */
export const get: EmojiRouteHandlerType<"get"> = async (c) => {
  const { id } = c.req.valid("param");

  const [emoji] = await db
    .select()
    .from(clientEmojis)
    .where(eq(clientEmojis.id, id))
    .limit(1);

  if (!emoji) {
    return c.json(Resp.fail("表情包不存在"), HttpStatusCodes.NOT_FOUND);
  }

  return c.json(Resp.ok(emoji), HttpStatusCodes.OK);
};

/** Update emoji / 更新表情包 */
export const update: EmojiRouteHandlerType<"update"> = async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const { sub } = c.get("jwtPayload");

  const [emoji] = await db
    .update(clientEmojis)
    .set({
      ...body,
      updatedBy: sub,
    })
    .where(eq(clientEmojis.id, id))
    .returning();

  if (!emoji) {
    return c.json(Resp.fail("表情包不存在"), HttpStatusCodes.NOT_FOUND);
  }

  logger.info({ emojiId: emoji.id, tags: emoji.tags }, "[Emojis]: 表情包更新成功");

  return c.json(Resp.ok(emoji), HttpStatusCodes.OK);
};

/** Delete emoji / 删除表情包 */
export const remove: EmojiRouteHandlerType<"remove"> = async (c) => {
  const { id } = c.req.valid("param");

  const [emoji] = await db
    .delete(clientEmojis)
    .where(eq(clientEmojis.id, id))
    .returning();

  if (!emoji) {
    return c.json(Resp.fail("表情包不存在"), HttpStatusCodes.NOT_FOUND);
  }

  logger.info({ emojiId: emoji.id, tags: emoji.tags }, "[Emojis]: 表情包删除成功");

  return c.json(Resp.ok({ success: true }), HttpStatusCodes.OK);
};
