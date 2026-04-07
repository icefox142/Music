import { eq } from "drizzle-orm";
import { jwt } from "hono/jwt";
import { testClient } from "hono/testing";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import db from "@/db";
import { clientEmojis, clientEmojiUsageLogs } from "@/db/schema";
import env from "@/env";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { Status } from "@/lib/enums";
import usageLogsRouter from "@/routes/client/emoji/usage-logs/index";
import { getAuthHeaders } from "~/tests/auth-utils";
import { createTestApp } from "~/tests/utils/test-app";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

function createUsageLogsApp() {
  return createTestApp()
    .use("/emoji/usage-logs/*", jwt({ secret: env.CLIENT_JWT_SECRET, alg: "HS256" }))
    .route("/", usageLogsRouter);
}

const client = testClient(createUsageLogsApp());

// Test data / 测试数据
const testEmoji = {
  tags: ["test", "usage"],
  url: "https://example.com/test-usage-emoji.png",
  description: "测试使用记录表情",
  status: Status.ENABLED,
};

/**
 * Clean up test usage logs and emojis
 * 清理测试使用记录和表情
 */
async function cleanupTestData(): Promise<void> {
  try {
    // Delete test usage logs / 删除测试使用记录
    await db.delete(clientEmojiUsageLogs);

    // Delete test emojis / 删除测试表情
    await db
      .delete(clientEmojis)
      .where(eq(clientEmojis.url, "https://example.com/test-usage-emoji.png"));
  }
  catch (error) {
    console.error("清理测试数据失败:", error);
    throw error;
  }
}

