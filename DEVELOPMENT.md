# Music Player - 开发指南

## 目录

- [开发环境搭建](#开发环境搭建)
- [后端开发](#后端开发)
- [前端开发](#前端开发)
- [测试指南](#测试指南)
- [代码规范](#代码规范)
- [常见问题](#常见问题)
- [最佳实践](#最佳实践)

## 开发环境搭建

### 前置要求

```bash
# 检查 Node.js 版本
node --version  # 应该 >= 25

# 检查 pnpm 版本
pnpm --version  # 应该 >= 9

# 检查 PostgreSQL
psql --version  # 应该 >= 18

# 检查 Redis
redis-cli --version  # 应该 >= 7
```

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd Music
```

#### 2. 安装依赖

```bash
# 后端
cd clhoria-template
pnpm install

# 管理面板
cd ../refine-project
pnpm install

# 客户端
cd ../music-frontend
pnpm install
```

#### 3. 配置环境变量

**后端** (`.env`):
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库和 Redis
```

**管理面板** (`.env.development`):
```bash
VITE_APP_BASEURL=http://localhost:9999
```

**客户端** (`.env`):
```bash
VITE_API_BASE_URL=http://localhost:9999
```

#### 4. 启动服务

```bash
# 终端 1: PostgreSQL
docker run -d -p 5432:5432 \
  -e POSTGRES_DB=music_db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=pass \
  postgres:18

# 终端 2: Redis
docker run -d -p 6379:6379 redis:7

# 终端 3: 后端
cd clhoria-template
pnpm push     # 推送 schema
pnpm seed     # 初始化数据
pnpm dev      # 启动开发服务器

# 终端 4: 管理面板
cd refine-project
pnpm dev

# 终端 5: 客户端
cd music-frontend
pnpm dev
```

## 后端开发

### CRUD 模块开发

#### 使用 VSCode Snippets

项目包含 CRUD 开发 snippets，快速生成代码：

```bash
# 在 VSCode 中输入以下前缀 + Tab

# CRUD 完整模块
crud-schema      # 完整 schema.ts
crud-routes      # 完整 routes.ts (5个路由)
crud-handlers    # 完整 handlers.ts (5个处理器)
crud-index       # 完整 index.ts

# 单个功能
route-list       # GET /resource
route-create     # POST /resource
route-detail     # GET /resource/:id
route-update     # PATCH /resource/:id
route-delete     # DELETE /resource/:id
route-bulk       # POST /resource/bulk

handler-list     # list handler
handler-create   # create handler
handler-detail   # get handler
handler-update   # update handler
handler-delete   # delete handler

schema-base       # 基础 schema
schema-query      # 查询参数 schema
schema-json       # JSON body schema
```

#### 手动开发流程

**1. 定义 Schema**

```typescript
// src/db/schema/client/songs.ts
import { pgTable, ... } from "drizzle-orm/pg-core";
import { baseColumns } from "../_base/base-columns";

export const clientSongs = pgTable("client_songs", {
  ...baseColumns,
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  // ... 其他字段
});
```

**2. 创建 Zod Schema**

```typescript
// src/routes/client/music/songs/songs.schema.ts
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { clientSongs } from "@/db/schema";

export const insertSongSchema = createInsertSchema(clientSongs);
export const selectSongSchema = createSelectSchema(clientSongs);

export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});
```

**3. 实现 Handlers**

```typescript
// src/routes/client/music/songs/songs.handlers.ts
import type { SongRouteHandlerType } from "./songs.types";
import db from "@/db";
import { Resp } from "@/utils";
import { clientSongs } from "@/db/schema";
import * as HttpStatusCodes from "@/lib/core/stoker/http-status-codes";

export const list: SongRouteHandlerType<"list"> = async (c) => {
  const query = c.req.valid("query");
  
  // 查询逻辑
  const songs = await db
    .select()
    .from(clientSongs)
    .limit(query.pageSize)
    .offset((query.page - 1) * query.pageSize);

  return c.json(Resp.ok(songs), HttpStatusCodes.OK);
};
```

**4. 定义路由**

```typescript
// src/routes/client/music/songs/songs.routes.ts
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import * as handlers from "./songs.handlers";

const App = OpenAPIHono();

// 注册路由
App.openapi(
  createRoute({
    method: "get",
    path: "/songs",
    tags: ["songs"],
    summary: "获取歌曲列表",
    request: { query: listQuerySchema },
    responses: {
      200: {
        description: "成功",
        content: { "application/json": { schema: selectSongSchema.array() } },
      },
    },
  }),
  handlers.list
);

export default App;
```

**5. 导出模块**

```typescript
// src/routes/client/music/songs/songs.index.ts
import routes from "./songs.routes";

export default routes;
```

### 数据库 Schema 开发

#### 添加新表

```typescript
// src/db/schema/client/emojis.ts
import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { baseColumns } from "../_base/base-columns";

export const clientEmojis = pgTable("client_emojis", {
  ...baseColumns,
  name: text("name").notNull(),
  description: text("description"),
  tags: text("tags").array().notNull().default([]),
  imageUrl: text("image_url").notNull(),
  status: statusColumn("status"),
});
```

#### 添加索引

```typescript
// src/db/schema/client/emojis.ts
import { pgTable, text, index } from "drizzle-orm/pg-core";

export const clientEmojis = pgTable(
  "client_emojis",
  {
    ...baseColumns,
    name: text("name").notNull(),
    // ...
  },
  (table) => ({
    nameIdx: index("idx_emojis_name").on(table.name),
    tagsIdx: index("idx_emojis_tags").using("gin", table.tags),
  })
);
```

#### 推送 Schema 变更

```bash
# 开发环境：直接推送
pnpm push

# 生产环境：生成迁移
pnpm generate  # 生成迁移文件
pnpm migrate   # 执行迁移
```

### 中间件开发

#### Tier 中间件

```typescript
// src/routes/admin/_middleware.ts
import { createMiddleware } from "@/lib/core/middleware";

export const adminAuthMiddleware = createMiddleware(async (c, next) => {
  // 验证 JWT
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return c.json({ message: "未授权" }, 401);
  }

  // 验证权限
  // ...

  await next();
});
```

#### 路由级中间件

```typescript
App.use("*", adminAuthMiddleware);
App.get("/users", handler);  // 需要认证
```

### OpenAPI 文档

#### 定义文档

```typescript
App.openapi(
  createRoute({
    method: "post",
    path: "/users",
    tags: ["users"],
    summary: "创建用户",
    description: "创建新用户账户",
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: { "application/json": { schema: insertUserSchema } },
      },
    },
    responses: {
      200: { description: "成功" },
      400: { description: "请求参数错误" },
    },
  }),
  handlers.create
);
```

#### 访问文档

- 管理端: http://localhost:9999/api/admin/doc
- 客户端: http://localhost:9999/api/doc

## 前端开发

### 管理面板开发

#### 生成 API 类型

```bash
# 确保后端正在运行
cd refine-project
pnpm openapi

# 查看生成的类型
cat src/api/admin.d.ts
```

#### 创建资源页面

```typescript
// src/pages/users/index.tsx
import { List, Show, Create, Edit } from "@refinedev/core";
import { useTable } from "@refinedev/core";

export const UserList = () => {
  const { tableQuery } = useTable({
    resource: "users",
    pagination: { current: 1, pageSize: 10 },
  });

  return (
    <List>
      <table>
        <thead>
          <tr>
            <th>用户名</th>
            <th>邮箱</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {tableQuery.data?.data.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <ShowButton recordItemId={user.id} />
                <EditButton recordItemId={user.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </List>
  );
};
```

#### 权限控制

```typescript
import { useCan } from "@refinedev/core";

const { data: canCreate } = useCan({
  resource: "users",
  action: "create",
});

if (!canCreate) {
  return <div>无权限</div>;
}
```

### 客户端开发

#### 创建 API 客户端

```typescript
// src/api/songs.ts
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import api from "@/lib/axios";

export const songsApi = {
  getList: async (params?: SongQueryParams) => {
    const response = await api.get<ApiResponse<PaginatedResponse<Song>>>(
      "/api/client/songs",
      { params }
    );
    return response.data;
  },

  getById: async (id: string) => {
    return api.get<ApiResponse<Song>>(`/api/client/songs/${id}`);
  },
};
```

#### 创建自定义 Hook

```typescript
// src/hooks/useSongs.ts
import { useQuery } from "@tanstack/react-query";
import { songsApi } from "@/api/songs";

export function useSongs(params?: SongQueryParams) {
  return useQuery({
    queryKey: ["songs", params],
    queryFn: () => songsApi.getList(params),
  });
}
```

#### 创建 Zustand Store

```typescript
// src/stores/useMusicStore.ts
import { create } from "zustand";

interface MusicState {
  currentSong: Song | null;
  isPlaying: boolean;
  play: (song: Song) => void;
  pause: () => void;
}

export const useMusicStore = create<MusicState>((set) => ({
  currentSong: null,
  isPlaying: false,
  play: (song) => set({ currentSong: song, isPlaying: true }),
  pause: () => set({ isPlaying: false }),
}));
```

#### 路由配置

```typescript
// src/routes/index.tsx
import { createBrowserRouter } from "react-router";
import { Home } from "@/pages/Home";
import { Music } from "@/pages/Music";
import { Memes } from "@/pages/Memes";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/music", element: <Music /> },
  { path: "/memes", element: <Memes /> },
]);
```

### 组件开发

#### 函数组件

```typescript
// src/components/music/SongCard.tsx
import { useMusicStore } from "@/stores/useMusicStore";

interface SongCardProps {
  song: Song;
}

export function SongCard({ song }: SongCardProps) {
  const { play } = useMusicStore();

  return (
    <div className="song-card">
      <img src={song.coverUrl} alt={song.title} />
      <h3>{song.title}</h3>
      <p>{song.artist}</p>
      <button onClick={() => play(song)}>播放</button>
    </div>
  );
}
```

#### CSS Modules

```typescript
// src/components/music/SongCard.module.css
.songCard {
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.songCard:hover {
  transform: translateY(-4px);
}
```

## 测试指南

### 后端测试

#### 单元测试

```typescript
// src/routes/admin/system/users/__tests__/users.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import db from "@/db";
import { clientUsers } from "@/db/schema";

describe("Users API", () => {
  beforeAll(async () => {
    // 设置测试数据
    await db.insert(clientUsers).values({
      username: "test",
      email: "test@example.com",
    });
  });

  it("should list users", async () => {
    const response = await app.request("/api/admin/system/users");
    expect(response.status).toBe(200);
  });
});
```

#### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test users

# 监听模式
pnpm test --watch

# 覆盖率
pnpm test --coverage
```

### 前端测试

#### 组件测试

```typescript
// SongCard.test.tsx
import { render, screen } from "@testing-library/react";
import { SongCard } from "./SongCard";

describe("SongCard", () => {
  it("renders song info", () => {
    const song = { id: "1", title: "Test Song", artist: "Artist" };
    render(<SongCard song={song} />);
    
    expect(screen.getByText("Test Song")).toBeInTheDocument();
    expect(screen.getByText("Artist")).toBeInTheDocument();
  });
});
```

## 代码规范

### TypeScript 规范

#### 类型定义

```typescript
// ✅ 好 - 使用接口定义对象
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ 差 - 使用 any
function processUser(user: any) { }

// ✅ 好 - 使用泛型
function identity<T>(value: T): T {
  return value;
}
```

#### 类型推断

```typescript
// ✅ 好 - 让 TypeScript 推断类型
const numbers = [1, 2, 3];

// ❌ 差 - 显式类型标注
const numbers: number[] = [1, 2, 3];
```

### 命名规范

#### 文件命名

```
组件:        PascalCase  (SongCard.tsx)
Hook:        camelCase   (useSongs.ts)
工具函数:     camelCase   (formatDate.ts)
类型:        PascalCase  (SongTypes.ts)
常量:        UPPER_SNAKE_CASE  (API_BASE_URL)
```

#### 变量命名

```typescript
// 组件: PascalCase
export function SongList() { }

// Hook: camelCase + use 前缀
export function useSongs() { }

// 常量: UPPER_SNAKE_CASE
const API_BASE_URL = "http://localhost:9999";

// 枚举: PascalCase
enum Status {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
}
```

### 注释规范

#### JSDoc 注释

```typescript
/**
 * 获取歌曲列表
 * @param params - 查询参数
 * @returns 歌曲列表
 */
export async function getSongs(
  params: SongQueryParams
): Promise<PaginatedResponse<Song>> {
  // 实现
}
```

#### 行内注释

```typescript
// ❌ 差: 无意义的注释
const count = count + 1; // 增加 count

// ✅ 好: 解释原因的注释
const count = count + 1; // 从 0 开始计数，所以需要 +1
```

## 常见问题

### 后端问题

**Q: 如何处理数据库迁移？**

```bash
# 开发环境
pnpm push

# 生产环境
pnpm generate  # 生成迁移文件
pnpm migrate   # 执行迁移
```

**Q: 如何调试 API？**

```bash
# 查看日志
tail -f logs/app.log

# 使用 VSCode 调试器
# 在 launch.json 中配置
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/src/index.ts"
}
```

**Q: 如何添加新的 API 端点？**

1. 在 `src/routes/{tier}/{feature}/` 创建目录
2. 创建 `*.routes.ts`, `*.handlers.ts`, `*.schema.ts`
3. 创建 `*.index.ts` 导出路由
4. 使用 `import.meta.glob` 自动加载

### 前端问题

**Q: 管理面板类型不更新？**

```bash
# 重新生成类型
pnpm openapi

# 确保后端正在运行
```

**Q: 客户端路由不工作？**

```typescript
// 检查路由配置
// src/routes/index.tsx

// 检查 RouterProvider
// src/App.tsx
<RouterProvider router={router} />
```

**Q: 如何处理 API 错误？**

```typescript
const { data, error } = useQuery({
  queryKey: ["songs"],
  queryFn: () => songsApi.getList(),
});

if (error) {
  return <div>加载失败: {error.message}</div>;
}
```

## 最佳实践

### 性能优化

#### 后端优化

```typescript
// ✅ 使用连接池
const pool = new Pool({ max: 20 });

// ✅ 批量查询
const users = await db
  .select()
  .from(users)
  .whereIn(id, [1, 2, 3]);

// ✅ 使用索引
// 在 schema 中定义索引
```

#### 前端优化

```typescript
// ✅ 使用 React.memo
export const SongCard = React.memo(({ song }) => {
  // ...
});

// ✅ 使用 useMemo
const sortedSongs = useMemo(() => {
  return songs.sort((a, b) => a.title.localeCompare(b.title));
}, [songs]);

// ✅ 使用 useCallback
const handlePlay = useCallback(() => {
  play(song);
}, [song, play]);
```

### 安全实践

```typescript
// ✅ 验证输入
const body = c.req.valid("json");

// ✅ 参数化查询
db.select()
  .from(users)
  .where(eq(users.id, id));  // ✅ 安全
  // .where(sql`id = ${id}`);  // ❌ 危险

// ✅ 使用环境变量
const secret = process.env.JWT_SECRET;
```

### 代码组织

```typescript
// ✅ 按功能组织
/src/routes/client/music/
  ├── songs/
  ├── playlists/
  └── favorites/

// ❌ 避免按类型组织
/src/routes/client/
  ├── routes/
  ├── handlers/
  └── schemas/
```

### 错误处理

```typescript
// ✅ 统一错误处理
try {
  const result = await operation();
  return c.json(Resp.ok(result), 200);
} catch (error) {
  logger.error({ error }, "[Operation]: Failed");
  return c.json(Resp.fail("操作失败"), 500);
}

// ❌ 避免吞没错误
try {
  await operation();
} catch (e) {
  // 空的 catch 块
}
```

## 总结

遵循本开发指南，可以：

1. ✅ 快速搭建开发环境
2. ✅ 遵循项目规范进行开发
3. ✅ 编写可维护的代码
4. ✅ 避免常见陷阱
5. ✅ 提高开发效率

如有疑问，参考：
- [README.md](README.md) - 项目概述
- [ARCHITECTURE.md](ARCHITECTURE.md) - 架构文档
- [CLAUDE.md](clhoria-template/CLAUDE.md) - 后端详细文档
