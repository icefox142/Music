/**
 * API 统一导出
 * API unified export
 */

// Music APIs
export { songsApi } from "./songs";
export { playlistsApi } from "./playlists";
export { playlistSongsApi } from "./playlist-songs";

// Emoji APIs
export { emojisApi } from "./emojis";
export { emojiCollectionsApi } from "./emoji-collections";
export { emojiFavoritesApi } from "./emoji-favorites";
export { emojiUsageLogsApi } from "./emoji-usage-logs";

// Other APIs
export { notificationsApi, subscribeToNotifications } from "./notifications";
export { usersApi } from "./users";

// Type exports
export type { Emoji, EmojiQueryParams } from "./emojis";
export type { EmojiCollection, CollectionQueryParams } from "./emoji-collections";
export type { EmojiFavorite, FavoriteQueryParams } from "./emoji-favorites";
export type { UsageLog, PopularEmoji, UsageStats, UsageContext } from "./emoji-usage-logs";
export type { NotificationMessage } from "./notifications";
