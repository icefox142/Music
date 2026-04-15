/**
 * 临时脚本：检查数据库中的数据
 */
import db from "@/db";
import { clientSongs, clientUsers, clientEmojis } from "@/db/schema";

async function checkData() {
  console.log("🔍 检查数据库中的数据...\n");

  // 检查用户
  const users = await db.select().from(clientUsers).limit(5);
  console.log("👥 用户数量:", users.length);
  if (users.length > 0) {
    console.log("第一个用户:", users[0]);
  }

  // 检查歌曲
  const songs = await db.select().from(clientSongs);
  console.log("\n🎵 歌曲数量:", songs.length);
  if (songs.length > 0) {
    console.log("前3首歌曲:");
    songs.slice(0, 3).forEach((song) => {
      console.log(`  - ${song.title} by ${song.artist}`);
    });
  }

  // 检查表情包
  const emojis = await db.select().from(clientEmojis);
  console.log("\n😀 表情包数量:", emojis.length);
  if (emojis.length > 0) {
    console.log("前3个表情包:");
    emojis.slice(0, 3).forEach((emoji) => {
      console.log(`  - ${emoji.description} (${emoji.tags.join(", ")})`);
    });
  }

  console.log("\n✅ 数据检查完成！");
}

checkData().catch(console.error);