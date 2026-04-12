/**
 * 歌曲 Mock 数据 Hook
 * 使用 Mock 数据，不依赖后端 API
 */

import { useState, useEffect } from "react";
import type { Song, SongQueryParams, PaginatedResponse } from "@/types/api";
import { MusicGenre, MusicLanguage } from "@/types/api";

// Mock 歌曲数据
const mockSongs: Song[] = [
  {
    id: "1",
    title: "Time to Pretend",
    artist: "Lazer Boomerang",
    coverUrl: "https://picsum.photos/seed/song1/300/300",
    audioUrl: "/music/「合成器波」Time to Pretend 伪装时刻 - Lazer Boomerang 百万级装备试听【Hi-Res】(1)_2026.04.09-09.39.57.mp3",
    genre: MusicGenre.ELECTRONIC,
    language: MusicLanguage.INSTRUMENTAL,
    duration: 240,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "2",
    title: "Signals",
    artist: "Electronic Music Series",
    coverUrl: "https://picsum.photos/seed/song2/300/300",
    audioUrl: "/music/【好听的电子音乐系列】Signals_2026.04.09-09.40.06.mp3",
    genre: MusicGenre.ELECTRONIC,
    language: MusicLanguage.INSTRUMENTAL,
    duration: 220,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "3",
    title: "Sacred Play Secret Place",
    artist: "安安静静地听",
    coverUrl: "https://picsum.photos/seed/song3/300/300",
    audioUrl: "/music/\"安安静静地听，认认真真地活！\"《Sacred Play Secret Place》.mp3",
    genre: MusicGenre.POP,
    language: MusicLanguage.CHINESE,
    duration: 180,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-03T00:00:00.000Z",
    updatedAt: "2024-01-03T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "4",
    title: "The Truth That You Leave",
    artist: "无辜的晚风",
    coverUrl: "https://picsum.photos/seed/song4/300/300",
    audioUrl: "/music/《The Truth That You Leave》无辜的晚风能吹回你离开的事实吗？\".mp3",
    genre: MusicGenre.POP,
    language: MusicLanguage.CHINESE,
    duration: 200,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-04T00:00:00.000Z",
    updatedAt: "2024-01-04T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "5",
    title: "圣诞快乐劳伦斯先生",
    artist: "坂本龍一",
    coverUrl: "https://picsum.photos/seed/song5/300/300",
    audioUrl: "/music/『4K60p·Hi-Res』坂本龍一《圣诞快乐劳伦斯先生Merry Christmas Mr.Lawrence》祝大家圣诞快乐!.mp3",
    genre: MusicGenre.CLASSICAL,
    language: MusicLanguage.JAPANESE,
    duration: 300,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-05T00:00:00.000Z",
    updatedAt: "2024-01-05T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "6",
    title: "冰上的尤里",
    artist: "罗曼耶卓",
    coverUrl: "https://picsum.photos/seed/song6/300/300",
    audioUrl: "/music/【钢琴】《冰上的尤里》罗曼耶卓.mp3",
    genre: MusicGenre.CLASSICAL,
    language: MusicLanguage.INSTRUMENTAL,
    duration: 260,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-06T00:00:00.000Z",
    updatedAt: "2024-01-06T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "7",
    title: "妖狐淫刀 [雪華繚乱]",
    artist: "游戏原声",
    coverUrl: "https://picsum.photos/seed/song7/300/300",
    audioUrl: "/music/【游戏原声】妖狐淫刀 [雪華繚乱].mp3",
    genre: MusicGenre.OTHER,
    language: MusicLanguage.JAPANESE,
    duration: 190,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-07T00:00:00.000Z",
    updatedAt: "2024-01-07T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "8",
    title: "愿望的尽头",
    artist: "音乐酒馆",
    coverUrl: "https://picsum.photos/seed/song8/300/300",
    audioUrl: "/music/〖音乐酒馆🎵愿望的尽头〗\"已经释怀了罢\".mp3",
    genre: MusicGenre.POP,
    language: MusicLanguage.CHINESE,
    duration: 210,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-08T00:00:00.000Z",
    updatedAt: "2024-01-08T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "9",
    title: "碎月",
    artist: "东方",
    coverUrl: "https://picsum.photos/seed/song9/300/300",
    audioUrl: "/music/东方《碎月》个人认为最美的版本.mp3",
    genre: MusicGenre.OTHER,
    language: MusicLanguage.JAPANESE,
    duration: 240,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-09T00:00:00.000Z",
    updatedAt: "2024-01-09T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "10",
    title: "Running Up That Hill",
    artist: "Kat",
    coverUrl: "https://picsum.photos/seed/song10/300/300",
    audioUrl: "/music/百万级装备听《Running Up That Hill 》 [2018 Remaster] -Kat - 1.百万级装备听《Running Up That Hill 》 [2018 Re(Av860774191,P1).mp3",
    genre: MusicGenre.POP,
    language: MusicLanguage.ENGLISH,
    duration: 200,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2024-01-10T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "11",
    title: "进击的巨人 第三季 OST",
    artist: "LENぞ97n10火巨説MAHLE",
    coverUrl: "https://picsum.photos/seed/song11/300/300",
    audioUrl: "/music/进击的巨人 第三季 OST - LENぞ97n10火巨説MAHLE.mp3",
    genre: MusicGenre.OTHER,
    language: MusicLanguage.JAPANESE,
    duration: 180,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-11T00:00:00.000Z",
    updatedAt: "2024-01-11T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "12",
    title: "The snippet",
    artist: "Johannes Krupp",
    coverUrl: "https://picsum.photos/seed/song12/300/300",
    audioUrl: "/music/Johannes Krupp - The snippet.mp3",
    genre: MusicGenre.POP,
    language: MusicLanguage.ENGLISH,
    duration: 170,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-12T00:00:00.000Z",
    updatedAt: "2024-01-12T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "13",
    title: "哈基山的基米美如水啊",
    artist: "哈基米",
    coverUrl: "https://picsum.photos/seed/song13/300/300",
    audioUrl: "/music/🐱哈基山的基米美如水啊🐱 - 1.🐱哈基山的基米美如水啊🐱(Av115161729930401,P1).mp3",
    genre: MusicGenre.POP,
    language: MusicLanguage.CHINESE,
    duration: 190,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-13T00:00:00.000Z",
    updatedAt: "2024-01-13T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "14",
    title: "此曲献给理想主义者",
    artist: "理想主义者",
    coverUrl: "https://picsum.photos/seed/song14/300/300",
    audioUrl: "/music/此曲献给理想主义者.mp3",
    genre: MusicGenre.POP,
    language: MusicLanguage.CHINESE,
    duration: 220,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-14T00:00:00.000Z",
    updatedAt: "2024-01-14T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "15",
    title: "被父母打断的__",
    artist: "未知艺术家",
    coverUrl: "https://picsum.photos/seed/song15/300/300",
    audioUrl: "/music/被父母打断的__.mp3",
    genre: MusicGenre.OTHER,
    language: MusicLanguage.CHINESE,
    duration: 200,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "16",
    title: "海岛大亨5 第二集",
    artist: "海岛大亨",
    coverUrl: "https://picsum.photos/seed/song16/300/300",
    audioUrl: "/music/海岛大亨5 第二集 请问美国总统也是宇航员吗.mp3",
    genre: MusicGenre.OTHER,
    language: MusicLanguage.CHINESE,
    duration: 180,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-16T00:00:00.000Z",
    updatedAt: "2024-01-16T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "17",
    title: "追憶の海",
    artist: "日本音乐",
    coverUrl: "https://picsum.photos/seed/song17/300/300",
    audioUrl: "/music/追憶の海.mp3",
    genre: MusicGenre.POP,
    language: MusicLanguage.JAPANESE,
    duration: 230,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-17T00:00:00.000Z",
    updatedAt: "2024-01-17T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "18",
    title: "白黒魔法使い",
    artist: "东方幻想界",
    coverUrl: "https://picsum.photos/seed/song18/300/300",
    audioUrl: "/music/白黒魔法使い.mp3",
    genre: MusicGenre.OTHER,
    language: MusicLanguage.JAPANESE,
    duration: 200,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-18T00:00:00.000Z",
    updatedAt: "2024-01-18T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "19",
    title: "河童たちのステップ",
    artist: "东方幻想界",
    coverUrl: "https://picsum.photos/seed/song19/300/300",
    audioUrl: "/music/河童たちのステップ.mp3",
    genre: MusicGenre.OTHER,
    language: MusicLanguage.JAPANESE,
    duration: 190,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-19T00:00:00.000Z",
    updatedAt: "2024-01-19T00:00:00.000Z",
    status: "ENABLED",
  },
  {
    id: "20",
    title: "紅い絨毯はメイドの挨拶",
    artist: "东方幻想界",
    coverUrl: "https://picsum.photos/seed/song20/300/300",
    audioUrl: "/music/紅い絨毯はメイドの挨拶.mp3",
    genre: MusicGenre.OTHER,
    language: MusicLanguage.JAPANESE,
    duration: 210,
    releaseDate: null,
    playCount: 0,
    favoriteCount: 0,
    spotifyId: null,
    appleMusicId: null,
    youtubeId: null,
    createdAt: "2024-01-20T00:00:00.000Z",
    updatedAt: "2024-01-20T00:00:00.000Z",
    status: "ENABLED",
  },
];

