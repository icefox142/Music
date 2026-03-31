import { eq } from "drizzle-orm";
import { jwt } from "hono/jwt";
import { testClient } from "hono/testing";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import db from "@/db";
import { clientEmojiCollections } from "@/db/schema";
import env from "@/env";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import collectionsRouter from "@/routes/client/emoji-collections/index";
import { getAuthHeaders } from "~/tests/auth-utils";
import { createTestApp } from "~/tests/utils/test-app";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

function createCollectionsApp() {
  return createTestApp()
    .use("/emoji-collections/*", jwt({ secret: env.CLIENT_JWT_SECRET, alg: "HS256" }))
    .route("/", collectionsRouter);
}

const client = testClient(createCollectionsApp());

// Test data / 测试数据
const testCollection = {
  name: "测试表情包集合",
  coverUrl: "https://example.com/collection.png",
  description: "这是一个测试集合",
  tags: ["cat", "cute"],
  emojiIds: ["uuid1", "uuid2", "uuid3"],
  isFeatured: false,
  sortOrder: 1,
};

/**
 * Clean up test collections
 * 清理测试集合
 */
async function cleanupTestCollections(): Promise<void> {
  try {
    // Delete all test collections (name starts with "测试") / 删除所有测试集合（name 以 "测试" 开头）
    await db
      .delete(clientEmojiCollections)
      .where(eq(clientEmojiCollections.name, testCollection.name));
  }
  catch (error) {
    console.error("清理测试集合失败:", error);
    throw error;
  }
}

