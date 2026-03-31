// 测试导入新路由模块
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testImports() {
  try {
    // 测试导入集合路由
    const collectionsPath = join(__dirname, 'src/routes/client/emoji-collections/index.ts');
    console.log('尝试导入:', collectionsPath);
    const collectionsModule = await import('./src/routes/client/emoji-collections/index.ts');
    console.log('✅ emoji-collections 导入成功');
  } catch (e) {
    console.error('❌ emoji-collections 导入失败:', e.message);
  }

  try {
    // 测试导入收藏路由
    const favoritesPath = join(__dirname, 'src/routes/client/emoji-favorites/index.ts');
    console.log('尝试导入:', favoritesPath);
    const favoritesModule = await import('./src/routes/client/emoji-favorites/index.ts');
    console.log('✅ emoji-favorites 导入成功');
  } catch (e) {
    console.error('❌ emoji-favorites 导入失败:', e.message);
  }

  try {
    // 测试导入使用记录路由
    const usageLogsPath = join(__dirname, 'src/routes/client/emoji-usage-logs/index.ts');
    console.log('尝试导入:', usageLogsPath);
    const usageLogsModule = await import('./src/routes/client/emoji-usage-logs/index.ts');
    console.log('✅ emoji-usage-logs 导入成功');
  } catch (e) {
    console.error('❌ emoji-usage-logs 导入失败:', e.message);
  }
}

testImports();
