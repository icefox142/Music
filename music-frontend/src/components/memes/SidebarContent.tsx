/**
 * 表情包侧边栏内容组件
 * Memes Sidebar Content Component
 */

import "./SidebarContent.css";

interface SidebarContentProps {
  onTagSelect?: (tag: string) => void;
  selectedTags?: string[];
}

const AVAILABLE_TAGS = ["热门", "搞笑", "可爱", "表情", "动物"];

export function SidebarContent({ onTagSelect, selectedTags = [] }: SidebarContentProps) {
  return (
    <>
      <div className="sidebar-section">
        <h3>标签筛选</h3>
        <div className="placeholder-list">
          {AVAILABLE_TAGS.map((tag) => (
            <div
              key={tag}
              className={`placeholder-item ${selectedTags.includes(tag) ? "active" : ""}`}
              onClick={() => onTagSelect?.(tag)}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
