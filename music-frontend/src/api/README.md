# API 使用指南

本项目的所有API调用都封装在 `src/api/` 目录下，与后端接口完全对应。

## 目录结构

```
api/
├── index.ts                    # 统一导出
├── lib/
│   └── axios.ts               # Axios实例配置（JWT拦截器）
├── songs.ts                   # 歌曲 API
├── playlists.ts               # 歌单 API
├── playlist-songs.ts          # 歌单歌曲关联 API
├── emojis.ts                  # 表情包 API
├── emoji-collections.ts       # 表情包集合 API
├── emoji-favorites.ts         # 表情收藏 API
├── emoji-usage-logs.ts        # 表情使用记录 API
├── notifications.ts           # 通知 API（SSE）
└── users.ts                   # 用户 API
```

## 使用示例

### 1. 导入API

```typescript
// 方式1：从统一入口导入
import { songsApi, playlistsApi } from "@/api";

// 方式2：直接导入特定API
import { emojisApi } from "@/api/emojis";
```

### 2. 歌曲 API

```typescript
import { songsApi } from "@/api";

// 获取歌曲列表（支持搜索、筛选、排序）
const songs = await songsApi.getList({
  page: 1,
  pageSize: 20,
  search: "周杰伦",
  genre: "POP",
  language: "CHINESE",
  sortBy: "playCount",
  order: "desc"
});

// 获取歌曲详情
const song = await songsApi.getById("uuid");

// 创建歌曲
const newSong = await songsApi.create({
  title: "新歌",
  artist: "艺术家",
  audioUrl: "https://...",
  duration: 180,
  genre: "POP",
  language: "CHINESE"
});

// 更新歌曲
const updated = await songsApi.update(id, { title: "新标题" });

// 删除歌曲
await songsApi.delete(id);
```

### 3. 歌单 API

```typescript
import { playlistsApi } from "@/api";

// 获取所有歌单
const playlists = await playlistsApi.getList({
  page: 1,
  pageSize: 20,
  isPublic: true,
  sortBy: "playCount"
});

// 获取我的歌单
const mine = await playlistsApi.getMine({ page: 1, pageSize: 20 });

// 获取公开歌单
const public = await playlistsApi.getPublic({ page: 1, pageSize: 20 });

// 创建歌单
const newPlaylist = await playlistsApi.create({
  name: "我的最爱",
  description: "收藏的歌曲",
  isPublic: false
});

// 更新歌单
const updated = await playlistsApi.update(id, { name: "新名称" });

// 删除歌单
await playlistsApi.delete(id);
```

### 4. 歌单歌曲管理

```typescript
import { playlistSongsApi } from "@/api";

// 获取歌单中的歌曲
const songs = await playlistSongsApi.getSongs(playlistId);

// 添加歌曲到歌单
await playlistSongsApi.addSong(playlistId, {
  songId: "song-uuid",
  position: 0
});

// 批量添加歌曲
await playlistSongsApi.batchAddSongs(playlistId, {
  songIds: ["id1", "id2", "id3"]
});

// 移除歌曲
await playlistSongsApi.removeSong(playlistId, songId);

// 批量移除歌曲
await playlistSongsApi.batchRemoveSongs(playlistId, {
  songIds: ["id1", "id2"]
});

// 更新歌曲位置
await playlistSongsApi.updatePosition(playlistId, songId, 5);

// 批量更新位置
await playlistSongsApi.batchUpdatePositions(playlistId, [
  { songId: "id1", position: 0 },
  { songId: "id2", position: 1 }
]);
```

### 5. 表情包 API

```typescript
import { emojisApi, emojiCollectionsApi, emojiFavoritesApi } from "@/api";

// 搜索表情包
const emojis = await emojisApi.getList({
  page: 1,
  pageSize: 20,
  tags: ["happy", "cat"],
  category: "动物"
});

// 获取表情包集合
const collections = await emojiCollectionsApi.getList({
  isFeatured: true,
  sortBy: "downloadCount"
});

// 添加收藏
await emojiFavoritesApi.add(emojiId);

// 取消收藏
await emojiFavoritesApi.remove(emojiId);

// 检查收藏状态
const { isFavorited } = await emojiFavoritesApi.check(emojiId);
```

### 6. 表情使用记录

```typescript
import { emojiUsageLogsApi } from "@/api";

// 记录使用
await emojiUsageLogsApi.record({
  emojiId: "uuid",
  context: "chat",
  targetId: "chat-room-id"
});

// 批量记录
await emojiUsageLogsApi.batchRecord([
  { emojiId: "id1", context: "chat" },
  { emojiId: "id2", context: "comment" }
]);

// 获取热门表情
const popular = await emojiUsageLogsApi.getPopular({
  context: "chat",
  limit: 10
});

// 获取统计信息
const stats = await emojiUsageLogsApi.getStats(emojiId);
```

### 7. 实时通知（SSE）

```typescript
import { subscribeToNotifications } from "@/api";

// 订阅通知
const eventSource = subscribeToNotifications(
  (message) => {
    console.log("收到通知:", message);

    if (message.type === "notification") {
      // 处理通知
      showNotification(message.data);
    } else if (message.type === "connected") {
      console.log("已连接到通知服务");
    }
  },
  (error) => {
    console.error("通知连接错误:", error);
  }
);

// 取消订阅
eventSource.close();
```

### 8. 与 React Query 结合使用

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { songsApi } from "@/api";

// 获取歌曲列表
function useSongs(params: SongQueryParams) {
  return useQuery({
    queryKey: ["songs", params],
    queryFn: () => songsApi.getList(params)
  });
}

// 创建歌曲
function useCreateSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: songsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    }
  });
}
```

## JWT 认证

所有API请求会自动从 `localStorage.getItem("access_token")` 获取JWT token并添加到请求头：

```typescript
headers: {
  Authorization: `Bearer ${token}`
}
```

Token过期时会自动清除并跳转到登录页。

## 错误处理

API调用失败时会抛出错误，建议使用 try-catch 处理：

```typescript
try {
  const songs = await songsApi.getList({ page: 1 });
  console.log(songs);
} catch (error) {
  if (error.response?.status === 401) {
    // 未授权
  } else if (error.response?.status === 500) {
    // 服务器错误
  }
  console.error("获取歌曲失败:", error);
}
```

## 类型定义

所有API都有完整的TypeScript类型定义：

- `ApiResponse<T>` - 标准响应格式
- `PaginatedResponse<T>` - 分页响应格式
- 具体的实体类型（Song, Playlist, Emoji等）

从 `@/types/api` 导入或从API文件中导出。
