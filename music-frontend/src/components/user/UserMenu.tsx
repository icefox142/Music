/**
 * 用户菜单下拉组件
 * User menu dropdown component
 */

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./UserMenu.css";

interface UserMenuProps {
  avatar?: React.ReactNode;
}

export function UserMenu({ avatar }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // 延迟关闭，避免鼠标意外移出时立即关闭
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="user-menu"
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="user-menu-trigger">
        {avatar || (
          <div className="avatar-placeholder">
            {/* 圆形头像占位 */}
          </div>
        )}
        <span className="profile-text">个人空间</span>
      </div>

      {isOpen && (
        <div className="user-menu-dropdown">

          <Link to="/profile" className="menu-item">
            <span className="menu-icon">👤</span>
            <span className="menu-text">个人空间</span>
          </Link>
          <Link to="/settings" className="menu-item">
            <span className="menu-icon">⚙️</span>
            <span className="menu-text">设置</span>
          </Link>
        </div>
      )}
    </div>
  );
}
