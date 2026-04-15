import type { CommentsRouteHandlerType } from "./comments.types";

import { and, desc, eq, isNull, sql } from "drizzle-orm";

import db from "@/db";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { Resp } from "@/utils";
import { clientComments, clientCommentLikes, clientSongs } from "@/db/schema";
import logger from "@/lib/services/logger";

/** List comments with filters / 评论列表（支持筛选） */
export const list: CommentsRouteHandlerType<"list"> = async (c) => {
  const query = c.req.valid("query");
  const userId = c.get("userId");

  const { songId, parentId, userId: filterUserId, sortBy = "latest", page = 1, limit = 20 } = query;

  try {
    // Build conditions / 构建查询条件
    const conditions = [];
    if (songId) conditions.push(eq(clientComments.songId, songId));
    if (parentId !== undefined) {
      if (parentId === null) {
        conditions.push(isNull(clientComments.parentId));
      } else {
        conditions.push(eq(clientComments.parentId, parentId));
      }
    }
    if (filterUserId) conditions.push(eq(clientComments.userId, filterUserId));

    // Build sorting / 构建排序
    let orderBy;
    switch (sortBy) {
      case "hot":
        orderBy = desc(clientComments.likeCount);
        break;
      case "pinned":
        orderBy = [desc(clientComments.isPinned), desc(clientComments.likeCount)];
        break;
      case "latest":
      default:
        orderBy = desc(clientComments.createdAt);
        break;
    }

    // Get total count / 获取总数
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clientComments)
      .where(and(...conditions));

    // Get comments / 获取评论
    const data = await db
      .select()
      .from(clientComments)
      .where(and(...conditions))
      .orderBy(...orderBy)
      .limit(limit)
      .offset((page - 1) * limit);

    logger.info({ userId, query }, "[Comments]: 获取评论列表");

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
    logger.error({ error }, "[Comments]: 获取评论列表失败");
    return c.json(
      Resp.fail("获取评论列表失败"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

/** Get comment by ID / 根据ID获取评论 */
export const get: CommentsRouteHandlerType<"get"> = async (c) => {
  const { id } = c.req.valid("param");
  const userId = c.get("userId");

  try {
    const [comment] = await db
      .select()
      .from(clientComments)
      .where(eq(clientComments.id, id))
      .limit(1);

    if (!comment) {
      return c.json(
        Resp.fail("评论不存在"),
        HttpStatusCodes.NOT_FOUND
      );
    }

    logger.info({ userId, commentId: id }, "[Comments]: 获取评论详情");

    return c.json(
      Resp.ok(comment),
      HttpStatusCodes.OK
    );
  } catch (error) {
    logger.error({ error, commentId: id }, "[Comments]: 获取评论详情失败");
    return c.json(
      Resp.fail("获取评论详情失败"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

/** Create comment / 创建评论 */
export const create: CommentsRouteHandlerType<"create"> = async (c) => {
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

    // If reply, check if parent comment exists / 如果是回复，检查父评论是否存在
    if (body.parentId) {
      const [parentComment] = await db
        .select()
        .from(clientComments)
        .where(eq(clientComments.id, body.parentId))
        .limit(1);

      if (!parentComment) {
        return c.json(
          Resp.fail("父评论不存在"),
          HttpStatusCodes.BAD_REQUEST
        );
      }

      // Increment parent's reply count / 增加父评论的回复数
      await db
        .update(clientComments)
        .set({ replyCount: parentComment.replyCount + 1 })
        .where(eq(clientComments.id, body.parentId));
    }

    // Create comment / 创建评论
    const [newComment] = await db
      .insert(clientComments)
      .values({
        ...body,
        userId,
        createdBy: userId,
        updatedBy: userId,
        lastActivityAt: new Date().toISOString(),
      })
      .returning();

    logger.info({ userId, songId: body.songId }, "[Comments]: 创建评论");

    return c.json(
      Resp.ok(newComment),
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    logger.error({ error, userId, body }, "[Comments]: 创建评论失败");
    return c.json(
      Resp.fail("创建评论失败"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

/** Update comment / 更新评论 */
export const update: CommentsRouteHandlerType<"update"> = async (c) => {
  const { id } = c.req.valid("param");
  const userId = c.get("userId");
  const body = c.req.valid("json");

  try {
    // Check if comment exists and belongs to user / 检查评论是否存在且属于用户
    const [existing] = await db
      .select()
      .from(clientComments)
      .where(eq(clientComments.id, id))
      .limit(1);

    if (!existing) {
      return c.json(
        Resp.fail("评论不存在"),
        HttpStatusCodes.NOT_FOUND
      );
    }

    if (existing.userId !== userId) {
      return c.json(
        Resp.fail("无权限修改此评论"),
        HttpStatusCodes.FORBIDDEN
      );
    }

    // Update comment / 更新评论
    const [updatedComment] = await db
      .update(clientComments)
      .set({
        content: body.content,
        updatedBy: userId,
        lastActivityAt: new Date().toISOString(),
      })
      .where(eq(clientComments.id, id))
      .returning();

    logger.info({ userId, commentId: id }, "[Comments]: 更新评论");

    return c.json(
      Resp.ok(updatedComment),
      HttpStatusCodes.OK
    );
  } catch (error) {
    logger.error({ error, commentId: id, userId, body }, "[Comments]: 更新评论失败");
    return c.json(
      Resp.fail("更新评论失败"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

/** Delete comment / 删除评论 */
export const remove: CommentsRouteHandlerType<"remove"> = async (c) => {
  const { id } = c.req.valid("param");
  const userId = c.get("userId");

  try {
    // Check if comment exists and belongs to user / 检查评论是否存在且属于用户
    const [existing] = await db
      .select()
      .from(clientComments)
      .where(eq(clientComments.id, id))
      .limit(1);

    if (!existing) {
      return c.json(
        Resp.fail("评论不存在"),
        HttpStatusCodes.NOT_FOUND
      );
    }

    if (existing.userId !== userId) {
      return c.json(
        Resp.fail("无权限删除此评论"),
        HttpStatusCodes.FORBIDDEN
      );
    }

    // If has parent, decrement parent's reply count / 如果有父评论，减少回复数
    if (existing.parentId) {
      const [parentComment] = await db
        .select()
        .from(clientComments)
        .where(eq(clientComments.id, existing.parentId))
        .limit(1);

      if (parentComment && parentComment.replyCount > 0) {
        await db
          .update(clientComments)
          .set({ replyCount: parentComment.replyCount - 1 })
          .where(eq(clientComments.id, existing.parentId));
      }
    }

    // Delete comment / 删除评论
    await db.delete(clientComments).where(eq(clientComments.id, id));

    logger.info({ userId, commentId: id }, "[Comments]: 删除评论");

    return c.json(
      Resp.ok({ success: true }),
      HttpStatusCodes.OK
    );
  } catch (error) {
    logger.error({ error, commentId: id, userId }, "[Comments]: 删除评论失败");
    return c.json(
      Resp.fail("删除评论失败"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

/** Like comment / 点赞评论 */
export const like: CommentsRouteHandlerType<"like"> = async (c) => {
  const { id } = c.req.valid("param");
  const userId = c.get("userId");
  const body = c.req.valid("json");

  try {
    // Check if comment exists / 检查评论是否存在
    const [comment] = await db
      .select()
      .from(clientComments)
      .where(eq(clientComments.id, id))
      .limit(1);

    if (!comment) {
      return c.json(
        Resp.fail("评论不存在"),
        HttpStatusCodes.NOT_FOUND
      );
    }

    const likeType = parseInt(body.likeType);

    // Check if user already liked/disliked this comment / 检查用户是否已点赞
    const [existingLike] = await db
      .select()
      .from(clientCommentLikes)
      .where(
        and(
          eq(clientCommentLikes.userId, userId),
          eq(clientCommentLikes.commentId, id)
        )
      )
      .limit(1);

    // Calculate like/dislike count changes / 计算点赞/踩数量变化
    let likeDelta = 0;
    let dislikeDelta = 0;

    if (existingLike) {
      // Update existing like / 更新现有点赞
      const oldLikeType = existingLike.likeType;

      if (oldLikeType === likeType) {
        // Remove like/dislike if same type / 如果相同类型则移除
        if (likeType === 1) likeDelta = -1;
        if (likeType === -1) dislikeDelta = -1;

        await db
          .delete(clientCommentLikes)
          .where(
            and(
              eq(clientCommentLikes.userId, userId),
              eq(clientCommentLikes.commentId, id)
            )
          );
      } else {
        // Change like type / 改变点赞类型
        if (oldLikeType === 1) likeDelta = -1;
        if (oldLikeType === -1) dislikeDelta = -1;
        if (likeType === 1) likeDelta = 1;
        if (likeType === -1) dislikeDelta = 1;

        await db
          .update(clientCommentLikes)
          .set({ likeType })
          .where(
            and(
              eq(clientCommentLikes.userId, userId),
              eq(clientCommentLikes.commentId, id)
            )
          );
      }
    } else {
      // Create new like / 创建新点赞
      if (likeType === 1) likeDelta = 1;
      if (likeType === -1) dislikeDelta = 1;

      await db
        .insert(clientCommentLikes)
        .values({
          userId,
          commentId: id,
          likeType,
        });
    }

    // Update comment like/dislike counts / 更新评论点赞数
    const [updatedComment] = await db
      .update(clientComments)
      .set({
        likeCount: comment.likeCount + likeDelta,
        dislikeCount: comment.dislikeCount + dislikeDelta,
      })
      .where(eq(clientComments.id, id))
      .returning();

    logger.info({ userId, commentId: id, likeType }, "[Comments]: 点赞评论");

    return c.json(
      Resp.ok({
        message: "操作成功",
        likeCount: updatedComment.likeCount,
        dislikeCount: updatedComment.dislikeCount,
      }),
      HttpStatusCodes.OK
    );
  } catch (error) {
    logger.error({ error, commentId: id, userId, body }, "[Comments]: 点赞评论失败");
    return c.json(
      Resp.fail("点赞评论失败"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
