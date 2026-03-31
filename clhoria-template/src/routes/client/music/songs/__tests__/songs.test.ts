import { eq } from "drizzle-orm";
import { jwt } from "hono/jwt";
import { testClient } from "hono/testing";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import db from "@/db";
import { clientSongs } from "@/db/schema";
import env from "@/env";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";
import { MusicGenre, MusicLanguage, Status } from "@/lib/enums";
import songsRouter from "@/routes/client/music/songs/songs.index";
import { getAuthHeaders } from "~/tests/auth-utils";
import { createTestApp } from "~/tests/utils/test-app";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

function createSongsApp() {
  return createTestApp()
    .use("/songs/*", jwt({ secret: env.CLIENT_JWT_SECRET, alg: "HS256" }))
    .route("/", songsRouter);
}

const client = testClient(createSongsApp());

// Test data / 测试数据
const testSong = {
  title: "测试歌曲",
  artist: "测试艺术家",
  audioUrl: "https://example.com/test-song.mp3",
  duration: 180,
  genre: MusicGenre.POP,
  language: MusicLanguage.CHINESE,
  status: Status.ENABLED,
};

/**
 * Clean up test songs
 * 清理测试歌曲
 */
async function cleanupTestData(): Promise<void> {
  try {
    await db
      .delete(clientSongs)
      .where(eq(clientSongs.title, "测试歌曲"));
  }
  catch (error) {
    console.error("清理测试数据失败:", error);
    throw error;
  }
}

describe("songs routes", () => {
  let clientToken: string;
  let testSongId: string;

  beforeAll(async () => {
    // Clean up potentially leftover test data / 清理可能存在的遗留测试数据
    await cleanupTestData();

    // Get client token / 获取 client token
    const { getUserToken } = await import("~/tests/auth-utils");
    clientToken = await getUserToken();

    // Create a test song / 创建测试歌曲
    const [song] = await db
      .insert(clientSongs)
      .values({
        ...testSong,
        createdBy: "test",
        updatedBy: "test",
      })
      .returning();

    testSongId = song.id;
  });

  afterAll(async () => {
    // Ensure all test data is cleaned up / 确保清理所有测试数据
    await cleanupTestData();
  });

  describe("authentication", () => {
    it("should require authentication", async () => {
      const response = await client.songs.$get(
        { query: {} },
        {},
      );

      expect(response.status).toBe(HttpStatusCodes.UNAUTHORIZED);
    });

    it("should allow authenticated client requests", async () => {
      const response = await client.songs.$get(
        { query: { page: 1, pageSize: 10 } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);
    });
  });

  describe("GET /songs", () => {
    it("should list songs", async () => {
      const response = await client.songs.$get(
        { query: { page: 1, pageSize: 10 } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      const json = await response.json();
      expect(json).toMatchObject({
        success: true,
        data: expect.any(Array),
      });
    });

    it("should filter songs by genre", async () => {
      const response = await client.songs.$get(
        { query: { page: 1, pageSize: 10, genre: MusicGenre.POP } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      const json = await response.json();
      expect(json).toMatchObject({
        success: true,
        data: expect.any(Array),
      });
    });

    it("should search songs by title or artist", async () => {
      const response = await client.songs.$get(
        { query: { page: 1, pageSize: 10, search: "测试" } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      const json = await response.json();
      expect(json).toMatchObject({
        success: true,
        data: expect.any(Array),
      });
    });
  });

  describe("GET /songs/:id", () => {
    it("should get song by id", async () => {
      const response = await client.songs[":id"].$get(
        { param: { id: testSongId } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      const json = await response.json();
      expect(json).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: testSongId,
          title: testSong.title,
        }),
      });
    });

    it("should return 404 for non-existent song", async () => {
      const fakeId = "01234567-0123-0123-0123-0123456789ab";
      const response = await client.songs[":id"].$get(
        { param: { id: fakeId } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
    });
  });

  describe("POST /songs", () => {
    it("should create a new song", async () => {
      const newSong = {
        title: "新歌曲",
        artist: "新艺术家",
        audioUrl: "https://example.com/new-song.mp3",
        duration: 200,
        genre: MusicGenre.ROCK,
        language: MusicLanguage.ENGLISH,
      };

      const response = await client.songs.$post(
        { json: newSong },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      const json = await response.json();
      expect(json).toMatchObject({
        success: true,
        data: expect.objectContaining({
          title: newSong.title,
          artist: newSong.artist,
        }),
      });

      // Clean up / 清理
      await db.delete(clientSongs).where(eq(clientSongs.title, "新歌曲"));
    });
  });

  describe("PATCH /songs/:id", () => {
    it("should update song", async () => {
      const updates = { title: "更新的歌曲" };

      const response = await client.songs[":id"].$patch(
        { param: { id: testSongId }, json: updates },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      const json = await response.json();
      expect(json).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: testSongId,
          title: updates.title,
        }),
      });
    });
  });

  describe("DELETE /songs/:id", () => {
    it("should delete song", async () => {
      // Create a temporary song to delete / 创建临时歌曲用于删除
      const [song] = await db
        .insert(clientSongs)
        .values({
          ...testSong,
          title: "待删除歌曲",
          createdBy: "test",
          updatedBy: "test",
        })
        .returning();

      const response = await client.songs[":id"].$delete(
        { param: { id: song.id } },
        { headers: getAuthHeaders(clientToken) },
      );

      expect(response.status).toBe(HttpStatusCodes.OK);

      const json = await response.json();
      expect(json).toMatchObject({
        success: true,
        data: { success: true },
      });
    });
  });
});
