import { useState, useRef, useEffect } from "react";
import "./SidebarToggle.css";

interface SidebarToggleProps {
  children?: React.ReactNode;
  title?: string;
}

export function SidebarToggle({
  children,
  title = "标签筛选",
}: SidebarToggleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 10, y: 100 });
  const dragStartPosition = useRef({ x: 0, y: 0 });
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const mouseDownPosition = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    mouseDownPosition.current = {
      x: e.clientX,
      y: e.clientY,
    };

    setIsDragging(true);

    const rect = toggleButtonRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragStartPosition.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const buttonSize = 36;
    const padding = 10;

    const newX = e.clientX - containerRect.left - dragStartPosition.current.x;
    const newY = e.clientY - containerRect.top - dragStartPosition.current.y;

    const constrainedX = Math.max(-buttonSize + padding, Math.min(newX, containerRect.width - padding));
    const constrainedY = Math.max(-buttonSize + padding, Math.min(newY, containerRect.height - padding));

    setPosition({ x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging) return;

    const moveDistance = Math.sqrt(
      Math.pow(e.clientX - mouseDownPosition.current.x, 2) +
      Math.pow(e.clientY - mouseDownPosition.current.y, 2)
    );

    setIsDragging(false);

    if (moveDistance < 5) {
      setIsExpanded(!isExpanded);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isExpanded]);

  return (
    <div ref={containerRef} className="sidebar-toggle-container">
      <aside
        className={`floating-sidebar ${isExpanded ? "expanded" : ""}`}
        style={{
          left: `${position.x + 40}px`,
          top: `${position.y}px`,
        }}
      >
        <div className="sidebar-scroll-wrapper">
          {children}
        </div>
      </aside>

      <button
        ref={toggleButtonRef}
        className={`toggle ${isDragging ? "dragging" : ""} ${isExpanded ? "active" : ""}`}
        onMouseDown={handleMouseDown}
        aria-label={isExpanded ? "收起侧边栏" : "展开侧边栏"}
        title={isExpanded ? "收起" : title}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <span className="toggle-text">{title}</span>
        <span className="toggle-icon">{isExpanded ? "×" : "☰"}</span>
      </button>
    </div>
  );
}
