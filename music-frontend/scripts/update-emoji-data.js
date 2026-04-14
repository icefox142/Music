/**
 * 耄耋表情包数据生成脚本
 * 用于从桌面文件夹重新生成mock数据
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__dirname);

const SOURCE_FOLDER = 'C:\\Users\\14269\\Desktop\\耄耋表情包';
const TARGET_FOLDER = path.join(__dirname, '../public/emojis');
const OUTPUT_FILE = path.join(__dirname, '../src/emojiMockData.json');

// 配置
const RANDOM_TAGS = [
  '搞笑', '萌宠', '表情', '日常', '吐槽', '无奈',
  '开心', '难过', '愤怒', '惊讶', '疑惑', '淡定',
  '撒娇', '傲娇', '呆萌', '调皮', '温馨', '治愈',
  '沙雕', '犀利', '扎心', '真实', '生活', '工作',
  '学习', '美食', '运动', '游戏', '追剧', '社交',
  '经典', '网红', '流行', '复古', '怀旧', '文艺',
  '励志', '正能量', '佛系', '养生', '健身', '旅行'
];

const RANDOM_CATEGORIES = [
  '生活', '情感', '动物', '人物', '表情',
  '动作', '节日', '食物', '物品', '自然'
];

function getRandomTags(count = 3) {
  const shuffled = [...RANDOM_TAGS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function getRandomCategory() {
  return RANDOM_CATEGORIES[Math.floor(Math.random() * RANDOM_CATEGORIES.length)];
}

function scanEmojiFiles(folder, emojiList = []) {
  const files = fs.readdirSync(folder);
  for (const file of files) {
    const fullPath = path.join(folder, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanEmojiFiles(fullPath, emojiList);
    } else if (/\.(png|jpg|jpeg|gif|webp)$/i.test(file)) {
      const relativePath = path.relative(SOURCE_FOLDER, fullPath);
      emojiList.push({
        fullPath,
        relativePath,
        fileName: file,
        folderName: path.basename(path.dirname(relativePath)) || 'root'
      });
    }
  }
  return emojiList;
}

function copyFolder(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const files = fs.readdirSync(src);
  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyFolder(srcPath, destPath);
    } else if (/\.(png|jpg|jpeg|gif|webp)$/i.test(file)) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function generateMockData() {
  console.log('🔍 扫描表情包文件夹...');
  const emojiFiles = scanEmojiFiles(SOURCE_FOLDER);
  console.log(`📊 找到 ${emojiFiles.length} 个表情包图片`);

  const folderGroups = {};
  emojiFiles.forEach((emoji, index) => {
    const folder = emoji.folderName;
    if (!folderGroups[folder]) {
      folderGroups[folder] = [];
    }
    folderGroups[folder].push({ ...emoji, index: index + 1 });
  });

  console.log(`📁 发现 ${Object.keys(folderGroups).length} 个文件夹`);

  const emojis = emojiFiles.map((emoji, index) => {
    const id = String(index + 1);
    const folderName = emoji.folderName;
    const baseName = path.basename(emoji.fileName, path.extname(emoji.fileName));
    const tags = getRandomTags(Math.floor(Math.random() * 3) + 2);

    return {
      id,
      name: baseName,
      description: `${folderName}表情包 - ${baseName}`,
      keywords: [folderName, baseName, ...tags.slice(0, 2)],
      category: getRandomCategory(),
      imageUrl: `/emojis/${emoji.relativePath.replace(/\\/g, '/')}`,
      gifUrl: null,
      stickerUrl: null,
      tags,
      isPublic: true,
      status: "ENABLED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const collections = Object.entries(folderGroups).map(([folderName, files], index) => {
    const collectionId = `c${index + 1}`;
    const emojiIds = files.map(f => String(f.index));
    const randomTags = getRandomTags(Math.floor(Math.random() * 3) + 1);
    const coverEmoji = emojis.find(e => e.id === String(files[0].index));

    return {
      id: collectionId,
      name: folderName,
      description: `${folderName}表情包集合，包含${files.length}个表情`,
      coverUrl: coverEmoji ? coverEmoji.imageUrl : `https://picsum.photos/400/300?random=${index}`,
      tags: [...new Set([...randomTags, folderName])],
      isFeatured: Math.random() > 0.5,
      sortOrder: index + 1,
      downloadCount: Math.floor(Math.random() * 5000) + 100,
      status: "ENABLED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emojis: emojiIds,
      _fileCount: files.length
    };
  });

  const allTags = new Set();
  const allCategories = new Set();
  emojis.forEach(emoji => {
    emoji.tags.forEach(tag => allTags.add(tag));
    allCategories.add(emoji.category);
  });

  const favorites = emojis.slice(0, Math.min(10, emojis.length)).map((emoji, index) => ({
    id: `f${index + 1}`,
    userId: "user-1",
    emojiId: emoji.id,
    emoji,
    createdAt: new Date().toISOString()
  }));

  const mockData = {
    emojis,
    collections,
    tags: Array.from(allTags),
    categories: Array.from(allCategories),
    favorites,
    stats: {
      totalEmojis: emojis.length,
      totalCollections: collections.length,
      totalTags: allTags.size,
      totalCategories: allCategories.size
    }
  };

  return mockData;
}

// 主函数
function main() {
  try {
    console.log('🚀 开始生成耄耋表情包Mock数据...');

    // 复制图片到public文件夹
    console.log('📁 复制表情包图片到public文件夹...');
    if (fs.existsSync(TARGET_FOLDER)) {
      fs.rmSync(TARGET_FOLDER, { recursive: true });
    }
    fs.mkdirSync(TARGET_FOLDER, { recursive: true });
    copyFolder(SOURCE_FOLDER, TARGET_FOLDER);

    // 生成mock数据
    console.log('📊 生成Mock数据...');
    const mockData = generateMockData();

    // 保存mock数据
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mockData, null, 2), 'utf-8');
    console.log(`✅ Mock数据已保存到: ${OUTPUT_FILE}`);

    console.log('\n📊 生成结果:');
    console.log(`   表情包数量: ${mockData.stats.totalEmojis}`);
    console.log(`   集合数量: ${mockData.stats.totalCollections}`);
    console.log(`   标签数量: ${mockData.stats.totalTags}`);
    console.log(`   分类数量: ${mockData.stats.totalCategories}`);

    console.log('\n🎯 表情包集合预览:');
    mockData.collections.slice(0, 5).forEach(col => {
      console.log(`   - ${col.name} (${col._fileCount}个表情)`);
    });

    console.log('\n🏷️  标签示例:');
    mockData.tags.slice(0, 10).forEach(tag => {
      console.log(`   - ${tag}`);
    });

    console.log('\n✅ 完成！现在可以启动开发服务器查看效果。');
    console.log('   运行: npm run dev');

  } catch (error) {
    console.error('❌ 生成失败:', error);
    process.exit(1);
  }
}

main();