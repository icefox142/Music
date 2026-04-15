/**
 * 填充音乐相关Mock数据到数据库
 * Seed music mock data to database
 */

import db from "@/db";
import { clientSongs, clientPlaylists, clientPlaylistSongs, clientLyrics, clientComments, clientUsers, clientEmojis } from "@/db/schema";
import { MusicGenre, MusicLanguage } from "@/lib/enums";
import { eq } from "drizzle-orm";
import { Status } from "@/lib/enums";

// Mock歌曲数据（从前端移植 - 所有20首歌曲）
const mockSongs = [
  {
    title: "Time to Pretend",
    artist: "Lazer Boomerang",
    coverUrl: "https://picsum.photos/seed/song1/300/300",
    audioUrl: "/music/「合成器波」Time to Pretend 伪装时刻 - Lazer Boomerang 百万级装备试听【Hi-Res】(1)_2026.04.09-09.39.57.mp3",
    duration: 240,
    genre: MusicGenre.ELECTRONIC,
    language: MusicLanguage.INSTRUMENTAL,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "Signals",
    artist: "Electronic Music Series",
    coverUrl: "https://picsum.photos/seed/song2/300/300",
    audioUrl: "/music/【好听的电子音乐系列】Signals_2026.04.09-09.40.06.mp3",
    duration: 220,
    genre: MusicGenre.ELECTRONIC,
    language: MusicLanguage.INSTRUMENTAL,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "Sacred Play Secret Place",
    artist: "安安静静地听",
    coverUrl: "https://picsum.photos/seed/song3/300/300",
    audioUrl: "/music/\"安安静静地听，认认真真地活！\"《Sacred Play Secret Place》.mp3",
    duration: 180,
    genre: MusicGenre.POP,
    language: MusicLanguage.CHINESE,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "The Truth That You Leave",
    artist: "无辜的晚风",
    coverUrl: "https://picsum.photos/seed/song4/300/300",
    audioUrl: "/music/《The Truth That You Leave》无辜的晚风能吹回你离开的事实吗？\".mp3",
    duration: 200,
    genre: MusicGenre.POP,
    language: MusicLanguage.CHINESE,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "圣诞快乐劳伦斯先生",
    artist: "坂本龍一",
    coverUrl: "https://picsum.photos/seed/song5/300/300",
    audioUrl: "/music/『4K60p·Hi-Res』坂本龍一《圣诞快乐劳伦斯先生Merry Christmas Mr.Lawrence》祝大家圣诞快乐!.mp3",
    duration: 300,
    genre: MusicGenre.CLASSICAL,
    language: MusicLanguage.JAPANESE,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "冰上的尤里",
    artist: "罗曼耶卓",
    coverUrl: "https://picsum.photos/seed/song6/300/300",
    audioUrl: "/music/【钢琴】《冰上的尤里》罗曼耶卓.mp3",
    duration: 260,
    genre: MusicGenre.CLASSICAL,
    language: MusicLanguage.INSTRUMENTAL,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "妖狐淫刀 [雪華繚乱]",
    artist: "游戏原声",
    coverUrl: "https://picsum.photos/seed/song7/300/300",
    audioUrl: "/music/【游戏原声】妖狐淫刀 [雪華繚乱].mp3",
    duration: 190,
    genre: MusicGenre.OTHER,
    language: MusicLanguage.JAPANESE,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "愿望的尽头",
    artist: "音乐酒馆",
    coverUrl: "https://picsum.photos/seed/song8/300/300",
    audioUrl: "/music/〖音乐酒馆🎵愿望的尽头〗\"已经释怀了罢\".mp3",
    duration: 210,
    genre: MusicGenre.POP,
    language: MusicLanguage.CHINESE,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "碎月",
    artist: "东方",
    coverUrl: "https://picsum.photos/seed/song9/300/300",
    audioUrl: "/music/东方《碎月》个人认为最美的版本.mp3",
    duration: 240,
    genre: MusicGenre.OTHER,
    language: MusicLanguage.JAPANESE,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "Running Up That Hill",
    artist: "Kat",
    coverUrl: "https://picsum.photos/seed/song10/300/300",
    audioUrl: "/music/百万级装备听《Running Up That Hill 》 [2018 Remaster] -Kat - 1.百万级装备听《Running Up That Hill 》 [2018 Re(Av860774191,P1).mp3",
    duration: 200,
    genre: MusicGenre.POP,
    language: MusicLanguage.ENGLISH,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "进击的巨人 第三季 OST",
    artist: "LENぞ97n10火巨説MAHLE",
    coverUrl: "https://picsum.photos/seed/song11/300/300",
    audioUrl: "/music/进击的巨人 第三季 OST - LENぞ97n10火巨説MAHLE.mp3",
    duration: 180,
    genre: MusicGenre.OTHER,
    language: MusicLanguage.JAPANESE,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "The snippet",
    artist: "Johannes Krupp",
    coverUrl: "https://picsum.photos/seed/song12/300/300",
    audioUrl: "/music/Johannes Krupp - The snippet.mp3",
    duration: 170,
    genre: MusicGenre.POP,
    language: MusicLanguage.ENGLISH,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "哈基山的基米美如水啊",
    artist: "哈基米",
    coverUrl: "https://picsum.photos/seed/song13/300/300",
    audioUrl: "/music/🐱哈基山的基米美如水啊🐱 - 1.🐱哈基山的基米美如水啊🐱(Av115161729930401,P1).mp3",
    duration: 190,
    genre: MusicGenre.POP,
    language: MusicLanguage.CHINESE,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "此曲献给理想主义者",
    artist: "理想主义者",
    coverUrl: "https://picsum.photos/seed/song14/300/300",
    audioUrl: "/music/此曲献给理想主义者.mp3",
    duration: 220,
    genre: MusicGenre.POP,
    language: MusicLanguage.CHINESE,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "被父母打断的__",
    artist: "未知艺术家",
    coverUrl: "https://picsum.photos/seed/song15/300/300",
    audioUrl: "/music/被父母打断的__.mp3",
    duration: 200,
    genre: MusicGenre.OTHER,
    language: MusicLanguage.CHINESE,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "海岛大亨5 第二集",
    artist: "海岛大亨",
    coverUrl: "https://picsum.photos/seed/song16/300/300",
    audioUrl: "/music/海岛大亨5 第二集 请问美国总统也是宇航员吗.mp3",
    duration: 180,
    genre: MusicGenre.OTHER,
    language: MusicLanguage.CHINESE,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "追憶の海",
    artist: "日本音乐",
    coverUrl: "https://picsum.photos/seed/song17/300/300",
    audioUrl: "/music/追憶の海.mp3",
    duration: 230,
    genre: MusicGenre.POP,
    language: MusicLanguage.JAPANESE,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "白黒魔法使い",
    artist: "东方幻想界",
    coverUrl: "https://picsum.photos/seed/song18/300/300",
    audioUrl: "/music/白黒魔法使い.mp3",
    duration: 200,
    genre: MusicGenre.OTHER,
    language: MusicLanguage.JAPANESE,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "河童たちのステップ",
    artist: "东方幻想界",
    coverUrl: "https://picsum.photos/seed/song19/300/300",
    audioUrl: "/music/河童たちのステップ.mp3",
    duration: 190,
    genre: MusicGenre.OTHER,
    language: MusicLanguage.JAPANESE,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
  {
    title: "紅い絨毯はメイドの挨拶",
    artist: "东方幻想界",
    coverUrl: "https://picsum.photos/seed/song20/300/300",
    audioUrl: "/music/紅い絨毯はメイドの挨拶.mp3",
    duration: 210,
    genre: MusicGenre.OTHER,
    language: MusicLanguage.JAPANESE,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
  },
];

// Mock播放列表数据
const mockPlaylists = [
  {
    name: "我的最爱",
    description: "最喜欢的歌曲集合",
    coverUrl: "https://picsum.photos/seed/playlist1/300/300",
    isPublic: true,
    songCount: 5,
    playCount: 2340,
  },
  {
    name: "周杰伦精选",
    description: "周杰伦经典歌曲",
    coverUrl: "https://picsum.photos/seed/playlist2/300/300",
    isPublic: true,
    songCount: 5,
    playCount: 5670,
  },
  {
    name: "日语流行",
    description: "日语流行音乐",
    coverUrl: "https://picsum.photos/seed/playlist3/300/300",
    isPublic: true,
    songCount: 3,
    playCount: 3420,
  },
];

// Mock歌词数据（匹配前端LRC格式）
const mockLyrics = [
  {
    songTitle: "Time to Pretend",
    content: `[00:00.00]Time to Pretend
[00:05.00]Lazer Boomerang
[00:10.00]纯音乐 - 电子合成器波
[00:15.00]享受这首音乐的律动
[00:20.00]感受合成器的美妙音色
[00:25.00]沉浸在这首伪装时刻
[00:30.00]百万级装备试听体验
[00:35.00]Hi-Res 高解析度音质
[00:40.00]让音乐带你进入另一个世界
[00:45.00]Time to pretend...
[00:50.00]享受这段音乐旅程`,
    language: "zh-CN",
    offset: 0,
    duration: 240,
    isVerified: true,
    qualityScore: 95,
  },
  {
    songTitle: "Signals",
    content: `[00:00.00]Signals
[00:05.00]Electronic Music Series
[00:10.00]好听的电子音乐系列
[00:15.00]接收来自电波的信号
[00:20.00]Signals in the air
[00:25.00]让节奏触动你的心灵
[00:30.00]电子音乐的魅力
[00:35.00]无法抗拒的旋律
[00:40.00]Signals all around
[00:45.00]感受音乐的力量`,
    language: "zh-CN",
    offset: 0,
    duration: 220,
    isVerified: true,
    qualityScore: 90,
  },
];

// Mock评论数据
const mockComments = [
  {
    songTitle: "Time to Pretend",
    content: "这首电子音乐太棒了！节奏感很强，适合工作时听。",
    likeCount: 12,
    replyCount: 1,
  },
  {
    songTitle: "Time to Pretend",
    content: "合成器的音色很美，百万级装备试听果然不一样！",
    likeCount: 8,
    replyCount: 0,
  },
  {
    songTitle: "Signals",
    content: "电子音乐系列都很棒，这首Signals特别喜欢。",
    likeCount: 15,
    replyCount: 2,
  },
];

// Mock表情包数据（简化版，适配后端schema）
const mockEmojis = [
  {
    url: "/emojis/1/耄神.png",
    description: "1表情包 - 耄神",
    tags: ["1", "耄神", "傲娇", "健身"],
  },
  {
    url: "/emojis/1.png",
    description: ".表情包 - 1",
    tags: [".", "1", "经典", "日常", "文艺"],
  },
  {
    url: "/emojis/ancient/ancient (1).GIF",
    description: "ancient表情包 - ancient (1)",
    tags: ["ancient", "惊讶", "日常"],
  },
  {
    url: "/emojis/ancient/ancient (1).JPG",
    description: "ancient表情包 - ancient (1)",
    tags: ["ancient", "追剧", "调皮", "疑惑"],
  },
  {
    url: "/emojis/emoji.png",
    description: "经典表情包",
    tags: ["经典", "日常", "搞笑"],
  },
  {
    url: "/emojis/happy.png",
    description: "开心表情",
    tags: ["开心", "快乐", "笑脸"],
  },
  {
    url: "/emojis/sad.png",
    description: "难过表情",
    tags: ["难过", "悲伤", "哭脸"],
  },
  {
    url: "/emojis/angry.png",
    description: "生气表情",
    tags: ["生气", "愤怒", "火大"],
  },
];

/**
 * 填充歌曲数据
 */
async function seedSongs() {
  console.log("🎵 开始填充歌曲数据...");

  // 先获取或创建测试用户
  let testUser;
  try {
    [testUser] = await db
      .select()
      .from(clientUsers)
      .limit(1);
  } catch (error) {
    console.log("⚠️  无法查询用户表，将使用默认ID");
  }

  const userId = testUser?.id || "00000000-0000-0000-0000-000000000001";

  for (const song of mockSongs) {
    try {
      await db.insert(clientSongs).values({
        ...song,
        createdBy: userId,
        updatedBy: userId,
      });
      console.log(`✅ 插入歌曲: ${song.title}`);
    } catch (error) {
      console.log(`⚠️  歌曲 ${song.title} 可能已存在`);
    }
  }

  console.log("🎵 歌曲数据填充完成！");
}

/**
 * 填充播放列表数据
 */
async function seedPlaylists() {
  console.log("🎶 开始填充播放列表数据...");

  // 获取所有歌曲
  const songs = await db.select().from(clientSongs).limit(10);
  if (songs.length === 0) {
    console.log("⚠️  没有找到歌曲，请先填充歌曲数据");
    return;
  }

  let testUser;
  try {
    [testUser] = await db
      .select()
      .from(clientUsers)
      .limit(1);
  } catch (error) {
    console.log("⚠️  无法查询用户表，将使用默认ID");
  }

  const userId = testUser?.id || "00000000-0000-0000-0000-000000000001";

  for (const playlist of mockPlaylists) {
    try {
      // 创建播放列表
      const [newPlaylist] = await db.insert(clientPlaylists).values({
        ...playlist,
        userId,
        createdBy: userId,
        updatedBy: userId,
      }).returning();

      // 为播放列表添加歌曲
      const playlistSongs = songs.slice(0, playlist.songCount);
      for (const song of playlistSongs) {
        await db.insert(clientPlaylistSongs).values({
          playlistId: newPlaylist.id,
          songId: song.id,
          sortOrder: Math.floor(Math.random() * 100),
          createdBy: userId,
        });
      }

      console.log(`✅ 插入播放列表: ${playlist.name}`);
    } catch (error) {
      console.log(`⚠️  播放列表 ${playlist.name} 可能已存在`);
    }
  }

  console.log("🎶 播放列表数据填充完成！");
}

/**
 * 填充歌词数据
 */
async function seedLyrics() {
  console.log("📝 开始填充歌词数据...");

  let testUser;
  try {
    [testUser] = await db
      .select()
      .from(clientUsers)
      .limit(1);
  } catch (error) {
    console.log("⚠️  无法查询用户表，将使用默认ID");
  }

  const userId = testUser?.id || "00000000-0000-0000-0000-000000000001";

  for (const lyrics of mockLyrics) {
    try {
      // 查找对应的歌曲
      const [song] = await db
        .select()
        .from(clientSongs)
        .where(eq(clientSongs.title, lyrics.songTitle))
        .limit(1);

      if (!song) {
        console.log(`⚠️  未找到歌曲: ${lyrics.songTitle}`);
        continue;
      }

      await db.insert(clientLyrics).values({
        ...lyrics,
        songId: song.id,
        createdBy: userId,
        updatedBy: userId,
      });
      console.log(`✅ 插入歌词: ${lyrics.songTitle}`);
    } catch (error) {
      console.log(`⚠️  歌词 ${lyrics.songTitle} 可能已存在`);
    }
  }

  console.log("📝 歌词数据填充完成！");
}

/**
 * 填充评论数据
 */
async function seedComments() {
  console.log("💬 开始填充评论数据...");

  let testUser;
  try {
    [testUser] = await db
      .select()
      .from(clientUsers)
      .limit(1);
  } catch (error) {
    console.log("⚠️  无法查询用户表，将使用默认ID");
  }

  const userId = testUser?.id || "00000000-0000-0000-0000-000000000001";

  for (const comment of mockComments) {
    try {
      // 查找对应的歌曲
      const [song] = await db
        .select()
        .from(clientSongs)
        .where(eq(clientSongs.title, comment.songTitle))
        .limit(1);

      if (!song) {
        console.log(`⚠️  未找到歌曲: ${comment.songTitle}`);
        continue;
      }

      await db.insert(clientComments).values({
        ...comment,
        songId: song.id,
        userId,
        createdBy: userId,
        updatedBy: userId,
        lastActivityAt: new Date().toISOString(),
      });
      console.log(`✅ 插入评论: ${comment.songTitle}`);
    } catch (error) {
      console.log(`⚠️  评论插入可能失败`);
    }
  }

  console.log("💬 评论数据填充完成！");
}

/**
 * 填充表情包数据
 */
async function seedEmojis() {
  console.log("😀 开始填充表情包数据...");

  let testUser;
  try {
    [testUser] = await db
      .select()
      .from(clientUsers)
      .limit(1);
  } catch (error) {
    console.log("⚠️  无法查询用户表，将使用默认ID");
  }

  const userId = testUser?.id || "00000000-0000-0000-0000-000000000001";

  for (const emoji of mockEmojis) {
    try {
      await db.insert(clientEmojis).values({
        ...emoji,
        createdBy: userId,
        updatedBy: userId,
        status: Status.ENABLED,
      });
      console.log(`✅ 插入表情包: ${emoji.description}`);
    } catch (error) {
      console.log(`⚠️  表情包 ${emoji.description} 可能已存在`);
    }
  }

  console.log("😀 表情包数据填充完成！");
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log("🚀 开始填充Mock数据到数据库...\n");

    await seedSongs();
    await seedPlaylists();
    await seedLyrics();
    await seedComments();
    await seedEmojis();

    console.log("\n✅ 所有Mock数据填充完成！");
    console.log("📊 数据统计:");
    console.log("  - 歌曲: 20首");
    console.log("  - 播放列表: 3个");
    console.log("  - 歌词: 2首");
    console.log("  - 评论: 3条");
    console.log("  - 表情包: 8个");

  } catch (error) {
    console.error("❌ 填充数据失败:", error);
    process.exit(1);
  }
}

// 运行主函数
main();
