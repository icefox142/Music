# 🎵 API 测试指南 - JWT Token 使用说明

## 📋 快速开始

### 方式一：使用已生成的测试 Token

**测试用户 Token** (7天有效期):
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMTIzNDU2Ny0wMTIzLTAxMjMtMDEyMy0wMTIzNDU2Nzg5YWIiLCJpYXQiOjE3NzQ5NTIyNDksImV4cCI6MTc3NTU1NzA0OSwidHlwZSI6ImFjY2VzcyJ9.hAh9NW836ig5GLmSx_XCVt4OC_skNRodlqRbDnrkNhc
```

**测试用户ID**: `01234567-0123-0123-0123-0123456789ab`

---

## 🔧 在 API 文档中使用 Token

### Step 1: 访问 API 文档
在浏览器中打开: **http://localhost:9999/api/doc**

### Step 2: 点击授权按钮
点击页面右上角的 **"Authorize"** 或 **"授权"** 🔒 按钮

### Step 3: 输入 Token
在弹出的对话框中，粘贴以下内容（**包含** `Bearer ` 前缀）:

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMTIzNDU2Ny0wMTIzLTAxMjMtMDEyMy0wMTIzNDU2Nzg5YWIiLCJpYXQiOjE3NzQ5NTIyNDksImV4cCI6MTc3NTU1NzA0OSwidHlwZSI6ImFjY2VzcyJ9.hAh9NW836ig5GLmSx_XCVt4OC_skNRodlqRbDnrkNhc
```

### Step 4: 确认授权
点击 **"Authorize"** 按钮，然后关闭对话框

### Step 5: 测试 API
现在你可以测试所有需要认证的接口了！点击任意 **"Try it out"** 按钮，然后点击 **"Execute"**

---

## 💡 使用 Postman 或其他工具

如果使用 Postman、Insomnia 或 curl：

**请求头设置**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMTIzNDU2Ny0wMTIzLTAxMjMtMDEyMy0wMTIzNDU2Nzg5YWIiLCJpYXQiOjE3NzQ5NTIyNDksImV4cCI6MTc3NTU1NzA0OSwidHlwZSI6ImFjY2VzcyJ9.hAh9NW836ig5GLmSx_XCVt4OC_skNRodlqRbDnrkNhc
```

---

## 📝 注意事项

1. **Token 有效期**: 此 Token 有效期 7 天，过期后需要重新生成
2. **测试用户**: 使用的是预设的测试用户 ID，实际使用时需要通过登录接口获取真实 Token
3. **请求头**: Token 必须放在 `Authorization` 请求头中，格式为 `Bearer <token>`
4. **安全**: 此 Token 仅用于测试环境，请勿在生产环境使用

---

## 🔄 重新生成 Token

如果需要重新生成 Token，运行:
```bash
cd d:/Music/clhoria-template
node generate-test-token.js
```

---

## 📚 可测试的 API 端点

### 歌曲管理
- `GET /api/client/songs` - 获取歌曲列表
- `POST /api/client/songs` - 创建歌曲
- `GET /api/client/songs/:id` - 获取歌曲详情
- `PATCH /api/client/songs/:id` - 更新歌曲
- `DELETE /api/client/songs/:id` - 删除歌曲

### 歌单管理
- `GET /api/client/playlists` - 获取歌单列表
- `GET /api/client/playlists/mine` - 获取我的歌单
- `GET /api/client/playlists/public` - 获取公开歌单
- `POST /api/client/playlists` - 创建歌单

### 歌单歌曲管理
- `GET /api/client/playlists/:id/songs` - 获取歌单中的歌曲
- `POST /api/client/playlists/:id/songs` - 添加歌曲到歌单

---

## 🎉 开始测试

现在你可以：
1. ✅ 访问 http://localhost:9999/api/doc
2. ✅ 使用上面的 Token 授权
3. ✅ 测试所有音乐相关 API

享受开发！ 🚀
