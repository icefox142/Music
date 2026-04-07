/**
 * 表情包网格展示组件
 */

import { useEmojis } from "@/hooks/useEmojisMock";
import type { Emoji } from "@/api/emojis";
import "./EmojiGrid.css";

interface EmojiGridProps {
  tags?: string[];
  category?: string;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export function EmojiGrid({
  tags,
  category,
  page = 1,
  pageSize = 20,
  onPageChange
}: EmojiGridProps) {
  const { data, isLoading, error } = useEmojis({
    page,
    pageSize,
    tags: tags?.length ? tags : undefined,
    category,
  });

  if (isLoading) {
    return <div className="emoji-grid-loading">加载中...</div>;
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : "加载失败";
    return <div className="emoji-grid-error">{errorMessage}</div>;
  }

  const emojis = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  // 空状态
  if (emojis.length === 0) {
    return (
      <div className="emoji-grid-empty">
        <p>暂无表情包</p>
        {tags && tags.length > 0 && (
          <button
            className="clear-filters-button"
            onClick={() => onPageChange?.(1)}
          >
            清除筛选
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="emoji-grid-container">
      <div className="emoji-grid">
        {emojis.map((emoji: Emoji) => (
          <EmojiCard key={emoji.id} emoji={emoji} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="emoji-pagination">
          <button
            onClick={() => onPageChange?.(page - 1)}
            disabled={page === 1}
            className="pagination-button"
          >
            上一页
          </button>
          <span className="pagination-info">
            第 {page} / {totalPages} 页
          </span>
          <button
            onClick={() => onPageChange?.(page + 1)}
            disabled={page === totalPages}
            className="pagination-button"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}

interface EmojiCardProps {
  emoji: Emoji;
}

function EmojiCard({ emoji }: EmojiCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/placeholder-image.png";
  };

  return (
    <div className="emoji-card">
      <div className="emoji-card-image">
        <img
          src={emoji.imageUrl}
          alt={emoji.name}
          loading="lazy"
          onError={handleImageError}
        />
      </div>
      <div className="emoji-card-info">
        <h3 className="emoji-card-name" title={emoji.name}>
          {emoji.name}
        </h3>
        {emoji.description && (
          <p className="emoji-card-description" title={emoji.description}>
            {emoji.description}
          </p>
        )}
        {emoji.tags && emoji.tags.length > 0 && (
          <div className="emoji-card-tags">
            {emoji.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="emoji-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
