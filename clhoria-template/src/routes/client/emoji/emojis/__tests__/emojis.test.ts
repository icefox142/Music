import { eq } from "drizzle-orm";
import { jwt } from "hono/jwt";
import { testClient } from "hono/testing";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import db from "@/db";
import { clientEmojis } from "@/db/schema";
import env from "@/env";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { Status } from "@/lib/enums";
import emojisRouter from "@/routes/client/emoji/emojis/index";
import { getAuthHeaders } from "~/tests/auth-utils";
import { createTestApp } from "~/tests/utils/test-app";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

function createEmojisApp() {
  return createTestApp()
    .use("/emoji/emojis/*", jwt({ secret: env.CLIENT_JWT_SECRET, alg: "HS256" }))
    .route("/", emojisRouter);
}

const client = testClient(createEmojisApp());

// Test data / 测试数据
const testEmoji = {
  tags: ["happy", "cat", "cute"],
  url: "https://example.com/emoji1.png",
  description: "开心的小猫表情",
  status: Status.ENABLED,
};

/**
 * Clean up test emoji data
 * 清理测试表情包数据
 */
async function cleanupTestEmojis(): Promise<void> {
  try {
    // Delete all test emojis (URL starts with https://example.com/) / 删除所有测试表情包（URL 以 https://example.com/ 开头）
    await db
      .delete(clientEmojis)
      .where(eq(clientEmojis.url, "https://example.com/emoji1.png"));
  }
  catch (error) {
    console.error("清理测试表情包失败:", error);
    throw error;
  }
}

