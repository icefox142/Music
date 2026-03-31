# 音乐应用 API 文档

## 项目结构

### 前端项目

```
Music/
├── clhoria-template/      # 后端 API (Hono + Node.js + PostgreSQL)
├── refine-project/        # 管理后台 (Refine + React + shadcn/ui)
└── music-frontend/        # 音乐播放器 (Vite + React + Howler)
```

### 后端路由结构

```
clhoria-template/src/routes/
├── public/                # 公开接口（无需认证）
│   └── dicts/            # 字典查询
├── client/                # 客户端接口（JWT 认证）
│   ├── users/            # 用户管理
│   ├── emojis/           # 表情包管理
│   ├── emoji-favorites/  # 表情包收藏
│   ├── emoji-collections/# 表情包集合
│   ├── emoji-usage-logs/ # 表情包使用记录
│   └── music/            # 音乐管理
│       ├── songs/        # 歌曲 CRUD
│       ├── playlists/    # 歌单 CRUD
│       └── playlist-songs/# 歌单歌曲关联
└── admin/                 # 管理端接口（JWT + RBAC + 审计）
    ├── auth/             # 认证授权
    └── system/           # 系统管理
        ├── users/        # 用户管理
        ├── roles/        # 角色管理
        ├── dicts/        # 字典管理
        └── params/       # 参数配置
```

---

## 认证相关接口

### 1. 客户端登录

**POST** `/api/client/auth/login`

登录并获取访问令牌

**请求体**:
```json
{
  "username": "string",      // 用户名
  "password": "string",      // 密码
  "captchaToken": "string"   // Cap.js 验证码 Token（可选）
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "accessToken": "string",   // JWT 访问令牌
    "refreshToken": "string",  // 刷新令牌（httpOnly cookie）
    "user": {
      "id": "uuid",
      "username": "string",
      "nickname": "string",
      "avatar": "string",
      "email": "string"
    }
  }
}
```

### 2. 刷新令牌

**POST** `/api/client/auth/refresh`

使用 httpOnly cookie 中的刷新令牌获取新的访问令牌

**响应**:
```json
{
  "success": true,
  "data": {
    "accessToken": "string"
  }
}
```

### 3. 获取当前用户信息

**GET** `/api/client/auth/userinfo`

获取当前登录用户的详细信息

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "nickname": "string",
    "email": "string",
    "avatar": "string",
    "mobile": "string",
    "gender": "MALE | FEMALE | UNKNOWN",
    "score": 0
  }
}
```

### 4. 登出

**POST** `/api/client/auth/logout`

清除登录状态

**响应**:
```json
{
  "success": true,
  "data": { "success": true }
}
```

---

## 表情包相关接口

### 1. 表情包列表

**GET** `/api/client/emojis`

获取表情包列表，支持标签过滤

**查询参数**:
```typescript
{
  page: number,          // 页码（默认 1）
  pageSize: number,      // 每页数量（默认 20，最大 100）
  tags?: string[],       // 标签过滤（OR 逻辑）：包含任一标签
  tagsAll?: string[],    // 标签过滤（AND 逻辑）：包含所有标签
  status?: "ENABLED" | "DISABLED"
}
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tags": ["happy", "cat"],
      "url": "https://...",
      "description": "开心猫咪",
      "status": "ENABLED",
      "createdAt": "2024-01-01 00:00:00",
      "updatedAt": "2024-01-01 00:00:00"
    }
  ]
}
```

### 2. 创建表情包

**POST** `/api/client/emojis`

创建新的表情包（需要认证）

**请求体**:
```json
{
  "tags": ["happy", "cat"],
  "url": "https://example.com/emoji.png",
  "description": "开心猫咪",
  "status": "ENABLED"
}
```

### 3. 表情包收藏

**POST** `/api/client/emoji-favorites`

收藏或取消收藏表情包

**请求体**:
```json
{
  "emojiId": "uuid",
  "favorited": true  // true=收藏, false=取消收藏
}
```

### 4. 我的收藏

**GET** `/api/client/emoji-favorites`

获取当前用户收藏的表情包列表

**查询参数**:
```typescript
{
  page: number,
  pageSize: number
}
```

### 5. 记录表情包使用

**POST** `/api/client/emoji-usage-logs`

记录表情包使用情况（用于推荐）

**请求体**:
```json
{
  "emojiId": "uuid",
  "context": "chat | comment | post | message",
  "targetId": "uuid",  // 可选：使用目标ID（聊天室ID、评论ID等）
  "count": 1           // 可选：使用次数
}
```

---

## 音乐相关接口

### 1. 歌曲管理

#### 获取歌曲列表

**GET** `/api/client/songs`

获取歌曲列表，支持搜索、筛选和排序

**查询参数**:
```typescript
{
  page: number,                    // 页码（默认 1）
  pageSize: number,                // 每页数量（默认 20，最大 100）
  search?: string,                 // 搜索标题或艺术家
  genre?: "POP" | "ROCK" | "JAZZ" | ... ,  // 按流派筛选
  language?: "CHINESE" | "ENGLISH" | ..., // 按语言筛选
  status?: "ENABLED" | "DISABLED",
  sortBy?: "playCount" | "releaseDate" | "createdAt" | "title",
  order?: "asc" | "desc"           // 排序方向
}
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "歌曲标题",
      "artist": "艺术家名称",
      "coverUrl": "https://...",
      "audioUrl": "https://...",
      "duration": 180,              // 时长（秒）
      "genre": "POP",
      "language": "CHINESE",
      "releaseDate": "2024-01-01T00:00:00.000Z",
      "playCount": 1000,
      "favoriteCount": 50,
      "spotifyId": "...",
      "appleMusicId": "...",
      "youtubeId": "...",
      "status": "ENABLED"
    }
  ]
}
```

#### 创建歌曲

**POST** `/api/client/songs`

创建新的歌曲

**请求体**:
```json
{
  "title": "歌曲标题",
  "artist": "艺术家名称",
  "coverUrl": "https://...",
  "audioUrl": "https://...",
  "duration": 180,
  "genre": "POP",
  "language": "CHINESE",
  "releaseDate": "2024-01-01T00:00:00.000Z"
}
```

#### 获取歌曲详情

**GET** `/api/client/songs/:id`

获取单个歌曲详情

#### 更新歌曲

**PATCH** `/api/client/songs/:id`

更新歌曲信息（部分更新）

#### 删除歌曲

**DELETE** `/api/client/songs/:id`

删除指定歌曲

---

### 2. 歌单管理

#### 获取歌单列表

**GET** `/api/client/playlists`

获取歌单列表

**查询参数**:
```typescript
{
  page: number,
  pageSize: number,
  userId?: "uuid",              // 按用户筛选
  isPublic?: boolean,           // 按公开状态筛选
  status?: "ENABLED" | "DISABLED",
  sortBy?: "playCount" | "createdAt" | "songCount" | "sortOrder",
  order?: "asc" | "desc"
}
```

#### 获取我的歌单

**GET** `/api/client/playlists/mine`

获取当前登录用户创建的所有歌单

#### 获取公开歌单

**GET** `/api/client/playlists/public`

获取所有公开的歌单列表

#### 创建歌单

**POST** `/api/client/playlists`

创建新的歌单

**请求体**:
```json
{
  "name": "我的歌单",
  "description": "喜欢的歌曲",
  "coverUrl": "https://...",
  "isPublic": false,
  "sortOrder": 0
}
```

#### 获取歌单详情

**GET** `/api/client/playlists/:id`

获取单个歌单详情

#### 更新歌单

**PATCH** `/api/client/playlists/:id`

更新歌单信息（只能更新自己创建的歌单）

#### 删除歌单

**DELETE** `/api/client/playlists/:id`

删除指定歌单（只能删除自己创建的歌单）

---

### 3. 歌单歌曲关联管理

#### 获取歌单中的歌曲

**GET** `/api/client/playlists/:id/songs`

获取指定歌单中的所有歌曲（包含歌曲详情）

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "playlistId": "uuid",
      "songId": "uuid",
      "position": 0,
      "addedAt": "2024-01-01T00:00:00.000Z",
      "song": {
        "id": "uuid",
        "title": "歌曲标题",
        "artist": "艺术家",
        "coverUrl": "https://...",
        "audioUrl": "https://...",
        "duration": 180,
        "genre": "POP",
        "language": "CHINESE"
      }
    }
  ]
}
```

