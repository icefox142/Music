# API 接口文档索引

## 基础信息

**Base URL**: `http://localhost:9999`

**认证方式**: JWT Bearer Token

**文档地址**:
- 管理端: http://localhost:9999/api/admin/doc
- 客户端: http://localhost:9999/api/doc

## API 分类

### 公开 API (`/api/public/*`)

无需认证的公开接口。

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/public/params` | GET | 获取系统参数 |
| `/api/public/params/{key}` | GET | 获取单个参数 |

### 客户端 API (`/api/client/*`)

面向普通用户的接口，需要 JWT 认证。

#### 认证

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/client/auth/login` | POST | 用户登录 |
| `/api/client/auth/refresh` | POST | 刷新 Token |
| `/api/client/auth/userinfo` | GET | 获取用户信息 |
| `/api/client/auth/logout` | POST | 用户登出 |

#### 音乐管理

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/client/songs` | GET | 获取歌曲列表 |
| `/api/client/songs` | POST | 创建歌曲 |
| `/api/client/songs/:id` | GET | 获取歌曲详情 |
| `/api/client/songs/:id` | PATCH | 更新歌曲 |
| `/api/client/songs/:id` | DELETE | 删除歌曲 |
| `/api/client/songs/bulk` | POST | 批量创建歌曲 |
| `/api/client/songs/bulk` | PATCH | 批量更新歌曲 |
| `/api/client/songs/bulk` | DELETE | 批量删除歌曲 |

#### 播放列表管理

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/client/playlists` | GET | 获取播放列表列表 |
| `/api/client/playlists` | POST | 创建播放列表 |
| `/api/client/playlists/mine` | GET | 获取我的播放列表 |
| `/api/client/playlists/public` | GET | 获取公开播放列表 |
| `/api/client/playlists/:id` | GET | 获取播放列表详情 |
| `/api/client/playlists/:id` | PATCH | 更新播放列表 |
| `/api/client/playlists/:id` | DELETE | 删除播放列表 |
| `/api/client/playlists/:id/songs` | GET | 获取列表中的歌曲 |
| `/api/client/playlists/:id/songs` | POST | 添加歌曲到列表 |
| `/api/client/playlists/:id/songs/:songId` | DELETE | 从列表移除歌曲 |

#### 表情包管理

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/client/emojis` | GET | 获取表情包列表 |
| `/api/client/emojis` | POST | 创建表情包 |
| `/api/client/emojis/:id` | GET | 获取表情包详情 |
| `/api/client/emojis/:id` | PATCH | 更新表情包 |
| `/api/client/emojis/:id` | DELETE | 删除表情包 |

#### 表情包收藏

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/client/emoji-favorites` | GET | 获取收藏列表 |
| `/api/client/emoji-favorites` | POST | 添加收藏 |
| `/api/client/emoji-favorites/:emojiId` | DELETE | 取消收藏 |
| `/api/client/emoji-favorites/:emojiId/check` | GET | 检查收藏状态 |

#### 表情包使用日志

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/client/emoji-usage-logs` | GET | 获取使用历史 |
| `/api/client/emoji-usage-logs/popular` | GET | 获取热门表情 |
| `/api/client/emoji-usage-logs/:emojiId/stats` | GET | 获取使用统计 |

### 管理端 API (`/api/admin/*`)

面向管理员的接口，需要 JWT + RBAC 认证。

#### 认证

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/admin/auth/login` | POST | 管理员登录 |
| `/api/admin/auth/refresh` | POST | 刷新 Token |
| `/api/admin/auth/userinfo` | GET | 获取管理员信息 |
| `/api/admin/auth/permissions` | GET | 获取管理员权限 |
| `/api/admin/auth/logout` | POST | 管理员登出 |

#### 用户管理

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/admin/system/users` | GET | 获取用户列表 |
| `/api/admin/system/users` | POST | 创建用户 |
| `/api/admin/system/users/:id` | GET | 获取用户详情 |
| `/api/admin/system/users/:id` | PATCH | 更新用户 |
| `/api/admin/system/users/:id` | DELETE | 删除用户 |
| `/api/admin/system/users/:id/roles` | PUT | 分配角色 |

#### 角色管理

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/admin/system/roles` | GET | 获取角色列表 |
| `/api/admin/system/roles` | POST | 创建角色 |
| `/api/admin/system/roles/:id` | GET | 获取角色详情 |
| `/api/admin/system/roles/:id` | PATCH | 更新角色 |
| `/api/admin/system/roles/:id` | DELETE | 删除角色 |
| `/api/admin/system/roles/:id/permissions` | GET | 获取角色权限 |
| `/api/admin/system/roles/:id/permissions` | PUT | 更新角色权限 |

#### 字典管理

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/admin/system/dicts` | GET | 获取字典列表 |
| `/api/admin/system/dicts` | POST | 创建字典 |
| `/api/admin/system/dicts/:id` | GET | 获取字典详情 |
| `/api/admin/system/dicts/:id` | PATCH | 更新字典 |
| `/api/admin/system/dicts/:id` | DELETE | 删除字典 |

#### 参数管理

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/admin/system/params` | GET | 获取参数列表 |
| `/api/admin/system/params` | POST | 创建参数 |
| `/api/admin/system/params/:id` | GET | 获取参数详情 |
| `/api/admin/system/params/:id` | PATCH | 更新参数 |
| `/api/admin/system/params/:id` | DELETE | 删除参数 |

## 请求格式

### 认证头

```http
Authorization: Bearer <access_token>
```

### 分页参数

```
GET /api/resource?page=1&pageSize=20&sortBy=createdAt&order=desc
```

| 参数 | 类型 | 描述 |
|------|------|------|
| page | number | 页码（从 1 开始）|
| pageSize | number | 每页数量（默认 20，最大 100）|
| sortBy | string | 排序字段 |
| order | string | 排序方向：asc/desc |

### 筛选参数

```
GET /api/client/songs?genre=POP&language=CHINESE
```

### 标签筛选

```
GET /api/client/emojis?tags=搞笑&tags=可爱
```

使用 OR 逻辑：包含任一标签

```
GET /api/client/emojis?tagsAll=搞笑&tagsAll=动物
```

使用 AND 逻辑：同时包含所有标签

### 批量操作

```json
POST /api/client/songs/bulk
{
  "items": [
    { "title": "Song 1", "artist": "Artist 1" },
    { "title": "Song 2", "artist": "Artist 2" }
  ]
}
```

## 响应格式

### 成功响应

```json
{
  "data": {
    "id": "uuid",
    "title": "示例",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 分页响应

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

### 错误响应

```json
{
  "message": "错误信息",
  "error": {
    "name": "Error",
    "issues": [
      {
        "code": "invalid_type",
        "path": ["field"],
        "message": "字段验证失败"
      }
    ]
  }
}
```

## HTTP 状态码

| 状态码 | 描述 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

## Rate Limiting

- 默认限制: 100 请求/分钟
- 超出限制返回: `429 Too Many Requests`

响应头:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## CORS 配置

**开发环境**:
```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

**生产环境**:
根据 `app.config.ts` 中的配置设置允许的源。

## 示例

### 获取歌曲列表

```bash
curl -X GET "http://localhost:9999/api/client/songs?page=1&pageSize=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 创建歌曲

```bash
curl -X POST "http://localhost:9999/api/client/songs" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新歌",
    "artist": "歌手",
    "genre": "POP",
    "language": "CHINESE"
  }'
```

### 批量操作

```bash
curl -X POST "http://localhost:9999/api/client/songs/bulk" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"title": "Song 1", "artist": "Artist 1"},
      {"title": "Song 2", "artist": "Artist 2"}
    ]
  }'
```

## SDK 使用

### 管理面板 (TypeScript)

```typescript
import { fetchClient } from "@/api/admin";

const { data } = await fetchClient.GET("/api/admin/system/users", {
  params: {
    query: { page: 1, pageSize: 20 }
  }
});
```

### 客户端 (TypeScript)

```typescript
import { songsApi } from "@/api/songs";

const songs = await songsApi.getList({
  page: 1,
  pageSize: 20,
  genre: "POP"
});
```

### cURL

```bash
# 登录获取 Token
curl -X POST "http://localhost:9999/api/client/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "123456"}'

# 使用 Token 访问 API
curl -X GET "http://localhost:9999/api/client/songs" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 更新日志

### v1.0.0 (2024-01-01)

- 初始版本
- 实现基础 CRUD 接口
- 实现用户认证和授权
- 实现音乐管理功能
- 实现表情包管理功能

## 支持

如有问题，请参考：
- [README.md](README.md) - 项目概述
- [ARCHITECTURE.md](ARCHITECTURE.md) - 架构文档
- [DEVELOPMENT.md](DEVELOPMENT.md) - 开发指南
- 后端详细文档: [clhoria-template/CLAUDE.md](clhoria-template/CLAUDE.md)
