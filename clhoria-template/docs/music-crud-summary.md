# 音乐 CRUD API 创建完成

## 已创建的模块

### 1. Songs（歌曲管理）
**路径**: `/api/client/songs`

**功能**:
- `GET /songs` - 歌曲列表（支持搜索、筛选、排序）
  - 搜索: title, artist
  - 筛选: genre, language, status
  - 排序: playCount, releaseDate, createdAt, title
- `POST /songs` - 创建歌曲
- `GET /songs/:id` - 获取歌曲详情
- `PATCH /songs/:id` - 更新歌曲
- `DELETE /songs/:id` - 删除歌曲

### 2. Playlists（用户歌单管理）
**路径**: `/api/client/playlists`

**功能**:
- `GET /playlists` - 歌单列表（支持筛选用户、公开状态）
- `GET /playlists/mine` - 获取我的歌单
- `GET /playlists/public` - 获取公开歌单
- `POST /playlists` - 创建歌单
- `GET /playlists/:id` - 获取歌单详情
- `PATCH /playlists/:id` - 更新歌单（只能更新自己的）
- `DELETE /playlists/:id` - 删除歌单（只能删除自己的）

### 3. Playlist Songs（歌单歌曲关联管理）
**路径**: `/api/client/playlists/:id/songs`

**功能**:
- `GET /playlists/:id/songs` - 获取歌单中的歌曲列表（包含歌曲详情）
- `POST /playlists/:id/songs` - 添加歌曲到歌单
- `POST /playlists/:id/songs/batch` - 批量添加歌曲
- `DELETE /playlists/:id/songs/:songId` - 从歌单移除歌曲
- `DELETE /playlists/:id/songs/batch` - 批量移除歌曲
- `PUT /playlists/:id/songs/:songId` - 更新歌曲位置
- `PUT /playlists/:id/songs/batch` - 批量更新歌曲位置

## 文件结构

```
src/routes/client/music/
├── index.ts                          # 模块统一导出
├── songs/
│   ├── songs.schema.ts              # Zod 验证 schema
│   ├── songs.types.ts               # TypeScript 类型定义
│   ├── songs.routes.ts              # OpenAPI 路由定义
│   ├── songs.handlers.ts            # 请求处理器
│   ├── songs.index.ts               # 路由模块导出
│   └── __tests__/
│       └── songs.test.ts            # 单元测试
├── playlists/
│   ├── playlists.schema.ts
│   ├── playlists.types.ts
│   ├── playlists.routes.ts
│   ├── playlists.handlers.ts
│   └── playlists.index.ts
└── playlist-songs/
    ├── playlist-songs.schema.ts
    ├── playlist-songs.types.ts
    ├── playlist-songs.routes.ts
    ├── playlist-songs.handlers.ts
    └── playlist-songs.index.ts
```

## 特性

### 认证与授权
- 所有接口需要 JWT 认证（`/api/client/*` 层级）
- Playlist 操作有所有权验证（只能操作自己创建的歌单）

### 数据验证
- 使用 Zod schema 进行请求参数验证
- 中文错误消息

### 日志记录
- 使用 `logger` 记录操作日志
- 格式: `logger.info({ id, title }, "[模块名]: 操作描述")`

### 响应格式
- 成功: `c.json(Resp.ok(data), HttpStatusCodes.OK)`
- 失败: `c.json(Resp.fail("错误信息"), HttpStatusCodes.BAD_REQUEST)`

## 数据库表

已创建的表（详见数据库 schema）:
- `client_songs` - 歌曲表
- `client_playlists` - 用户歌单表
- `client_playlist_songs` - 歌单歌曲关联表

## 测试

运行测试:
```bash
cd clhoria-template
pnpm test -- songs.test.ts
```

## API 文档

开发服务器启动后，访问 OpenAPI 文档:
- Swagger UI: `http://localhost:9999/api/client/doc`
- Scalar UI: `http://localhost:9999/api/doc`

## 枚举类型

新增的音乐相关枚举:
- `MusicGenre`: POP, ROCK, HIP_HOP, RNB, JAZZ, CLASSICAL, ELECTRONIC, COUNTRY, REGGAE, BLUES, METAL, FOLK, LATIN, ASIAN_POP, OTHER
- `MusicLanguage`: CHINESE, ENGLISH, JAPANESE, KOREAN, FRENCH, SPANISH, GERMAN, ITALIAN, PORTUGUESE, RUSSIAN, INSTRUMENTAL, OTHER
