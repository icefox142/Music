import { eq } from "drizzle-orm";
import { jwt } from "hono/jwt";
import { testClient } from "hono/testing";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import db from "@/db";
import { clientEmojiFavorites, clientEmojis } from "@/db/schema";
import env from "@/env";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { Status } from "@/lib/enums";
import favoritesRouter from "@/routes/client/emoji-favorites/index";
import { getAuthHeaders } from "~/tests/auth-utils";
import { createTestApp } from "~/tests/utils/test-app";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

function createFavoritesApp() {
  return createTestApp()
    .use("/emoji-favorites/*", jwt({ secret: env.CLIENT_JWT_SECRET, alg: "HS256" }))
    .route("/", favoritesRouter);
}

const client = testClient(createFavoritesApp());

// Test data / 测试数据
const testEmoji = {
  tags: ["test", "favorite"],
  url: "https://example.com/test-emoji.png",
  description: "测试表情",
  status: Status.ENABLED,
};

/**
 * Clean up test favorites and emojis
 * 清理测试收藏和表情
 */
async function cleanupTestData(): Promise<void> {
  try {
    // Delete test favorites / 删除测试收藏
    await db.delete(clientEmojiFavorites);

    // Delete test emojis / 删除测试表情
    await db
      .delete(clientEmojis)
      .where(eq(clientEmojis.url, "https://example.com/test-emoji.png"));
  }
  catch (error) {
    console.error("清理测试数据失败:", error);
    throw error;
  }
}

