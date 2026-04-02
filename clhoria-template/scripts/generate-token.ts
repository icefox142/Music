/**
 * 生成测试用 JWT Token
 * Generate test JWT tokens for API testing
 */

import { addDays, getUnixTime } from "date-fns";
import { eq } from "drizzle-orm";
import { sign } from "hono/jwt";

import db from "@/db";
import { clientUsers } from "@/db/schema";
import env from "@/env";

/**
 * 生成客户端用户测试Token
 * Generate client user test token
 */
async function generateClientToken(username: string) {
  // 查询用户 / Query user
  const user = await db.query.clientUsers.findFirst({
    where: eq(clientUsers.username, username),
    columns: {
      id: true,
      username: true,
    },
  });

  if (!user) {
    console.error(`❌ 用户 ${username} 不存在`);
    console.log(`\n可用用户列表：`);
    const allUsers = await db.query.clientUsers.findMany({
      columns: {
        id: true,
        username: true,
        nickname: true,
      },
      limit: 10,
    });

    if (allUsers.length === 0) {
      console.log("  (数据库中暂无用户，请先创建用户)");
    } else {
      allUsers.forEach(u => {
        console.log(`  - ${u.username}${u.nickname ? ` (${u.nickname})` : ''}`);
      });
    }
    process.exit(1);
  }

  // 生成 Token payload / Generate token payload
  const now = getUnixTime(new Date());
  const accessTokenExp = getUnixTime(addDays(new Date(), 7)); // 7天过期 / 7 days expiration
  const jti = crypto.randomUUID();

  const tokenPayload = {
    sub: user.id,
    iat: now,
    exp: accessTokenExp,
    jti,
    type: "access",
  };

  // 生成 Token / Generate token
  const token = await sign(tokenPayload, env.CLIENT_JWT_SECRET, "HS256");

  return {
    token,
    userId: user.id,
    username: user.username,
    exp: new Date(accessTokenExp * 1000).toISOString(),
  };
}

/**
 * 主函数 / Main function
 */
async function main() {
  console.log("🎵 生成客户端测试 JWT Token\n");

  const username = process.argv[2];

  if (!username) {
    console.log("用法: pnpm tsx scripts/generate-token.ts <username>");
    console.log("\n示例:");
    console.log("  pnpm tsx scripts/generate-token.ts admin");
    console.log("  pnpm tsx scripts/generate-token.ts user");
    process.exit(1);
  }

  try {
    const result = await generateClientToken(username);

    console.log("✅ Token 生成成功！\n");
    console.log("👤 用户信息:");
    console.log(`   用户名: ${result.username}`);
    console.log(`   用户ID: ${result.userId}`);
    console.log(`   过期时间: ${result.exp}\n`);

    console.log("🔑 JWT Token:");
    console.log("   " + result.token + "\n");

    console.log("📝 使用方法:");
    console.log("   在请求头中添加:");
    console.log(`   Authorization: Bearer ${result.token}\n`);

    console.log("💡 在 API 文档中使用:");
    console.log("   1. 访问 http://localhost:9999/api/doc");
    console.log("   2. 点击右上角 'Authorize' 按钮");
    console.log("   3. 输入: Bearer " + result.token.substring(0, 20) + "...");
    console.log("   4. 点击 'Authorize' 并关闭对话框\n");

    // 保存到文件供后续使用 / Save to file for later use
    const fs = await import("fs");
    const path = await import("path");
    const tokenFile = path.join(process.cwd(), "test-token.json");
    fs.writeFileSync(tokenFile, JSON.stringify(result, null, 2));
    console.log("💾 Token 已保存到: test-token.json");
    console.log("   可以运行以下命令快速查看:");
    console.log("   cat test-token.json | grep token\n");
  } catch (error) {
    console.error("❌ 生成 Token 失败:", error.message);
    process.exit(1);
  }
}

main();
