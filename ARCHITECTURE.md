# Music Player - 技术架构文档

## 目录

- [系统架构](#系统架构)
- [后端架构](#后端架构)
- [前端架构](#前端架构)
- [数据库设计](#数据库设计)
- [认证与授权](#认证与授权)
- [API 设计](#api-设计)
- [状态管理](#状态管理)
- [部署架构](#部署架构)

## 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         浏览器                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  管理面板      │  │  客户端应用    │  │  API 文档     │      │
│  │  :5173       │  │  :5174       │  │  /doc        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────┬──────────────────┬───────────────┬───────────┘
              │                  │               │
         ┌────▼────┐       ┌────▼────┐     ┌────▼────┐
         │  Hono   │       │  Hono   │     │  Hono   │
         │ Routes  │       │ Routes  │     │  Docs   │
         └────┬────┘       └────┬────┘     └────┬────┘
              │                │               │
         ┌────▼────────────────▼───────────────▼────┐
         │         Middleware Chain                │
         │  Request ID → Logging → Security → ...   │
         └────┬────────────────────────────────┬────┘
              │                                │
    ┌─────────▼─────────┐          ┌──────────▼──────────┐
    │  Business Logic   │          │   Infrastructure    │
    │  (Routes/Handlers)│          │  (DB, Redis, Queue) │
    └─────────┬─────────┘          └──────────┬──────────┘
              │                                │
    ┌─────────▼────────────────────────────────▼────┐
    │          Data Layer (Drizzle ORM)             │
    │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
    │  │PostgreSQL│  │  Redis   │  │ pg-boss  │    │
    │  └──────────┘  └──────────┘  └──────────┘    │
    └────────────────────────────────────────────────┘
```

## 后端架构

### 技术栈选择

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 25+ | 运行时 |
| Hono | Latest | Web 框架 |
| Drizzle ORM | Latest | ORM |
| PostgreSQL | 18+ | 主数据库 |
| Redis | 7+ | 缓存/会话 |
| Casbin | Latest | 权限控制 |
| Zod | Latest | 数据验证 |
| pg-boss | Latest | 任务队列 |
| Vitest | Latest | 测试框架 |

### 目录结构

```
clhoria-template/
├── src/
│   ├── db/                 # 数据库
│   │   ├── schema/         # Schema 定义
│   │   │   ├── _base/      # 基础字段
│   │   │   ├── admin/      # 管理端表
│   │   │   ├── client/     # 客户端表
│   │   │   └── public/     # 公共表
│   │   └── index.ts        # DB 实例
│   ├── routes/             # 路由
│   │   ├── public/         # 公开路由
│   │   ├── client/         # 客户端路由
│   │   ├── admin/          # 管理端路由
│   │   └── {tier}/
│   │       ├── {feature}/
│   │       │   ├── *.routes.ts
│   │       │   ├── *.handlers.ts
│   │       │   ├── *.schema.ts
│   │       │   ├── *.types.ts
│   │       │   ├── *.helpers.ts
│   │       │   └── __tests__/
│   │       └── _middleware.ts  # Tier 中间件
│   ├── lib/                # 工具库
│   │   ├── core/           # 核心功能
│   │   ├── services/       # 服务层
│   │   └── utils/          # 工具函数
│   └── tests/              # 测试工具
├── app.config.ts           # 应用配置
├── create-app.ts           # App 创建
└── vite.config.ts
```

### 核心设计模式

#### 1. 垂直切片架构 (Vertical Slice Architecture)

```
Feature/
├── routes/          # 路由定义
├── handlers/        # 业务逻辑
├── schema/          # 验证 Schema
├── types/           # 类型定义
└── helpers/         # 辅助函数
```

**优势**:
- 高内聚，低耦合
- 易于定位代码
- 独立测试

#### 2. Transaction Script 模式

**适用场景**: 80% 的简单 CRUD 操作

```typescript
export const create: Handler = async (c) => {
  const body = c.req.valid("json");
  const [item] = await db.insert(table).values(body).returning();
  return c.json(Resp.ok(item), HttpStatusCodes.OK);
};
```

**优势**:
- 简单直接
- 易于理解
- 快速开发

#### 3. 三层依赖注入

```typescript
// 1. Module Singletons (Process Level)
const db = new Database();

// 2. Hono Context (Request Level)
app.get("/api", (c) => {
  const db = c.get("db");
});

// 3. Effect-TS Layer (Composable)
const program = pipe(
  effect,
  provideContext(dbLayer)
);
```

### 中间件链

```
Request → Request ID → Logging → Security → Timeout → Rate Limit → Body Limit → Compression → Routes
```

**执行顺序**:
1. **Request ID**: 生成唯一请求 ID
2. **Logging**: 记录请求信息
3. **Security**: CORS, Helmet, 安全头
4. **Timeout**: 请求超时控制
5. **Rate Limit**: 速率限制
6. **Body Limit**: 请求体大小限制
7. **Compression**: 响应压缩
8. **Tier Middleware**: Tier 级别中间件
9. **Route Handlers**: 路由处理器

### 自动路由加载

```typescript
// 使用 import.meta.glob 自动加载路由
const routes = import.meta.glob("./routes/**/*.index.ts", {
  eager: true,
});

for (const path in routes) {
  const module = routes[path];
  app.route("/", module.default);
}
```

**优势**:
- 零配置路由注册
- 自动发现新路由
- 支持热模块替换

### 声明式配置

```typescript
// app.config.ts
export default defineConfig({
  tiers: {
    admin: {
      openapi: {
        enabled: true,
        path: "/api/admin/doc",
      },
      middleware: [...adminMiddleware],
    },
    client: {
      openapi: {
        enabled: true,
        path: "/api/client/doc",
      },
    },
  },
});
```

## 前端架构

### 管理面板 (refine-project)

#### 技术栈

- **Refine**: React 全栈框架
- **React Router v7**: 路由
- **shadcn/ui**: UI 组件库
- **TanStack Query**: 数据获取
- **openapi-fetch**: 类型安全 API 客户端

#### 目录结构

```
refine-project/
├── src/
│   ├── components/
│   │   └── ui/          # shadcn/ui 组件
│   ├── pages/           # 页面组件
│   ├── providers/       # Context Providers
│   ├── api/             # API 类型生成
│   │   ├── admin.d.ts
│   │   └── public.d.ts
│   ├── lib/             # 工具库
│   └── App.tsx
```

#### 类型生成流程

```
后端 OpenAPI → openapi-typescript → 类型文件 → openapi-fetch
```

```bash
# 生成类型
pnpm openapi

# 输出文件
src/api/admin.d.ts    # 管理端类型
src/api/public.d.ts   # 公开 API 类型
```

#### 认证流程

```
登录 → 存储 access_token (localStorage)
      → 存储 refresh_token (httpOnly cookie)
      → 设置权限缓存

请求过期 → 拦截 401 → 自动刷新 token
          → 重试队列中的请求
          → 清除权限缓存
```

### 客户端应用 (music-frontend)

#### 技术栈

- **Vite**: 构建工具
- **React 19**: UI 框架
- **React Router v7**: 路由
- **TanStack Query**: 服务端状态
- **Zustand**: 客户端状态
- **Howler.js**: 音频播放

#### 目录结构

```
music-frontend/
├── src/
│   ├── api/             # API 客户端
│   │   ├── songs.ts
│   │   ├── playlists.ts
│   │   └── emojis.ts
│   ├── components/      # 组件
│   │   ├── music/
│   │   ├── memes/
│   │   └── layout/
│   ├── hooks/           # 自定义 Hooks
│   ├── stores/          # Zustand stores
│   ├── pages/           # 页面组件
│   ├── routes/          # 路由配置
│   ├── types/           # 类型定义
│   ├── lib/             # 工具库
│   └── App.tsx
```

#### 状态管理策略

**服务端状态** (TanStack Query):
- 歌曲、播放列表数据
- 表情包数据
- 用户信息

**客户端状态** (Zustand):
- 播放器状态 (当前播放、播放/暂停)
- UI 状态 (侧边栏展开/折叠)

## 数据库设计

### 表分类

```
Schema/
├── _base/          # 基础字段表
├── admin/          # 管理端表
├── client/         # 客户端表
└── public/         # 公共表
```

### 命名规范

- **表名**: snake_case (例: `client_emojis`)
- **字段名**: snake_case (例: `created_at`)
- **枚举**: PascalCase (例: `Status.ENABLED`)
- **索引**: `idx_{table}_{columns}`

### 基础字段

所有表继承以下基础字段:

```typescript
{
  id: string,              // UUID v7
  createdAt: string,       // ISO 8601
  updatedAt: string,       // ISO 8601
  createdBy: string,       // UUID
  updatedBy: string,       // UUID
  status: Status,          // ENABLED/DISABLED
}
```

### JSONB 字段

用于存储复杂数据结构:

```typescript
{
  tags: string[],          // 标签数组
  metadata: Record<string, unknown>,  // 元数据
}
```

## 认证与授权

### JWT 双层架构

```
┌─────────────────────────────────────┐
│         JWT Tokens                  │
├─────────────────────────────────────┤
│  Admin Token                         │
│  - Secret: JWT_ADMIN_SECRET         │
│  - Tier: /api/admin/*               │
│  - Claims: {sub, roles, permissions}│
├─────────────────────────────────────┤
│  Client Token                        │
│  - Secret: JWT_CLIENT_SECRET        │
│  - Tier: /api/client/*              │
│  - Claims: {sub, userId}            │
└─────────────────────────────────────┘
```

### Token 刷新流程

```
客户端请求 → 过期 (401) → authMiddleware 拦截
    ↓
刷新 Token API → 新 access_token
    ↓
重试原请求 → 成功
```

### Casbin RBAC

**模型**: RBAC with KeyMatch3

```python
# 请求
p, admin, /api/admin/users, GET
p, admin, /api/admin/users/*, *

# 策略
p, admin, /api/admin/system/users, *
p, admin, /api/admin/system/roles, *
```

**KeyMatch3 支持通配符**:
- `/api/admin/*` 匹配所有管理端路由
- `/api/admin/system/:id` 匹配资源路由

## API 设计

### RESTful 规范

```
GET    /api/resource          # 列表
POST   /api/resource          # 创建
GET    /api/resource/:id      # 详情
PATCH  /api/resource/:id      # 更新
DELETE /api/resource/:id      # 删除
```

### 批量操作

```
POST   /api/resource/bulk     # 批量创建
PATCH  /api/resource/bulk     # 批量更新
DELETE /api/resource/bulk     # 批量删除
```

### 响应格式

**成功**:
```json
{
  "data": {...},
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

**失败**:
```json
{
  "message": "错误信息",
  "error": {
    "name": "Error",
    "issues": [...]
  }
}
```

### 分页参数

```
GET /api/resource?page=1&pageSize=20&sortBy=createdAt&order=desc
```

## 状态管理

### 服务端状态 (TanStack Query)

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['songs', page],
  queryFn: () => songsApi.getList({ page }),
});
```

**优势**:
- 自动缓存
- 后台刷新
- 请求去重
- 乐观更新

### 客户端状态 (Zustand)

```typescript
const useMusicStore = create((set) => ({
  currentSong: null,
  isPlaying: false,
  play: (song) => set({ currentSong: song, isPlaying: true }),
  pause: () => set({ isPlaying: false }),
}));
```

**使用场景**:
- 播放器状态
- UI 交互状态
- 临时数据

## 部署架构

### 开发环境

```
┌──────────────────────────────────────┐
│         开发机                        │
│  ┌──────────┐  ┌──────────┐         │
│  │ Backend  │  │ Frontend │         │
│  │ :9999    │  │ :5173/4  │         │
│  └────┬─────┘  └──────────┘         │
└───────┼──────────────────────────────┘
        │
    ┌───▼────┐  ┌────────┐
    │  PG    │  │ Redis  │
    │ :5432  │  │ :6379  │
    └────────┘  └────────┘
```

### 生产环境

```
┌──────────────────────────────────────────┐
│             负载均衡 (Nginx)              │
│  ┌────────────────┐  ┌────────────────┐ │
│  │  静态资源       │  │   API 代理     │ │
│  └────────────────┘  └────────┬───────┘ │
└───────────────────────────────┼─────────┘
                                │
            ┌───────────────────┼───────────┐
            │                   │           │
        ┌───▼────┐        ┌────▼────┐  ┌───▼────┐
        │ Node 1 │        │ Node 2  │  │ Node 3 │
        │ :3000  │        │ :3001   │  │ :3002  │
        └───┬────┘        └────┬────┘  └────┬────┘
            │                  │            │
        ┌───▼──────────────────▼────────────▼──┐
        │           PostgreSQL 主从            │
        │  ┌─────────┐           ┌─────────┐  │
        │  │ Master  │ ←───→     │ Slave   │  │
        │  └─────────┘           └─────────┘  │
        └─────────────────────────────────────┘
        ┌─────────────────────────────────────┐
        │           Redis 集群                 │
        │  ┌─────┐  ┌─────┐  ┌─────┐         │
        │  │Node1│  │Node2│  │Node3│         │
        │  └─────┘  └─────┘  └─────┘         │
        └─────────────────────────────────────┘
```

### Docker 部署

```yaml
# docker-compose.yml
services:
  backend:
    build: ./clhoria-template
    ports:
      - "9999:9999"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  frontend-admin:
    build: ./refine-project
    ports:
      - "5173:80"

  frontend-client:
    build: ./music-frontend
    ports:
      - "5174:80"

  postgres:
    image: postgres:18
    environment:
      - POSTGRES_DB=music_db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    volumes:
      - redis_data:/data
```

## 性能优化

### 后端优化

1. **数据库查询优化**
   - 使用索引
   - 避免 N+1 查询
   - 使用连接池

2. **缓存策略**
   - Redis 缓存热点数据
   - CDN 缓存静态资源
   - HTTP 缓存头

3. **异步处理**
   - 任务队列 (pg-boss)
   - 非阻塞 I/O

### 前端优化

1. **代码分割**
   - 路由级别分割
   - 组件懒加载

2. **资源优化**
   - 图片压缩
   - 字体子集化
   - Tree shaking

3. **渲染优化**
   - 虚拟列表
   - 防抖/节流
   - Memo 组件

## 安全措施

### 后端安全

- ✅ JWT 认证
- ✅ RBAC 权限控制
- ✅ 速率限制
- ✅ CORS 配置
- ✅ Helmet 安全头
- ✅ SQL 注入防护 (参数化查询)
- ✅ XSS 防护 (输入验证)
- ✅ CSRF 防护

### 前端安全

- ✅ XSS 防护 (React 自动转义)
- ✅ HTTPS 强制
- ✅ Token 安全存储
- ✅ Content Security Policy

## 监控与日志

### 日志系统

```typescript
// 结构化日志
logger.info({ userId, action }, "[User]: Login successful");

// 操作日志
operationLogger.info({ userId, resourceId }, "[CRUD]: Update user");

// 登录日志
loginLogger.info({ userId, ip }, "[LOGIN]: User login");
```

### 监控指标

- 请求响应时间
- 数据库查询时间
- 错误率
- 系统负载

## 总结

本架构设计遵循以下原则:

1. **简单优先**: 80% 场景使用简单方案
2. **类型安全**: 全栈 TypeScript + 自动生成
3. **代码即配置**: 零运行时开销
4. **垂直切片**: 高内聚低耦合
5. **自动化**: 自动路由、类型生成、文档生成

通过合理的架构设计，实现了高性能、可维护、可扩展的全栈应用系统。
