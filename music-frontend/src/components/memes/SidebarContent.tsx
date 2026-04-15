/**
 * 表情包侧边栏内容组件
 * Memes Sidebar Content Component
 */

import { useEmojiTags } from "@/hooks/useEmojis";
import "./SidebarContent.css";

interface SidebarContentProps {
  onTagSelect?: (tag: string) => void;
  selectedTags?: string[];
}

export function SidebarContent({ onTagSelect, selectedTags = [] }: SidebarContentProps) {
  const { tags } = useEmojiTags();

  return (
    <>
      <div className="sidebar-section">
        <h3>标签筛选</h3>
        <div className="placeholder-list">
          {tags.map((tag) => (
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
