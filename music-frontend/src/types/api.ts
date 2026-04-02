/**
 * API 类型定义
 */

export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  audioUrl: string;
  duration: number;
  genre: MusicGenre;
  language: MusicLanguage;
  releaseDate: string | null;
  playCount: number;
  favoriteCount: number;
  spotifyId: string | null;
  appleMusicId: string | null;
  youtubeId: string | null;
  status: "ENABLED" | "DISABLED";
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  isPublic: boolean;
  songCount: number;
  playCount: number;
  sortOrder: number;
  status: "ENABLED" | "DISABLED";
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistSong {
  id: string;
  playlistId: string;
  songId: string;
  position: number;
  addedAt: string | null;
  song?: Song;
}

export enum MusicGenre {
  POP = "POP",
  ROCK = "ROCK",
  HIP_HOP = "HIP_HOP",
  RNB = "RNB",
  JAZZ = "JAZZ",
  CLASSICAL = "CLASSICAL",
  ELECTRONIC = "ELECTRONIC",
  COUNTRY = "COUNTRY",
  REGGAE = "REGGAE",
  BLUES = "BLUES",
  METAL = "METAL",
  FOLK = "FOLK",
  LATIN = "LATIN",
  ASIAN_POP = "ASIAN_POP",
  OTHER = "OTHER",
}

export enum MusicLanguage {
  CHINESE = "CHINESE",
  ENGLISH = "ENGLISH",
  JAPANESE = "JAPANESE",
  KOREAN = "KOREAN",
  FRENCH = "FRENCH",
  SPANISH = "SPANISH",
  GERMAN = "GERMAN",
  ITALIAN = "ITALIAN",
  PORTUGUESE = "PORTUGUESE",
  RUSSIAN = "RUSSIAN",
  INSTRUMENTAL = "INSTRUMENTAL",
  OTHER = "OTHER",
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SongQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  genre?: MusicGenre;
  language?: MusicLanguage;
  sortBy?: "playCount" | "releaseDate" | "createdAt" | "title";
  order?: "asc" | "desc";
}
