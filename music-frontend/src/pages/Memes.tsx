/**
 * 表情包页面
 * Memes page
 */

import { useState } from "react";
import { SidebarToggle } from "@/components/memes/SidebarToggle";
import { SidebarContent } from "@/components/memes/SidebarContent";
import { EmojiGrid } from "@/components/memes/EmojiGrid";
import "./Memes.css";

export function Memes() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="memes-page">
      <div className="memes-content">
        {/* 悬浮球 + 侧边栏组件 */}
        <SidebarToggle>
          <SidebarContent onTagSelect={handleTagToggle} selectedTags={selectedTags} />
        </SidebarToggle>

        {/* 主内容区 */}
        <div className="memes-main">
          <div className="memes-header">
            
            {selectedTags.length > 0 && (
              <div className="selected-tags">
                {selectedTags.map((tag) => (
                  <span key={tag} className="selected-tag" onClick={() => handleTagToggle(tag)}>
                    {tag} ×
                  </span>
                ))}
              </div>
            )}
          </div>

          <EmojiGrid
            tags={selectedTags.length ? selectedTags : undefined}
            page={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