#### 添加歌曲到歌单

**POST** `/api/client/playlists/:id/songs`

向指定歌单添加一首歌曲

**请求体**:
```json
{
  "songId": "uuid",
  "position": 0  // 可选，默认追加到末尾
}
```

#### 批量添加歌曲

**POST** `/api/client/playlists/:id/songs/batch`

批量添加多首歌曲到歌单

**请求体**:
```json
{
  "songIds": ["uuid1", "uuid2", "uuid3"]
}
```

#### 移除歌曲

**DELETE** `/api/client/playlists/:id/songs/:songId`

从歌单移除指定歌曲

#### 批量移除歌曲

**DELETE** `/api/client/playlists/:id/songs/batch`

批量从歌单移除多首歌曲

**请求体**:
```json
{
  "songIds": ["uuid1", "uuid2", "uuid3"]
}
```

#### 更新歌曲位置

**PUT** `/api/client/playlists/:id/songs/:songId`

更新歌曲在歌单中的位置

**请求体**:
```json
{
  "position": 5
}
```

#### 批量更新位置

**PUT** `/api/client/playlists/:id/songs/batch`

批量更新多首歌曲的位置

**请求体**:
```json
{
  "updates": [
    { "songId": "uuid1", "position": 0 },
    { "songId": "uuid2", "position": 1 },
    { "songId": "uuid3", "position": 2 }
  ]
}
```

---

## 枚举类型

### 音乐流派 (MusicGenre)

```typescript
POP, ROCK, HIP_HOP, RNB, JAZZ, CLASSICAL,
ELECTRONIC, COUNTRY, REGGAE, BLUES, METAL,
FOLK, LATIN, ASIAN_POP, OTHER
```

### 音乐语言 (MusicLanguage)

```typescript
CHINESE, ENGLISH, JAPANESE, KOREAN, FRENCH,
SPANISH, GERMAN, ITALIAN, PORTUGUESE, RUSSIAN,
INSTRUMENTAL, OTHER
```

---

## 认证说明

### JWT Token

所有 `/api/client/*` 接口都需要 JWT 认证。

**请求头**:
```
Authorization: Bearer <accessToken>
```

### Token 刷新

- 访问令牌过期时，前端应自动调用 `/api/client/auth/refresh`
- 刷新令牌存储在 httpOnly cookie 中，由后端自动管理

### 权限控制

- 歌单操作只能管理自己创建的歌单
- 更新和删除操作会验证所有权

---

## 错误响应

所有接口在失败时返回统一格式：

```json
{
  "success": false,
  "error": "错误信息"
}
```

常见 HTTP 状态码：
- `200` - 成功
- `201` - 创建成功
- `400` - 参数错误
- `401` - 未认证
- `403` - 无权限
- `404` - 资源不存在
- `409` - 资源冲突（如歌曲已存在）
- `422` - 参数验证失败
- `500` - 服务器错误

---

## 分页响应

列表接口支持分页，返回 `x-total-count` 响应头：

```
x-total-count: 100
```

前端可据此计算总页数。