describe("emoji collections routes", () => {
  let clientToken: string;
  let collectionId: string;

  beforeAll(async () => {
    // Clean up potentially leftover test data / 清理可能存在的遗留测试数据
    await cleanupTestCollections();

    // Get client token / 获取 client token
    const { getUserToken } = await import("~/tests/auth-utils");
    clientToken = await getUserToken();
  });

  afterAll(async () => {
    // Ensure all test data is cleaned up / 确保清理所有测试数据
    await cleanupTestCollections();
  });

  describe("authentication", () => {
    it("should require authentication", async () => {
      const response = await client["emoji-collections"].$get(
        { query: {} },
        {},
      );

      expect(response.status).toBe(HttpStatusCodes.UNAUTHORIZED);
    });

    it("should allow authenticated client requests", async () => {
      const response = await client["emoji-collections"].$get(
        { query: {} },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);
    });
  });

  describe("get /emoji-collections - list collections", () => {
    it("should list collections with default pagination", async () => {
      const response = await client["emoji-collections"].$get(
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

    it("should filter collections by isFeatured", async () => {
      // Create a featured collection first / 先创建一个精选集合
      await client["emoji-collections"].$post(
        {
          json: {
            ...testCollection,
            name: "测试精选集合",
            isFeatured: true,
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      const response = await client["emoji-collections"].$get(
        {
          query: {
            isFeatured: true,
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();
        const items = json.data;

        // All items should be featured / 所有项目都应该是精选的
        items.forEach((item: { isFeatured: boolean }) => {
          expect(item.isFeatured).toBe(true);
        });
      }
    });

    it("should filter collections by tags (OR logic)", async () => {
      const response = await client["emoji-collections"].$get(
        {
          query: {
            tags: ["cat", "dog"],
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);
    });
  });

  describe("post /emoji-collections - create collection", () => {
    it("should validate required fields", async () => {
      const response = await client["emoji-collections"].$post(
        {
          // @ts-expect-error - Testing required field validation
          json: {
            description: "测试集合",
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should validate emojiIds array", async () => {
      const response = await client["emoji-collections"].$post(
        {
          json: {
            ...testCollection,
            emojiIds: [], // Empty emoji IDs / 空 emoji IDs
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should validate URL format", async () => {
      const response = await client["emoji-collections"].$post(
        {
          json: {
            ...testCollection,
            coverUrl: "invalid-url", // Invalid URL / 无效的 URL
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should create a new collection", async () => {
      const response = await client["emoji-collections"].$post(
        {
          json: {
            ...testCollection,
            name: "测试创建集合",
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.name).toBe("测试创建集合");
        expect(json.data.emojiIds).toHaveLength(3);
        expect(json.data.downloadCount).toBe(0);
      }
    });
  });

  describe("get /emoji-collections/{id} - get collection", () => {
    beforeAll(async () => {
      // Create a collection for testing / 创建一个集合用于测试
      const response = await client["emoji-collections"].$post(
        {
          json: {
            ...testCollection,
            name: "测试获取集合",
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();
        collectionId = json.data.id;
      }
    });

    it("should validate UUID format", async () => {
      const response = await client["emoji-collections"][":id"].$get(
        { param: { id: "invalid-uuid" } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should return 404 for non-existent collection", async () => {
      const nonExistentId = crypto.randomUUID();
      const response = await client["emoji-collections"][":id"].$get(
        { param: { id: nonExistentId } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
    });

    it("should get collection details", async () => {
      const response = await client["emoji-collections"][":id"].$get(
        { param: { id: collectionId } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.id).toBe(collectionId);
        expect(json.data.name).toBe("测试获取集合");
        expect(json.data.emojiIds).toHaveLength(3);
      }
    });
  });

  describe("patch /emoji-collections/{id} - update collection", () => {
    it("should update collection fields", async () => {
      const response = await client["emoji-collections"][":id"].$patch(
        {
          param: { id: collectionId },
          json: {
            name: "更新后的集合名称",
            description: "更新后的描述",
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.name).toBe("更新后的集合名称");
        expect(json.data.description).toBe("更新后的描述");
      }
    });

    it("should return 404 for non-existent collection", async () => {
      const nonExistentId = crypto.randomUUID();
      const response = await client["emoji-collections"][":id"].$patch(
        {
          param: { id: nonExistentId },
          json: {
            name: "测试",
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
    });
  });

  describe("post /emoji-collections/{id}/download - increment download count", () => {
    it("should increment download count", async () => {
      const response = await client["emoji-collections"][":id"].download.$post(
        { param: { id: collectionId } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.downloadCount).toBe(1);
      }
    });

    it("should increment download count multiple times", async () => {
      // Increment twice / 增加 2 次
      await client["emoji-collections"][":id"].download.$post(
        { param: { id: collectionId } },
        { headers: getAuthHeaders(clientToken) },
      );

      const response = await client["emoji-collections"][":id"].download.$post(
        { param: { id: collectionId } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      if (response.status === HttpStatusCodes.OK) {
        const json = await response.json();

        expect(json.data.downloadCount).toBe(3); // 1 (initial) + 2
      }
    });
  });

  describe("delete /emoji-collections/{id} - delete collection", () => {
    it("should validate UUID format", async () => {
      const response = await client["emoji-collections"][":id"].$delete(
        { param: { id: "invalid-uuid" } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should return 404 for non-existent collection", async () => {
      const nonExistentId = crypto.randomUUID();
      const response = await client["emoji-collections"][":id"].$delete(
        { param: { id: nonExistentId } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
    });

    it("should delete collection successfully", async () => {
      // Create a collection first for testing delete / 先创建一个集合用于测试删除
      const createResponse = await client["emoji-collections"].$post(
        {
          json: {
            ...testCollection,
            name: "测试删除集合",
          },
        },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(createResponse.status).toBe(HttpStatusCodes.OK);

      if (createResponse.status !== HttpStatusCodes.OK) {
        throw new Error("Failed to create test collection");
      }
      const json = await createResponse.json();
      const deleteTestId = json.data.id;

      // Test delete functionality / 测试删除功能
      const deleteResponse = await client["emoji-collections"][":id"].$delete(
        { param: { id: deleteTestId } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(deleteResponse.status).toBe(HttpStatusCodes.OK);

      // Verify collection has been deleted / 验证集合已被删除
      const verifyResponse = await client["emoji-collections"][":id"].$get(
        { param: { id: deleteTestId } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(verifyResponse.status).toBe(HttpStatusCodes.NOT_FOUND);
    });
  });
});
