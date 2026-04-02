# 贡献指南

感谢你对 Music Player 项目的关注！我们欢迎各种形式的贡献。

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [问题反馈](#问题反馈)
- [功能建议](#功能建议)

## 行为准则

### 我们的承诺

为了营造开放和友好的环境，我们承诺让每个人都能参与项目，不受歧视。

### 我们的标准

积极行为包括：
- ✅ 使用友好和包容的语言
- ✅ 尊重不同的观点和经验
- ✅ 优雅地接受建设性批评
- ✅ 关注对社区最有利的事情
- ✅ 对其他社区成员表示同理心

不可接受的行为包括：
- ❌ 使用性化的语言或图像
- ❌ 恶意攻击或侮辱性评论
- ❌ 骚扰或未经许可发布私人信息
- ❌ 其他不专业或不适当的行为

## 如何贡献

### 报告问题

如果你发现了 bug 或有功能建议：

1. 检查 [Issues](../../issues) 是否已存在类似问题
2. 如果没有，创建新 Issue，使用合适的模板
3. 提供详细的信息：

**Bug 报告应包含**:
- 清晰的标题
- 复现步骤
- 预期行为
- 实际行为
- 环境信息（OS、浏览器、Node 版本等）
- 相关日志或截图

**功能建议应包含**:
- 功能描述
- 使用场景
- 可能的实现方案
- 示例或参考

### 提交代码

#### 1. Fork 项目

```bash
# Fork 并克隆你的 fork
git clone https://github.com/your-username/Music.git
cd Music
```

#### 2. 创建分支

```bash
# 根据你要修改的模块创建分支
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

**分支命名规范**:
- `feature/功能名称` - 新功能
- `fix/问题描述` - Bug 修复
- `refactor/模块名` - 重构
- `docs/文档名` - 文档更新
- `style/样式调整` - 代码格式调整
- `test/测试相关` - 测试相关
- `chore/杂项` - 构建配置等

#### 3. 安装依赖

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

#### 4. 进行开发

- 遵循[代码规范](#代码规范)
- 编写测试
- 更新文档
- 确保所有测试通过

```bash
# 后端测试
cd clhoria-template
pnpm typecheck
pnpm lint:fix
pnpm test

# 前端检查
cd refine-project  # 或 music-frontend
pnpm lint
```

#### 5. 提交代码

遵循[提交规范](#提交规范)编写清晰的提交信息：

```bash
git add .
git commit -m "feat: 添加歌曲收藏功能"
```

#### 6. 推送到你的 Fork

```bash
git push origin feature/your-feature-name
```

#### 7. 创建 Pull Request

1. 访问原仓库的 Pull Requests 页面
2. 点击 "New Pull Request"
3. 选择你的分支
4. 填写 PR 模板
5. 等待 Code Review

**PR 标题格式**:
```
<type>: <subject>

例如:
feat: 添加歌曲推荐功能
fix: 修复播放器状态不同步问题
docs: 更新 API 文档
```

**PR 描述应包含**:
- 变更说明
- 相关 Issue 链接
- 测试情况
- 截图或演示（如适用）

## 开发流程

### 小型改动

对于简单的 bug 修复或文档更新：

1. 直接创建分支并修改
2. 运行相关测试
3. 提交 PR
4. 等待 Review

### 大型功能

对于复杂的新功能或重构：

1. **先创建 Issue** 讨论设计方案
2. 等待维护者确认方案
3. 创建分支进行开发
4. 提交 WIP (Work In Progress) PR
5. 持续更新并标记为 WIP
6. 完成后移除 WIP 标记请求 Review

### 开发环境

确保你的开发环境配置正确：

- Node.js 25+
- PostgreSQL 18+
- Redis 7+
- pnpm 9+

### 代码审查

所有 PR 都需要通过代码审查：

- 至少一位维护者批准
- 所有 CI 检查通过
- 没有未解决的讨论
- 符合代码规范

审查标准：
- 代码质量和可读性
- 测试覆盖度
- 文档完整性
- 性能影响
- 安全性

## 代码规范

### 通用规范

#### 命名规范

```typescript
// 文件名
components/SongCard.tsx          // 组件: PascalCase
hooks/useSongs.ts               // Hook: camelCase
utils/formatDate.ts             // 工具: camelCase
types/SongTypes.ts              // 类型: PascalCase

// 变量名
const userName = "user";        // camelCase
const MAX_COUNT = 100;          // UPPER_SNAKE_CASE
const API_URL = "...";          // UPPER_SNAKE_CASE

// 常量
enum Status {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
}

// 类和接口
class UserService { }           // PascalCase
interface User { }              // PascalCase
type UserDict = Record<string, User>;  // PascalCase

// 函数
function getUserById() { }       // camelCase
const fetchData = async () => { };  // camelCase
```

#### 注释规范

```typescript
/**
 * 获取歌曲列表
 * @param params - 查询参数
 * @returns 歌曲分页数据
 */
export async function getSongs(
  params: SongQueryParams
): Promise<PaginatedResponse<Song>> {
  // 实现
}
```

### 后端规范

#### 目录结构

```
src/routes/{tier}/{feature}/
├── {feature}.routes.ts      # 路由定义
├── {feature}.handlers.ts    # 业务逻辑
├── {feature}.schema.ts      # 验证 Schema
├── {feature}.types.ts       # 类型定义
├── {feature}.helpers.ts     # 辅助函数（可选）
└── __tests__/
    └── {feature}.test.ts    # 测试文件
```

#### 响应格式

```typescript
// 成功
return c.json(Resp.ok(data), HttpStatusCodes.OK);

// 失败
return c.json(Resp.fail("错误信息"), HttpStatusCodes.BAD_REQUEST);
```

#### 日志记录

```typescript
// 系统日志
logger.info({ userId }, "[Module]: message");

// 操作日志
operationLogger.info({ userId, resourceId }, "[CRUD]: action");

// 登录日志
loginLogger.info({ userId, ip }, "[LOGIN]: login success");
```

### 前端规范

#### 组件结构

```typescript
// 1. 导入
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. 类型定义
interface Props {
  title: string;
}

// 3. 组件定义
export function MyComponent({ title }: Props) {
  // Hooks
  const [state, setState] = useState();
  
  // 事件处理
  const handleClick = () => { };
  
  // 渲染
  return <div>{title}</div>;
}
```

#### Hooks 使用

```typescript
// 自定义 Hook
export function useSongs(params?: QueryParams) {
  const [data, setData] = useState();
  
  useEffect(() => {
    fetchSongs().then(setData);
  }, [params]);
  
  return { data, isLoading, error };
}

// 使用 Hook
function SongList() {
  const { data, isLoading } = useSongs();
  // ...
}
```

#### 样式组织

```css
/* 组件样式 */
.component {
  /* 布局 */
  display: flex;
  
  /* 盒模型 */
  padding: 16px;
  
  /* 排版 */
  font-size: 14px;
  
  /* 视觉 */
  color: #333;
  
  /* 动画 */
  transition: all 0.2s;
}
```

## 提交规范

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构（既不是新功能也不是修复）
- `perf`: 性能优化
- `test`: 添加测试
- `chore`: 构建配置等辅助工具
- `revert`: 回滚之前的提交

### Scope 范围

- `backend`: 后端
- `admin-panel`: 管理面板
- `client`: 客户端
- `docs`: 文档
- `database`: 数据库

### 示例

```bash
# 新功能
feat(backend): 添加歌曲推荐功能

# Bug 修复
fix(client): 修复播放器状态不同步问题

# 文档
docs(readme): 更新安装说明

# 重构
refactor(backend): 优化用户查询性能

# 测试
test(backend): 添加用户管理单元测试
```

### 详细提交（可选）

```bash
feat(backend): 添加歌曲批量导入功能

- 支持从 CSV 导入歌曲列表
- 添加数据验证和错误处理
- 实现进度反馈机制

Closes #123
```

## 问题反馈

### Bug 报告模板

```markdown
**问题描述**
简要描述遇到的问题

**复现步骤**
1. 访问 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

**预期行为**
应该发生什么

**实际行为**
实际发生了什么

**环境信息**
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Node Version: [e.g. 25.0.0]
- Project Version: [e.g. 0.1.0]

**截图**
如果适用，添加截图

**额外信息**
其他相关信息
```

### 功能建议模板

```markdown
**功能描述**
简洁清晰的功能描述

**问题背景**
这个功能解决什么问题

**建议方案**
如何实现这个功能

**替代方案**
其他可能的实现方式

**优先级**
- [ ] 高优先级
- [ ] 中优先级
- [ ] 低优先级

**额外信息**
其他相关信息或示例
```

## 功能建议

### 建议之前

1. 检查是否已有类似建议
2. 思考这个功能的必要性
3. 考虑实现成本和维护成本
4. 提供清晰的使用场景

### 好的建议包含

- 清晰的问题描述
- 具体的使用场景
- 可能的实现方案
- 参考或示例

## 开发资源

### 文档

- [README.md](README.md) - 项目概述
- [ARCHITECTURE.md](ARCHITECTURE.md) - 架构文档
- [DEVELOPMENT.md](DEVELOPMENT.md) - 开发指南
- [API.md](API.md) - API 文档

### 工具

- **后端**: VSCode CRUD Snippets
- **前端**: React DevTools, Redux DevTools
- **数据库**: Drizzle Studio
- **测试**: Vitest, Testing Library

### 学习资源

- [Hono 文档](https://hono.dev/)
- [React 文档](https://react.dev/)
- [Refine 文档](https://refine.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)

## 获取帮助

如果你需要帮助：

1. 查看[文档](#文档)
2. 搜索[Issues](../../issues)
3. 在 Issue 中提问（使用 `question` 标签）
4. 加入社区讨论

## 许可证

通过贡献代码，你同意你的贡献将使用 [MIT License](LICENSE) 进行许可。

## 致谢

感谢所有贡献者！

---

**再次感谢你的贡献！** 🎉
