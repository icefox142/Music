# Music Player - 全栈音乐播放器应用

一个现代化的全栈音乐播放器系统，包含后端 API、管理面板和客户端应用。

## 项目结构

```
Music/
├── clhoria-template/    # 后端 API (Hono + Node.js + PostgreSQL)
├── refine-project/      # 管理面板前端 (Refine + React + shadcn/ui)
├── music-frontend/      # 客户端前端 (Vite + React + React Router)
└── README.md           # 项目文档（本文件）
```

## 技术栈

### 后端 (clhoria-template)
- **框架**: Hono + Node.js 25
- **数据库**: PostgreSQL + Drizzle ORM
- **缓存**: Redis (ioredis)
- **认证**: JWT (admin/client 双层)
- **权限**: Casbin RBAC + KeyMatch3
- **验证**: Zod (中文错误消息)
- **API 文档**: OpenAPI 3.1.0 + Scalar UI
- **测试**: Vitest
- **任务队列**: pg-boss
- **日志**: 结构化日志系统

### 管理面板前端 (refine-project)
- **框架**: Refine + React 19
- **路由**: React Router v7
- **UI 组件**: shadcn/ui + Tailwind CSS
- **状态管理**: TanStack Query (React Query)
- **API 类型**: openapi-fetch + openapi-react-query
- **认证**: JWT + 自动刷新
- **权限**: Casbin RBAC 集成

### 客户端前端 (music-frontend)
- **框架**: Vite + React 19
- **路由**: React Router v7 (Hash 模式)
- **状态管理**: TanStack Query + Zustand
- **音频播放**: Howler.js
- **UI 组件**: 自定义组件 + Tailwind CSS
- **认证**: JWT + localStorage

## 核心特性

### 设计理念
- **Code as Configuration**: 权限、菜单、字典通过代码定义，零运行时开销
- **类型安全**: TypeScript 全栈类型同步，编译时错误检测
- **OpenAPI 优先**: 自动生成类型和文档，减少手动同步

### 后端特性
- ✅ 三层 API 架构 (public/client/admin)
- ✅ 自动路由加载 (`import.meta.glob`)
- ✅ 声明式配置 (`app.config.ts`)
- ✅ 单例系统 (DB, Redis, Casbin, Logger)
- ✅ 三层依赖注入
- ✅ 垂直切片架构 + Transaction Script
- ✅ Effect-TS 基础设施层
- ✅ 自动 OpenAPI 文档生成

### 管理面板特性
- ✅ 类型安全的 API 调用
- ✅ Casbin RBAC 权限集成
- ✅ JWT 自动刷新 + 队列管理
- ✅ 权限缓存 (stale-while-revalidate)
- ✅ 系统管理页面 (用户、角色、字典、参数)
- ✅ OpenAPI 类型自动生成

### 客户端特性
- ✅ 音乐播放器 (Howler.js)
- ✅ 播放列表管理
- ✅ 表情包浏览和筛选
- ✅ 标签筛选系统
- ✅ 悬浮球侧边栏
- ✅ 响应式设计

## 快速开始

### 环境要求
- Node.js 25+
- PostgreSQL 18+ (或 17+)
- Redis 7+
- pnpm 9+

### 安装依赖

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

### 配置环境变量

**后端** (`clhoria-template/.env`):
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/music_db
REDIS_URL=redis://localhost:6379
JWT_ADMIN_SECRET=your-admin-secret-here
JWT_CLIENT_SECRET=your-client-secret-here
```

**管理面板** (`refine-project/.env.development`):
```env
VITE_APP_BASEURL=http://localhost:9999
VITE_OSS_URL=  # 可选：对象存储 URL
```

**客户端** (`music-frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:9999
VITE_TEST_TOKEN=  # 可选：开发测试 JWT
```

### 启动开发服务器

```bash
# 终端 1: 后端 (http://localhost:9999)
cd clhoria-template
pnpm dev

# 终端 2: 管理面板 (http://localhost:5173)
cd refine-project
pnpm dev

# 终端 3: 客户端 (http://localhost:5174)
cd music-frontend
pnpm dev
```

### 数据库初始化

```bash
cd clhoria-template

# 开发环境：直接推送 schema 变更
pnpm push

# 生产环境：生成并执行迁移
pnpm generate
pnpm migrate

