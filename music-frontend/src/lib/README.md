# Mock API 使用指南

本目录包含 Mock API 实现，可以在不依赖后端的情况下进行前端开发。

## 文件说明

- `mockData.ts` - Mock 数据定义（表情包、集合、收藏等）
- `mockApiClient.ts` - Mock API 客户端，模拟真实的 API 调用
- `axios.ts` - 真实的 Axios API 客户端

## 使用方式

### 方式一：直接使用 Mock API（推荐用于快速原型）

```typescript
// 在组件或 Hook 中直接使用 Mock API
import { mockApiClient } from "@/lib/mockApiClient";

// 获取表情列表
const { data } = await mockApiClient.emojis.getList({
  tags: ["可爱", "猫咪"],
  page: 1,
  pageSize: 20,
});

// 添加收藏
await mockApiClient.favorites.add("emoji-id");

// 获取集合
const collections = await mockApiClient.collections.getList({
  isFeatured: true,
});
```

### 方式二：创建条件导入（推荐用于实际开发）

在 `src/api/` 目录下创建新的 API 文件，通过环境变量切换：

```typescript
// src/api/emojis-mock.ts
import { mockApiClient } from "@/lib/mockApiClient";

export const emojisApi = {
  getList: (params) => mockApiClient.emojis.getList(params),
  getById: (id) => mockApiClient.emojis.getById(id),
  // ... 其他方法
};
```

然后在组件中选择性导入：

```typescript
// 使用 Mock API
import { emojisApi } from "@/api/emojis-mock";

// 或使用真实 API
import { emojisApi } from "@/api/emojis";
```

### 方式三：环境变量控制（推荐用于团队协作）

1. 在 `.env` 文件中添加：

```bash
# 使用 Mock API（true/false）
VITE_USE_MOCK_API=true
```

2. 创建 API 适配器：

```typescript
// src/lib/apiAdapter.ts
import { mockApiClient } from "./mockApiClient";
import * as realApis from "@/api/emojis";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";

export const emojisApi = USE_MOCK
  ? mockApiClient.emojis
  : realApis.emojisApi;
```

3. 在组件中统一使用适配器：

```typescript
import { emojisApi } from "@/lib/apiAdapter";

// 代码不变，自动切换 Mock/真实 API
const data = await emojisApi.getList({ page: 1 });
```

## Mock API 功能

### 表情包 API

```typescript
// 获取列表（支持筛选、排序、分页)
mockApiClient.emojis.getList({
  tags: ["可爱"],           // OR 关系
  tagsAll: ["猫咪", "开心"], // AND 关系
  category: "动物",
  sortBy: "createdAt",
  order: "desc",
  page: 1,
  pageSize: 20,
});

// 获取详情
mockApiClient.emojis.getById("emoji-id");

// 创建（仅前端，不会真的保存）
mockApiClient.emojis.create({
  name: "新表情",
  tags: ["标签"],
});

// 更新
mockApiClient.emojis.update("emoji-id", { name: "新名称" });

// 删除
mockApiClient.emojis.delete("emoji-id");
```

### 表情集合 API

```typescript
// 获取集合列表
mockApiClient.collections.getList({
  isFeatured: true,
  sortBy: "downloadCount",
  order: "desc",
});

// 获取详情
mockApiClient.collections.getById("collection-id");

// 增加下载计数
mockApiClient.collections.incrementDownload("collection-id");
```

### 收藏 API

```typescript
// 获取收藏列表
mockApiClient.favorites.getList({ page: 1 });

// 添加收藏
mockApiClient.favorites.add("emoji-id");

// 取消收藏
mockApiClient.favorites.remove("emoji-id");

// 检查收藏状态
const { data } = await mockApiClient.favorites.check("emoji-id");
console.log(data.isFavorited); // true/false
```

### 辅助方法

```typescript
// 获取所有标签
const tags = mockApiClient.getTags();
// ["可爱", "猫咪", "开心", "搞笑", ...]

// 获取所有分类
const categories = mockApiClient.getCategories();
// ["动物", "手势", "节日", "情感"]
```

## 在 React Query 中使用

```typescript
import { useQuery } from "@tanstack/react-query";
import { mockApiClient } from "@/lib/mockApiClient";

function useEmojis(params?: EmojiQueryParams) {
  return useQuery({
    queryKey: ["emojis", params],
    queryFn: () => mockApiClient.emojis.getList(params || {}),
  });
}

// 在组件中使用
function MyComponent() {
  const { data, isLoading } = useEmojis({
    tags: ["可爱"],
    page: 1,
  });

  if (isLoading) return <div>加载中...</div>;
  return <div>{/* 渲染表情列表 */}</div>;
}
```

## Mock 数据

默认包含：
- 12 个表情包（覆盖动物、手势、节日、情感等分类）
- 4 个表情集合（萌宠系列、情感表达等）
- 2 个收藏记录
- 28 个标签
- 4 个分类

图片使用 `picsum.photos` 随机图片服务。

## 注意事项

1. **数据持久化**：Mock 数据仅在内存中，刷新页面后会重置
2. **网络延迟**：默认模拟 300ms 网络延迟，可在 `delay()` 函数中调整
3. **类型安全**：Mock API 与真实 API 共享类型定义，保证类型一致性
4. **切换时机**：建议在开发早期使用 Mock，后端就绪后切换到真实 API

## 调试

可以导出 mock 数据用于调试：

```typescript
import { mockDataExports } from "@/lib/mockApiClient";

console.log("所有表情包:", mockDataExports.emojis);
console.log("所有标签:", mockDataExports.tags);
```