describe("emoji favorites routes", () => {
  let clientToken: string;
  let testEmojiId: string;

  beforeAll(async () => {
    // Clean up potentially leftover test data / 清理可能存在的遗留测试数据
    await cleanupTestData();

    // Get client token / 获取 client token
    const { getUserToken } = await import("~/tests/auth-utils");
    clientToken = await getUserToken();

    // Create a test emoji / 创建测试表情
    const [emoji] = await db
      .insert(clientEmojis)
      .values({
        ...testEmoji,
        createdBy: "test",
        updatedBy: "test",
      })
      .returning();

    testEmojiId = emoji.id;
  });

  afterAll(async () => {
    // Ensure all test data is cleaned up / 确保清理所有测试数据
    await cleanupTestData();
  });

  describe("authentication", () => {
    it("should require authentication", async () => {
      const response = await client["emoji-favorites"].$get(
        { query: {} },
        {},
      );

      expect(response.status).toBe(HttpStatusCodes.UNAUTHORIZED);
    });

    it("should allow authenticated client requests", async () => {
      const response = await client["emoji-favorites"].$get(
        { query: {} },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);
    });
  });

  describe("get /emoji-favorites - list favorites", () => {
    it("should list favorites with default pagination", async () => {
      const response = await client["emoji-favorites"].$get(
        { query: {} },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data).toBeDefined();
        expect(Array.isArray(json.data)).toBe(true);
      }
    });

    it("should return empty list when no favorites", async () => {
      const response = await client["emoji-favorites"].$get(
        { query: {} },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data).toHaveLength(0);
      }
    });
  });

  describe("post /emoji-favorites - add favorite", () => {
    it("should validate required fields", async () => {
      const response = await client["emoji-favorites"].$post(
        {
          // @ts-expect-error - Testing required field validation
          json: {},
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should return 404 for non-existent emoji", async () => {
      const nonExistentId = crypto.randomUUID();
      const response = await client["emoji-favorites"].$post(
        {
          json: {
            emojiId: nonExistentId,
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
    });

    it("should add emoji to favorites", async () => {
      const response = await client["emoji-favorites"].$post(
        {
          json: {
            emojiId: testEmojiId,
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.emojiId).toBe(testEmojiId);
        expect(json.data.emoji).toBeDefined();
        expect(json.data.emoji.id).toBe(testEmojiId);
      }
    });

    it("should handle duplicate favorites gracefully", async () => {
      // Add the same emoji twice / 添加同一个表情两次
      await client["emoji-favorites"].$post(
        {
          json: {
            emojiId: testEmojiId,
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      const response = await client["emoji-favorites"].$post(
        {
          json: {
            emojiId: testEmojiId,
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      // Should still return success (idempotent operation) / 应该仍然返回成功（幂等操作）
      expect(response.status).toBe(HttpStatusCodes.OK);
    });
  });

  describe("get /emoji-favorites/:emojiId/check - check favorite status", () => {
    it("should return true for favorited emoji", async () => {
      const response = await client["emoji-favorites"][":emojiId"].check.$get(
        {
          param: { emojiId: testEmojiId },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.isFavorited).toBe(true);
      }
    });

    it("should return false for non-favorited emoji", async () => {
      const nonExistentId = crypto.randomUUID();
      const response = await client["emoji-favorites"][":emojiId"].check.$get(
        {
          param: { emojiId: nonExistentId },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.isFavorited).toBe(false);
      }
    });

    it("should validate UUID format", async () => {
      const response = await client["emoji-favorites"][":emojiId"].check.$get(
        {
          param: { emojiId: "invalid-uuid" },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });
  });

  describe("delete /emoji-favorites/:emojiId - remove favorite", () => {
    it("should validate UUID format", async () => {
      const response = await client["emoji-favorites"][":emojiId"].$delete(
        {
          param: { emojiId: "invalid-uuid" },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should return 404 for non-existent favorite", async () => {
      const nonExistentId = crypto.randomUUID();
      const response = await client["emoji-favorites"][":emojiId"].$delete(
        {
          param: { emojiId: nonExistentId },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
    });

    it("should remove emoji from favorites", async () => {
      // First ensure emoji is favorited / 首先确保表情已收藏
      await client["emoji-favorites"].$post(
        {
          json: {
            emojiId: testEmojiId,
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      // Remove favorite / 移除收藏
      const response = await client["emoji-favorites"][":emojiId"].$delete(
        {
          param: { emojiId: testEmojiId },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.success).toBe(true);
      }

      // Verify favorite has been removed / 验证收藏已移除
      const checkResponse = await client["emoji-favorites"][":emojiId"].check.$get(
        {
          param: { emojiId: testEmojiId },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      if (checkResponse.status === HttpStatusCodes.OK) {
        const checkJson = await checkResponse.json();

        expect(checkJson.data.isFavorited).toBe(false);
      }
    });
  });

  describe("integration tests", () => {
    it("should maintain favorite list order by favorited time", async () => {
      // Add multiple favorites / 添加多个收藏
      const emoji1 = await db
        .insert(clientEmojis)
        .values({
          ...testEmoji,
          url: "https://example.com/emoji1.png",
          createdBy: "test",
          updatedBy: "test",
        })
        .returning();

      const emoji2 = await db
        .insert(clientEmojis)
        .values({
          ...testEmoji,
          url: "https://example.com/emoji2.png",
          createdBy: "test",
          updatedBy: "test",
        })
        .returning();

      // Add favorites with delay / 添加收藏（有延迟）
      await client["emoji-favorites"].$post(
        { json: { emojiId: emoji1[0].id } },
        { headers: getAuthHeaders(clientToken) },
      );

      await new Promise(resolve => setTimeout(resolve, 10));

      await client["emoji-favorites"].$post(
        { json: { emojiId: emoji2[0].id } },
        { headers: getAuthHeaders(clientToken) },
      );

      // Get favorite list / 获取收藏列表
      const response = await client["emoji-favorites"].$get(
        { query: {} },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        // Should have at least 2 favorites / 应该至少有 2 个收藏
        expect(json.data.length).toBeGreaterThanOrEqual(2);

        // First item should be the most recently favorited / 第一项应该是最最近收藏的
        expect(json.data[0].emojiId).toBe(emoji2[0].id);
      }
    });
  });
});
