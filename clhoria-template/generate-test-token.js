#!/usr/bin/env node
/**
 * 快速生成测试 JWT Token
 * Quick generate test JWT token
 */

import { addDays, getUnixTime } from "date-fns";
import { sign } from "hono/jwt";

// 从 .env 读取配置
const CLIENT_JWT_SECRET = "2zgUJ6vG3LPXeTPWSPzQR5MFPJXHm8RV"; // 从 .env 中读取

// 测试用户ID (使用 UUID v7 格式)
const TEST_USER_ID = "01234567-0123-0123-0123-0123456789ab";

async function generateToken() {
  const now = getUnixTime(new Date());
  const accessTokenExp = getUnixTime(addDays(new Date(), 7)); // 7天过期

  const payload = {
    sub: TEST_USER_ID,
    iat: now,
    exp: accessTokenExp,
    type: "access",
  };

  const token = await sign(payload, CLIENT_JWT_SECRET, "HS256");

  console.log("=".repeat(70));
  console.log("🎵 测试 JWT Token 已生成");
  console.log("=".repeat(70));
  console.log("\n👤 测试用户ID:", TEST_USER_ID);
  console.log("⏰ 过期时间:", new Date(accessTokenExp * 1000).toLocaleString('zh-CN'));
  console.log("\n🔑 JWT Token:");
  console.log("-".repeat(70));
  console.log(token);
  console.log("-".repeat(70));
  console.log("\n📝 使用方法:");
  console.log("1. 访问 API 文档: http://localhost:9999/api/doc");
  console.log("2. 点击右上角 'Authorize' / '授权' 按钮");
  console.log("3. 在输入框中粘贴以下内容 (包含 'Bearer '):");
  console.log("\n   Bearer " + token);
  console.log("\n4. 点击 'Authorize' 确认");
  console.log("\n" + "=".repeat(70));

  // 保存到文件
  const fs = require('fs');
  fs.writeFileSync('test-token.txt', token);
  console.log("\n💾 Token 已保存到: test-token.txt");
}

generateToken().catch(console.error);