describe("client emojis routes", () => {
  let clientToken: string;

  beforeAll(async () => {
    // Clean up potentially leftover test data / 清理可能存在的遗留测试数据
    await cleanupTestEmojis();

    // Get client token / 获取 client token
    const { getUserToken } = await import("~/tests/auth-utils");
    clientToken = await getUserToken();
  });

  // Ensure all test data is cleaned up after tests / 确保测试结束后清理所有测试数据
  afterAll(async () => {
    await cleanupTestEmojis();
  });

  describe("authentication", () => {
    it("should require authentication", async () => {
      const response = await client.emoji.emojis.$get(
        { query: {} },
        {},
      );

      expect(response.status).toBe(HttpStatusCodes.UNAUTHORIZED);
    });

    it("should allow authenticated client requests", async () => {
      const response = await client.emoji.emojis.$get(
        { query: {} },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);
    });
  });

  describe("get /emojis - list emojis", () => {
    it("should list emojis with default pagination", async () => {
      const response = await client.emoji.emojis.$get(
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

    it("should filter emojis by tags (OR logic)", async () => {
      // Create test emoji / 创建测试表情包
      await client.emoji.emojis.$post(
        { json: testEmoji },
        { headers: getAuthHeaders(clientToken) },
      );

      // Query with tags (OR logic) / 使用标签查询（OR 逻辑）
      const response = await client.emoji.emojis.$get(
        {
          query: {
            tags: ["happy", "sad"],
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();
        const items = json.data;

        // Should find emojis with "happy" OR "sad" tag / 应该找到包含 "happy" 或 "sad" 标签的表情包
        expect(items.length).toBeGreaterThan(0);
      }
    });

    it("should filter emojis by tagsAll (AND logic)", async () => {
      // Query with tagsAll (AND logic) / 使用标签查询（AND 逻辑）
      const response = await client.emoji.emojis.$get(
        {
          query: {
            tagsAll: ["happy", "cat"],
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();
        const items = json.data;

        // Should find emojis with BOTH "happy" AND "cat" tags / 应该找到同时包含 "happy" 和 "cat" 标签的表情包
        expect(items.length).toBeGreaterThan(0);

        if (items.length > 0) {
          expect(items[0].tags).toContain("happy");
          expect(items[0].tags).toContain("cat");
        }
      }
    });
  });

  describe("post /emojis - create emoji", () => {
    it("should validate required fields", async () => {
      const response = await client.emoji.emojis.$post(
        {
          // @ts-expect-error - Testing required field validation / 测试必填字段验证
          json: {
            description: "测试表情包",
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should validate tags array", async () => {
      const response = await client.emoji.emojis.$post(
        {
          json: {
            ...testEmoji,
            tags: [], // Empty tags / 空标签
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should validate URL format", async () => {
      const response = await client.emoji.emojis.$post(
        {
          json: {
            ...testEmoji,
            url: "invalid-url", // Invalid URL / 无效的 URL
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should create a new emoji", async () => {
      const response = await client.emoji.emojis.$post(
        {
          json: {
            ...testEmoji,
            url: "https://example.com/emoji2.png",
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.tags).toEqual(testEmoji.tags);
        expect(json.data.url).toBe("https://example.com/emoji2.png");
      }
    });
  });

  describe("get /emojis/{id} - get emoji", () => {
    let emojiId: string;

    beforeAll(async () => {
      // Create an emoji for testing / 创建一个表情包用于测试
      const response = await client.emoji.emojis.$post(
        {
          json: testEmoji,
        },
        { headers: getAuthHeaders(clientToken) },
      );

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();
        emojiId = json.data.id;
      }
    });

    it("should validate UUID format", async () => {
      const response = await client.emoji.emojis[":id"].$get(
        { param: { id: "invalid-uuid" } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should return 404 for non-existent emoji", async () => {
      const nonExistentId = crypto.randomUUID();
      const response = await client.emoji.emojis[":id"].$get(
        { param: { id: nonExistentId } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
    });

    it("should get emoji details", async () => {
      const response = await client.emoji.emojis[":id"].$get(
        { param: { id: emojiId } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.id).toBe(emojiId);
        expect(json.data.tags).toEqual(testEmoji.tags);
        expect(json.data.url).toBe(testEmoji.url);
      }
    });
  });

  describe("patch /emojis/{id} - update emoji", () => {
    let emojiId: string;

    beforeAll(async () => {
      // Create an emoji for testing / 创建一个表情包用于测试
      const response = await client.emoji.emojis.$post(
        {
          json: testEmoji,
        },
        { headers: getAuthHeaders(clientToken) },
      );

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();
        emojiId = json.data.id;
      }
    });

    it("should update emoji tags", async () => {
      const newTags = ["sad", "dog", "funny"];
      const response = await client.emoji.emojis[":id"].$patch(
        {
          param: { id: emojiId },
          json: {
            tags: newTags,
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.tags).toEqual(newTags);
      }
    });

    it("should update emoji url", async () => {
      const newUrl = "https://example.com/emoji-updated.png";
      const response = await client.emoji.emojis[":id"].$patch(
        {
          param: { id: emojiId },
          json: {
            url: newUrl,
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.url).toBe(newUrl);
      }
    });
  });

  describe("delete /emojis/{id} - delete emoji", () => {
    it("should validate UUID format", async () => {
      const response = await client.emoji.emojis[":id"].$delete(
        { param: { id: "invalid-uuid" } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should return 404 for non-existent emoji", async () => {
      const nonExistentId = crypto.randomUUID();
      const response = await client.emoji.emojis[":id"].$delete(
        { param: { id: nonExistentId } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
    });

    it("should delete emoji successfully", async () => {
      // Create an emoji first for testing delete / 先创建一个表情包用于测试删除
      const createResponse = await client.emoji.emojis.$post(
        {
          json: {
            ...testEmoji,
            url: "https://example.com/emoji-delete.png",
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(createResponse.status).toBe(HttpStatusCodes.OK);

      if (createResponse.status !== HttpStatusCodes.OK) {
        throw new Error("Failed to create test emoji");
      }
      const json = await createResponse.json();
      const deleteTestId = json.data.id;

      // Test delete functionality / 测试删除功能
      const deleteResponse = await client.emoji.emojis[":id"].$delete(
        { param: { id: deleteTestId } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(deleteResponse.status).toBe(HttpStatusCodes.OK);

      // Verify emoji has been deleted / 验证表情包已被删除
      const verifyResponse = await client.emoji.emojis[":id"].$get(
        { param: { id: deleteTestId } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(verifyResponse.status).toBe(HttpStatusCodes.NOT_FOUND);
    });
  });
});
