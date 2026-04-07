import type { CollectionRouteHandlerType } from "./collections.types";

import { and, eq, or, sql } from "drizzle-orm";

import db from "@/db";
import { clientEmojiCollections } from "@/db/schema";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import logger from "@/lib/services/logger";
import { Resp } from "@/utils";

/** List emoji collections / 表情包集合列表 */
export const list: CollectionRouteHandlerType<"list"> = async (c) => {
  const query = c.req.valid("query");

  const { page, pageSize, tags, tagsAll, isFeatured, status } = query;

  // Build conditions / 构建查询条件
  const conditions = [];

  // Status filter / 状态过滤
  if (status) {
    conditions.push(eq(clientEmojiCollections.status, status));
  }

  // Featured filter / 精选过滤
  if (isFeatured !== undefined) {
    conditions.push(eq(clientEmojiCollections.isFeatured, isFeatured));
  }

  // Tag filtering (OR logic) / 标签过滤（OR 逻辑）
  if (tags && tags.length > 0) {
    const tagConditions = tags.map(tag =>
      sql`array_position(${clientEmojiCollections.tags}, ${tag}) is not null`,
    );
    conditions.push(or(...tagConditions));
  }

  // Tag filtering (AND logic) / 标签过滤（AND 逻辑）
  if (tagsAll && tagsAll.length > 0) {
    conditions.push(
      sql`${clientEmojiCollections.tags} @> ${JSON.stringify(tagsAll)}::text[]`,
    );
  }

  // Execute query / 执行查询
  const collections = await db
    .select()
    .from(clientEmojiCollections)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(clientEmojiCollections.sortOrder, clientEmojiCollections.createdAt)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return c.json(Resp.ok(collections), HttpStatusCodes.OK);
};

/** Create new emoji collection / 创建表情包集合 */
export const create: CollectionRouteHandlerType<"create"> = async (c) => {
  const body = c.req.valid("json");
  const { sub } = c.get("jwtPayload");

  const [collection] = await db
    .insert(clientEmojiCollections)
    .values({
      ...body,
      createdBy: sub,
      updatedBy: sub,
    })
    .returning();

  logger.info({ collectionId: collection.id, name: collection.name }, "[EmojiCollections]: 表情包集合创建成功");

  return c.json(Resp.ok(collection), HttpStatusCodes.OK);
};

/** Get collection by ID / 根据ID获取表情包集合 */
export const get: CollectionRouteHandlerType<"get"> = async (c) => {
  const { id } = c.req.valid("param");

  const [collection] = await db
    .select()
    .from(clientEmojiCollections)
    .where(eq(clientEmojiCollections.id, id))
    .limit(1);

  if (!collection) {
    return c.json(Resp.fail("表情包集合不存在"), HttpStatusCodes.NOT_FOUND);
  }

  return c.json(Resp.ok(collection), HttpStatusCodes.OK);
};

/** Update emoji collection / 更新表情包集合 */
export const update: CollectionRouteHandlerType<"update"> = async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const { sub } = c.get("jwtPayload");

  const [collection] = await db
    .update(clientEmojiCollections)
    .set({
      ...body,
      updatedBy: sub,
    })
    .where(eq(clientEmojiCollections.id, id))
    .returning();

  if (!collection) {
    return c.json(Resp.fail("表情包集合不存在"), HttpStatusCodes.NOT_FOUND);
  }

  logger.info({ collectionId: collection.id, name: collection.name }, "[EmojiCollections]: 表情包集合更新成功");

  return c.json(Resp.ok(collection), HttpStatusCodes.OK);
};

/** Delete emoji collection / 删除表情包集合 */
export const remove: CollectionRouteHandlerType<"remove"> = async (c) => {
  const { id } = c.req.valid("param");

  const [collection] = await db
    .delete(clientEmojiCollections)
    .where(eq(clientEmojiCollections.id, id))
    .returning();

  if (!collection) {
    return c.json(Resp.fail("表情包集合不存在"), HttpStatusCodes.NOT_FOUND);
  }

  logger.info({ collectionId: collection.id, name: collection.name }, "[EmojiCollections]: 表情包集合删除成功");

  return c.json(Resp.ok({ success: true }), HttpStatusCodes.OK);
};

/** Increment download count / 增加下载次数 */
export const incrementDownload: CollectionRouteHandlerType<"incrementDownload"> = async (c) => {
  const { id } = c.req.valid("param");

  const [collection] = await db
    .update(clientEmojiCollections)
    .set({
      downloadCount: sql`${clientEmojiCollections.downloadCount} + 1`,
    })
    .where(eq(clientEmojiCollections.id, id))
    .returning();

  if (!collection) {
    return c.json(Resp.fail("表情包集合不存在"), HttpStatusCodes.NOT_FOUND);
  }

  return c.json(Resp.ok({ downloadCount: collection.downloadCount }), HttpStatusCodes.OK);
};
