# Music Player

全栈音乐播放器系统：后端 API + 管理面板 + 客户端应用

## 快速开始

```bash
# 安装依赖（三个项目）
cd clhoria-template && pnpm install
cd ../refine-project && pnpm install
cd ../music-frontend && pnpm install

# 启动服务（三个终端）
cd clhoria-template && pnpm dev      # http://localhost:9999
cd refine-project && pnpm dev        # http://localhost:5173
cd music-frontend && pnpm dev        # http://localhost:5174
```

## 技术栈

**后端**: Hono + Node.js 25 + PostgreSQL + Redis + JWT + Casbin
**管理面板**: Refine + React 19 + shadcn/ui
**客户端**: Vite + React 19 + React Router + TanStack Query + Zustand

## 项目结构

```
Music/
├── clhoria-template/    # 后端 API
├── refine-project/      # 管理面板
└── music-frontend/      # 客户端应用
```

## 开发命令

**后端**:
```bash
pnpm dev         # 开发服务器
pnpm build       # 构建
pnpm test        # 测试
pnpm push        # 推送 schema（开发）
pnpm migrate     # 执行迁移（生产）
```

**管理面板**:
```bash
pnpm dev         # 开发服务器
pnpm openapi     # 生成 API 类型
```

**客户端**:
```bash
pnpm dev         # 开发服务器
pnpm build       # 构建
```

## 服务端口

| 服务 | URL | 端口 |
|------|-----|------|
| 后端 API | http://localhost:9999 | 9999 |
| API 文档 | http://localhost:9999/api/admin/doc | 9999 |
| 管理面板 | http://localhost:5173 | 5173 |
| 客户端 | http://localhost:5174 | 5174 |

## 核心特性

- ✅ JWT 双层认证（admin/client）
- ✅ Casbin RBAC 权限控制
- ✅ OpenAPI 自动文档
- ✅ 音乐播放器（Howler.js）
- ✅ 播放列表管理
- ✅ 表情包管理

## 环境配置

**后端** (`.env`):
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/music_db
REDIS_URL=redis://localhost:6379
JWT_ADMIN_SECRET=your-admin-secret
JWT_CLIENT_SECRET=your-client-secret
```

## 文档

- [API 测试指南](API测试指南.md)
- [后端详细文档](clhoria-template/CLAUDE.md)

## 许可证

MIT