describe("emoji usage logs routes", () => {
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
      const response = await client.emoji["usage-logs"].$post(
        // @ts-expect-error - Testing without authentication
        { json: {} },
        {},
      );

      expect(response.status).toBe(HttpStatusCodes.UNAUTHORIZED);
    });

    it("should allow authenticated client requests", async () => {
      const response = await client.emoji["usage-logs"].$post(
        {
          json: {
            emojiId: testEmojiId,
            context: "chat",
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);
    });
  });

  describe("post /emoji-usage-logs - record usage", () => {
    it("should validate required fields", async () => {
      const response = await client.emoji["usage-logs"].$post(
        {
          // @ts-expect-error - Testing required field validation
          json: {
            context: "chat",
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should validate context enum", async () => {
      const response = await client.emoji["usage-logs"].$post(
        {
          json: {
            emojiId: testEmojiId,
            // @ts-expect-error - Testing enum validation
            context: "invalid_context",
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should record emoji usage", async () => {
      const response = await client.emoji["usage-logs"].$post(
        {
          json: {
            emojiId: testEmojiId,
            context: "chat",
            targetId: "room-123",
            count: 1,
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.success).toBe(true);
      }
    });

    it("should support count parameter", async () => {
      const response = await client.emoji["usage-logs"].$post(
        {
          json: {
            emojiId: testEmojiId,
            context: "chat",
            count: 5, // User sent emoji 5 times / 用户发送了 5 次表情
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);
    });
  });

  describe("post /emoji-usage-logs/batch - batch record usage", () => {
    it("should validate required fields", async () => {
      const response = await client.emoji["usage-logs"].batch.$post(
        {
          // @ts-expect-error - Testing required field validation
          json: {},
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should validate array length", async () => {
      const response = await client.emoji["usage-logs"].batch.$post(
        {
          json: {
            usages: Array.from({ length: 51 }).fill({
              emojiId: testEmojiId,
              context: "chat",
            }),
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should batch record usage logs", async () => {
      const response = await client.emoji["usage-logs"].batch.$post(
        {
          json: {
            usages: [
              {
                emojiId: testEmojiId,
                context: "chat",
                targetId: "room-1",
              },
              {
                emojiId: testEmojiId,
                context: "comment",
                targetId: "comment-1",
              },
              {
                emojiId: testEmojiId,
                context: "post",
                targetId: "post-1",
              },
            ],
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.success).toBe(true);
        expect(json.data.count).toBe(3);
      }
    });
  });

  describe("get /emoji-usage-logs - get usage history", () => {
    beforeAll(async () => {
      // Record some test usage logs / 记录一些测试使用记录
      await client.emoji["usage-logs"].$post(
        {
          json: {
            emojiId: testEmojiId,
            context: "chat",
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      await client.emoji["usage-logs"].$post(
        {
          json: {
            emojiId: testEmojiId,
            context: "comment",
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );
    });

    it("should get usage history with pagination", async () => {
      const response = await client.emoji["usage-logs"].$get(
        {
          query: {
            page: 1,
            pageSize: 10,
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.data).toBeDefined();
        expect(Array.isArray(json.data.data)).toBe(true);
        expect(json.data.total).toBeGreaterThan(0);
      }
    });

    it("should filter by context", async () => {
      const response = await client.emoji["usage-logs"].$get(
        {
          query: {
            context: "chat",
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        // All logs should have context = "chat" / 所有记录的 context 应该是 "chat"
        json.data.data.forEach((log: { context: string }) => {
          expect(log.context).toBe("chat");
        });
      }
    });

    it("should filter by date range", async () => {
      const today = new Date().toISOString().split("T")[0];
      const response = await client.emoji["usage-logs"].$get(
        {
          query: {
            startDate: `${today}T00:00:00Z`,
            endDate: `${today}T23:59:59Z`,
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);
    });
  });

  describe("get /emoji-usage-logs/popular - get popular emojis", () => {
    beforeAll(async () => {
      // Record more usage to make emoji popular / 记录更多使用让表情变热门
      for (let i = 0; i < 10; i++) {
        await client.emoji["usage-logs"].$post(
          {
            json: {
              emojiId: testEmojiId,
              context: "chat",
              count: 5,
            },
          },
          { headers: getAuthHeaders(clientToken) },
        );
      }
    });

    it("should get popular emojis", async () => {
      const response = await client.emoji["usage-logs"].popular.$get(
        {
          query: {
            limit: 10,
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(Array.isArray(json.data)).toBe(true);

        // Should have at least one popular emoji / 应该至少有一个热门表情
        if (json.data.length > 0) {
          expect(json.data[0].emojiId).toBeDefined();
          expect(json.data[0].usageCount).toBeGreaterThan(0);
        }
      }
    });

    it("should filter popular emojis by context", async () => {
      const response = await client.emoji["usage-logs"].popular.$get(
        {
          query: {
            context: "chat",
            limit: 5,
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.length).toBeLessThanOrEqual(5);
      }
    });

    it("should validate limit parameter", async () => {
      const response = await client.emoji["usage-logs"].popular.$get(
        {
          query: {
            limit: 100, // Exceeds max of 50 / 超过最大值 50
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      // Should return validation error / 应该返回验证错误
      expect(response.status).toBeGreaterThanOrEqual(HttpStatusCodes.BAD_REQUEST);
    });
  });

  describe("get /emoji-usage-logs/stats/:emojiId - get emoji statistics", () => {
    it("should return 404 for non-existent emoji", async () => {
      const nonExistentId = crypto.randomUUID();
      const response = await client.emoji["usage-logs"].stats[":emojiId"].$get(
        {
          param: { emojiId: nonExistentId },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
    });

    it("should validate UUID format", async () => {
      const response = await client.emoji["usage-logs"].stats[":emojiId"].$get(
        {
          param: { emojiId: "invalid-uuid" },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should get emoji usage statistics", async () => {
      const response = await client.emoji["usage-logs"].stats[":emojiId"].$get(
        {
          param: { emojiId: testEmojiId },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.emojiId).toBe(testEmojiId);
        expect(json.data.totalCount).toBeGreaterThan(0);
        expect(json.data.uniqueUsers).toBeGreaterThan(0);
        expect(json.data.contextBreakdown).toBeDefined();
        expect(typeof json.data.contextBreakdown).toBe("object");
      }
    });

    it("should include context breakdown in stats", async () => {
      const response = await client.emoji["usage-logs"].stats[":emojiId"].$get(
        {
          param: { emojiId: testEmojiId },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        // Should have context breakdown / 应该有场景分布
        expect(Object.keys(json.data.contextBreakdown).length).toBeGreaterThan(0);

        // Each context should have a count / 每个场景应该有计数
        Object.values(json.data.contextBreakdown).forEach((count: number) => {
          expect(count).toBeGreaterThan(0);
        });
      }
    });
  });

  describe("integration tests", () => {
    it("should track usage across multiple contexts", async () => {
      // Record usage in different contexts / 在不同场景记录使用
      const contexts = ["chat", "comment", "post", "message"];

      for (const context of contexts) {
        await client.emoji["usage-logs"].$post(
          {
            json: {
              emojiId: testEmojiId,
              context: context as any,
              count: 2,
            },
          },
          { headers: getAuthHeaders(clientToken) },
        );
      }

      // Get statistics / 获取统计
      const response = await client.emoji["usage-logs"].stats[":emojiId"].$get(
        {
          param: { emojiId: testEmojiId },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        // Should have usage in all contexts / 应该在所有场景都有使用
        expect(Object.keys(json.data.contextBreakdown).length).toBeGreaterThanOrEqual(contexts.length);
      }
    });

    it("should count unique users correctly", async () => {
      // Create another test emoji / 创建另一个测试表情
      const [emoji2] = await db
        .insert(clientEmojis)
        .values({
          ...testEmoji,
          url: "https://example.com/emoji2.png",
          createdBy: "test",
          updatedBy: "test",
        })
        .returning();

      // Record usage from current user / 记录当前用户的使用
      await client.emoji["usage-logs"].$post(
        {
          json: {
            emojiId: emoji2.id,
            context: "chat",
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      // Get statistics / 获取统计
      const response = await client.emoji["usage-logs"].stats[":emojiId"].$get(
        {
          param: { emojiId: emoji2.id },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        // Should have exactly 1 unique user / 应该只有 1 个独立用户
        expect(json.data.uniqueUsers).toBe(1);
      }
    });
  });
});
