import type { PlaylistRouteHandlerType } from "./playlists.types";

import { and, desc, eq, sql } from "drizzle-orm";

import db from "@/db";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { Resp } from "@/utils";
import { clientPlaylists } from "@/db/schema";
import logger from "@/lib/services/logger";

/** List playlists with filters / 歌单列表（支持筛选） */
export const list: PlaylistRouteHandlerType<"list"> = async (c) => {
  const query = c.req.valid("query");

  const { page, pageSize, userId, isPublic, status, sortBy, order } = query;

  // Build conditions / 构建查询条件
  const conditions = [];

  // User filter / 用户筛选
  if (userId) {
    conditions.push(eq(clientPlaylists.userId, userId));
  }

  // Public filter / 公开状态筛选
  if (isPublic !== undefined) {
    conditions.push(eq(clientPlaylists.isPublic, isPublic));
  }

  // Status filter / 状态筛选
  if (status) {
    conditions.push(eq(clientPlaylists.status, status));
  }

  // Build orderBy / 构建排序
  let orderBy;
  switch (sortBy) {
    case "playCount":
      orderBy = clientPlaylists.playCount;
      break;
    case "songCount":
      orderBy = clientPlaylists.songCount;
      break;
    case "sortOrder":
      orderBy = clientPlaylists.sortOrder;
      break;
    default:
      orderBy = clientPlaylists.createdAt;
  }

  // Execute query / 执行查询
  const playlists = await db
    .select()
    .from(clientPlaylists)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(order === "desc" ? desc(orderBy) : orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  // Get total count / 获取总数
  const [{ count }] = await db
    .select({ count: sql`count(*)::int` })
    .from(clientPlaylists)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  c.header("x-total-count", (count as number).toString());
  return c.json(Resp.ok(playlists), HttpStatusCodes.OK);
};

/** Get my playlists / 获取我的歌单 */
export const mine: PlaylistRouteHandlerType<"mine"> = async (c) => {
  const { sub } = c.get("jwtPayload");
  const query = c.req.valid("query");

  const { page, pageSize, sortBy, order } = query;

  // Build orderBy / 构建排序
  let orderBy;
  switch (sortBy) {
    case "playCount":
      orderBy = clientPlaylists.playCount;
      break;
    case "songCount":
      orderBy = clientPlaylists.songCount;
      break;
    case "sortOrder":
      orderBy = clientPlaylists.sortOrder;
      break;
    default:
      orderBy = clientPlaylists.createdAt;
  }

  // Execute query / 执行查询
  const playlists = await db
    .select()
    .from(clientPlaylists)
    .where(eq(clientPlaylists.userId, sub))
    .orderBy(order === "desc" ? desc(orderBy) : orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  // Get total count / 获取总数
  const [{ count }] = await db
    .select({ count: sql`count(*)::int` })
    .from(clientPlaylists)
    .where(eq(clientPlaylists.userId, sub));

  c.header("x-total-count", (count as number).toString());
  return c.json(Resp.ok(playlists), HttpStatusCodes.OK);
};

/** Get public playlists / 获取公开歌单 */
export const getPublic: PlaylistRouteHandlerType<"public"> = async (c) => {
  const query = c.req.valid("query");

  const { page, pageSize, sortBy, order } = query;

  // Build orderBy / 构建排序
  let orderBy;
  switch (sortBy) {
    case "playCount":
      orderBy = clientPlaylists.playCount;
      break;
    case "songCount":
      orderBy = clientPlaylists.songCount;
      break;
    case "sortOrder":
      orderBy = clientPlaylists.sortOrder;
      break;
    default:
      orderBy = clientPlaylists.createdAt;
  }

  // Execute query / 执行查询
  const playlists = await db
    .select()
    .from(clientPlaylists)
    .where(eq(clientPlaylists.isPublic, true))
    .orderBy(order === "desc" ? desc(orderBy) : orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  // Get total count / 获取总数
  const [{ count }] = await db
    .select({ count: sql`count(*)::int` })
    .from(clientPlaylists)
    .where(eq(clientPlaylists.isPublic, true));

  c.header("x-total-count", (count as number).toString());
  return c.json(Resp.ok(playlists), HttpStatusCodes.OK);
};

/** Create new playlist / 创建歌单 */
export const create: PlaylistRouteHandlerType<"create"> = async (c) => {
  const body = c.req.valid("json");
  const { sub } = c.get("jwtPayload");

  const [playlist] = await db
    .insert(clientPlaylists)
    .values({
      ...body,
      userId: sub,
      createdBy: sub,
      updatedBy: sub,
    })
    .returning();

  logger.info({ playlistId: playlist.id, name: playlist.name }, "[Playlists]: 歌单创建成功");

  return c.json(Resp.ok(playlist), HttpStatusCodes.OK);
};

/** Get playlist by ID / 根据ID获取歌单 */
export const get: PlaylistRouteHandlerType<"get"> = async (c) => {
  const { id } = c.req.valid("param");

  const [playlist] = await db
    .select()
    .from(clientPlaylists)
    .where(eq(clientPlaylists.id, id))
    .limit(1);

  if (!playlist) {
    return c.json(Resp.fail("歌单不存在"), HttpStatusCodes.NOT_FOUND);
  }

  return c.json(Resp.ok(playlist), HttpStatusCodes.OK);
};

/** Update playlist / 更新歌单 */
export const update: PlaylistRouteHandlerType<"update"> = async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const { sub } = c.get("jwtPayload");

  // Check ownership / 检查所有权
  const [existing] = await db
    .select()
    .from(clientPlaylists)
    .where(eq(clientPlaylists.id, id))
    .limit(1);

  if (!existing) {
    return c.json(Resp.fail("歌单不存在"), HttpStatusCodes.NOT_FOUND);
  }

  if (existing.userId !== sub) {
    return c.json(Resp.fail("无权操作此歌单"), HttpStatusCodes.FORBIDDEN);
  }

  const [playlist] = await db
    .update(clientPlaylists)
    .set({
      ...body,
      updatedBy: sub,
    })
    .where(eq(clientPlaylists.id, id))
    .returning();

  logger.info({ playlistId: playlist.id, name: playlist.name }, "[Playlists]: 歌单更新成功");

  return c.json(Resp.ok(playlist), HttpStatusCodes.OK);
};

/** Delete playlist / 删除歌单 */
export const remove: PlaylistRouteHandlerType<"remove"> = async (c) => {
  const { id } = c.req.valid("param");
  const { sub } = c.get("jwtPayload");

  // Check ownership / 检查所有权
  const [existing] = await db
    .select()
    .from(clientPlaylists)
    .where(eq(clientPlaylists.id, id))
    .limit(1);

  if (!existing) {
    return c.json(Resp.fail("歌单不存在"), HttpStatusCodes.NOT_FOUND);
  }

  if (existing.userId !== sub) {
    return c.json(Resp.fail("无权操作此歌单"), HttpStatusCodes.FORBIDDEN);
  }

  const [playlist] = await db
    .delete(clientPlaylists)
    .where(eq(clientPlaylists.id, id))
    .returning();

  logger.info({ playlistId: playlist.id, name: playlist.name }, "[Playlists]: 歌单删除成功");

  return c.json(Resp.ok({ success: true }), HttpStatusCodes.OK);
};
