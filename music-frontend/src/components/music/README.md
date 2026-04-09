# Music 组件使用指南

本文档介绍 Music 页面相关的组件。

## 组件列表

### 1. SongList - 歌曲列表组件

**职责**：
- 获取和显示歌曲列表
- 处理加载、错误、空状态
- 响应歌曲选择事件

**使用方式**：
```tsx
import { SongList } from "@/components/music";

function MyPage() {
  const [selectedSong, setSelectedSong] = useState(null);

  return (
    <SongList
      onSongSelect={setSelectedSong}
      selectedSongId={selectedSong?.id}
    />
  );
}
```

**Props**：
```tsx
interface SongListProps {
  onSongSelect?: (song: Song) => void;  // 歌曲选择回调
  selectedSongId?: string;                // 当前选中的歌曲 ID
}
```

### 2. LyricsPanel - 歌词面板组件

**职责**：
- 显示歌词和控制
- 集成 Lyrics 和 VolumeControl 组件
- 提供默认示例歌词

**使用方式**：
```tsx
import { LyricsPanel } from "@/components/music";

function MyPage() {
  return <LyricsPanel />;
}
```

### 3. Music - 页面组件

**职责**：
- 页面布局和样式
- 管理页面级状态（当前选中的歌曲）
- 组合子组件

**特点**：
- ✅ 纯展示组件，无业务逻辑
- ✅ 响应式布局
- ✅ 清晰的组件层次

## 架构设计

```
Music (页面)
├── 布局和样式管理
├── 页面级状态（selectedSong）
└── 子组件组合
    ├── SongList (逻辑组件)
    │   ├── 数据获取 (useSongsMock)
    │   ├── 加载状态处理
    │   └── 歌曲列表渲染
    └── LyricsPanel (逻辑组件)
        ├── 歌词显示
        └── 音量控制
```

## 数据流

```
Music.tsx (页面)
  ↓ 管理 selectedSong 状态
  ↓ 传递 props
  ↓
SongList.tsx (组件)
  ↓ 使用 useSongsMock hook
  ↓ 获取歌曲数据
  ↓
渲染歌曲列表
```

## 样式定制

所有组件都支持通过 CSS 类名定制样式：

```css
/* 全局样式 */
.music-page { }
.music-header { }
.song-list-section { }
.lyrics-section { }

/* 组件样式 */
.song-list { }
.song-item { }
.lyrics-panel { }
```

## 扩展指南

### 添加新功能到 SongList

```tsx
// 1. 在 SongList.tsx 中添加新功能
export function SongList({ onSongSelect, selectedSongId }: SongListProps) {
  // 添加搜索功能
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSongs = songs.filter(song =>
    song.title.includes(searchQuery)
  );

  // 渲染搜索框和列表
  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="搜索歌曲..."
      />
      {/* 歌曲列表 */}
    </div>
  );
}
```

### 替换数据源

```tsx
// 替换 Mock 数据为真实 API
import { useSongs } from "@/hooks/useSongs"; // 真实 API hook

export function SongList({ onSongSelect, selectedSongId }: SongListProps) {
  const { data: songs, isLoading } = useSongs({ page: 1, pageSize: 50 });
  // 其余代码保持不变
}
```

## 最佳实践

1. **组件职责单一**：每个组件只负责一个功能域
2. **逻辑下移**：业务逻辑放在组件中，页面只负责布局
3. **状态提升**：共享状态放在父组件（页面）
4. **Props 接口清晰**：明确输入输出
5. **样式隔离**：每个组件有独立的 CSS 文件

## 迁移指南

### 从旧版本迁移

**之前**（逻辑在页面中）：
```tsx
// Music.tsx
export function Music() {
  const { data: songs, isLoading } = useSongsMock();
  // 大量的逻辑代码...

  return (
    <div>
      {songs.map(song => <div>...</div>)}
    </div>
  );
}
```

**现在**（逻辑在组件中）：
```tsx
// Music.tsx (页面)
export function Music() {
  return <SongList />;  // 简洁！
}

// SongList.tsx (组件)
export function SongList() {
  const { data: songs, isLoading } = useSongsMock();
  // 逻辑在这里...
}
```

## 相关文件

- [SongList.tsx](./SongList.tsx) - 歌曲列表组件
- [SongList.css](./SongList.css) - 歌曲列表样式
- [LyricsPanel.tsx](./LyricsPanel.tsx) - 歌词面板组件
- [LyricsPanel.css](./LyricsPanel.css) - 歌词面板样式
- [Music.css](../../pages/Music.css) - 页面样式
