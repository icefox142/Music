export * from "./_shard/enums";

export * from "./admin/auth";
export * from "./admin/system";
export * from "./client/emojis";
export * from "./client/music";
export * from "./client/users";

// Re-export all tables for convenience
export {
  clientSongs,
  clientPlaylists,
  clientPlaylistSongs,
  clientLyrics,
  clientComments,
  clientCommentLikes,
} from "./client/music";

export {
  clientEmojis,
  clientEmojiCollections,
  clientEmojiFavorites,
  clientEmojiUsageLogs,
} from "./client/emojis";

export { clientUsers } from "./client/users";
