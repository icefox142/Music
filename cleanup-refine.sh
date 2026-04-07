#!/bin/bash
# 清理 refine-project 目录的脚本
# 使用方法: bash cleanup-refine.sh

set -e

echo "🧹 开始清理 refine-project 目录..."

# 删除旧目录
echo "📁 删除旧的 refine-project 目录..."
rm -rf refine-project

# 重命名新目录
echo "📝 重命名 refine-project-temp 为 refine-project..."
mv refine-project-temp refine-project

# 验证
echo "✅ 验证目录结构..."
ls -la refine-project/ | head -15

echo ""
echo "🔍 验证 git remote..."
cd refine-project
git remote -v

echo ""
echo "✨ 清理完成！"
echo ""
echo "下一步："
echo "  cd refine-project"
echo "  pnpm install"
echo "  pnpm dev"