// 模拟网络延迟
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// 分页辅助函数
function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const total = items.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = items.slice(start, end);

  return {
    data,
    total,
    page,
    pageSize,
  };
}

/**
 * 获取歌曲列表 - Mock 版本
 */
export function useSongsMock(params?: SongQueryParams) {
  const [data, setData] = useState<PaginatedResponse<Song> | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 模拟网络延迟
        await delay();

        let filteredSongs = [...mockSongs];

        // 根据参数过滤
        if (params?.genre) {
          filteredSongs = filteredSongs.filter((s) => s.genre === params.genre);
        }
        if (params?.language) {
          filteredSongs = filteredSongs.filter((s) => s.language === params.language);
        }
        if (params?.search) {
          const searchLower = params.search.toLowerCase();
          filteredSongs = filteredSongs.filter(
            (s) =>
              s.title.toLowerCase().includes(searchLower) ||
              s.artist.toLowerCase().includes(searchLower)
          );
        }

        // 分页
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 20;
        const result = paginate(filteredSongs, page, pageSize);

        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params]);

  return {
    data: data?.data,
    total: data?.total,
    page: data?.page,
    pageSize: data?.pageSize,
    isLoading,
    error,
  };
}

/**
 * 获取单个歌曲 - Mock 版本
 */
export function useSongMock(id: string) {
  const [data, setData] = useState<Song | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await delay();

        const song = mockSongs.find((s) => s.id === id);
        if (!song) {
          throw new Error(`歌曲 ${id} 不存在`);
        }

        setData(song);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  return {
    data,
    isLoading,
    error,
  };
}

/**
 * 获取所有 Mock 歌曲（用于播放列表）
 */
export function useAllSongsMock() {
  return {
    songs: mockSongs,
    loading: false,
  };
}