# 初始化种子数据
pnpm seed
```

## 服务端口

| 服务 | URL | 端口 |
|------|-----|------|
| 后端 API | http://localhost:9999 | 9999 |
| API 文档 (Scalar) | http://localhost:9999/api/admin/doc | 9999 |
| 管理面板 | http://localhost:5173 | 5173 |
| 客户端应用 | http://localhost:5174 | 5174 |
| PostgreSQL | localhost | 5432 |
| Redis | localhost | 6379 |

## API 文档

- **管理端 API**: http://localhost:9999/api/admin/doc
- **客户端 API**: http://localhost:9999/api/doc

### API 分层

- `/api/public/*` - 公开访问，无需认证
- `/api/client/*` - JWT 认证，面向普通用户
- `/api/admin/*` - JWT + RBAC + 审计日志，面向管理员

## 主要功能模块

### 用户管理
- 用户 CRUD
- 角色分配
- 权限管理 (Casbin)

### 音乐管理
- 歌曲管理
- 播放列表管理
- 播放统计
- 收藏功能

### 表情包管理
- 表情包 CRUD
- 标签筛选
- 收藏功能
- 使用统计

### 系统管理
- 字典管理
- 参数配置
- 操作日志
- 任务队列 (pg-boss)

## 开发指南

### 后端开发流程

1. **编写代码** (schema, routes, handlers, types)
2. **类型检查**: `pnpm typecheck && pnpm lint:fix`
3. **编写测试**: 参考 `src/routes/admin/system/users/__tests__/`
4. **运行测试**: `pnpm test`
5. **提交代码**

**数据库 Schema 变更**:
- 开发: 修改 schema → `pnpm push`
- 生产: 修改 schema → `pnpm generate` → `pnpm migrate`

### 前端开发流程

**管理面板**:
```bash
# 后端 API 变更后，重新生成类型
pnpm openapi

# 生成的类型文件
src/api/admin.d.ts   # 管理端 API 类型
src/api/public.d.ts  # 公开 API 类型
```

**客户端前端**:
- 更新 `src/api/` 中的 API 客户端函数
- 更新 `src/types/` 中的类型定义
- 无自动生成，需手动维护

### 代码规范

**后端**:
- 响应格式: `Resp.ok(data)` / `Resp.fail("error")`
- 日志: 使用 `logger` / `operationLogger` / `loginLogger`
- 日期: `date-fns` 库
- 查询: 使用枚举 `eq(table.status, Status.ENABLED)`
- 类型: 优先从 Zod 推断 `z.infer<typeof schema>`

**前端**:
- 组件: 函数组件 + Hooks
- 状态: React Query (服务端) + Zustand (客户端)
- 路由: React Router
- 样式: Tailwind CSS + CSS Modules

## 测试

### 后端测试

```bash
cd clhoria-template

# 运行所有测试
pnpm test

# 运行特定测试
pnpm test users

# 监听模式
pnpm test --watch
```

### 测试结构

```
src/routes/
└── admin/
    └── system/
        └── users/
            ├── users.handlers.ts
            ├── users.routes.ts
            └── __tests__/
                └── users.test.ts
```

## 部署

### 后端部署

```bash
cd clhoria-template

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

### 前端部署

**管理面板**:
```bash
cd refine-project
pnpm build
pnpm start
```

**客户端**:
```bash
cd music-frontend
pnpm build
pnpm preview
```

## 故障排查

### 常见问题

**CORS 错误**: 检查 `app.config.ts` 中的 CORS 配置

**数据库连接失败**: 确保 PostgreSQL 和 Redis 正在运行

**401 未授权**: 检查 JWT token 是否有效，后端 `/api/{tier}/auth/refresh` 必须可访问

**类型不匹配**:
- 管理面板: 运行 `pnpm openapi` 重新生成类型
- 客户端: 手动更新 API 客户端和类型

**PostgreSQL 版本问题**: 
- PostgreSQL 18: 使用 `uuidv7()` 函数
- PostgreSQL 17 及以下: 修改 `base-columns.ts` 使用 `uuid` 库的 `uuidV7()` 函数

## 文档

- [后端详细文档](clhoria-template/CLAUDE.md)
- [管理面板 README](refine-project/README.MD)
- [API 测试指南](API测试指南.md)

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
