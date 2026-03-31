CREATE TYPE "public"."music_genre" AS ENUM('POP', 'ROCK', 'HIP_HOP', 'RNB', 'JAZZ', 'CLASSICAL', 'ELECTRONIC', 'COUNTRY', 'REGGAE', 'BLUES', 'METAL', 'FOLK', 'LATIN', 'ASIAN_POP', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."music_language" AS ENUM('CHINESE', 'ENGLISH', 'JAPANESE', 'KOREAN', 'FRENCH', 'SPANISH', 'GERMAN', 'ITALIAN', 'PORTUGUESE', 'RUSSIAN', 'INSTRUMENTAL', 'OTHER');--> statement-breakpoint
CREATE TABLE "client_emoji_collections" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"created_at" timestamp,
	"created_by" varchar(64),
	"updated_at" timestamp,
	"updated_by" varchar(64),
	"name" varchar(128) NOT NULL,
	"cover_url" varchar(512) NOT NULL,
	"description" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"emoji_ids" text[] DEFAULT '{}' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"status" "status" DEFAULT 'ENABLED' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_emojis" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"created_at" timestamp,
	"created_by" varchar(64),
	"updated_at" timestamp,
	"updated_by" varchar(64),
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"url" varchar(512) NOT NULL,
	"description" text,
	"status" "status" DEFAULT 'ENABLED' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_emoji_favorites" (
	"user_id" uuid NOT NULL,
	"emoji_id" uuid NOT NULL,
	"favorited_at" timestamp,
	CONSTRAINT "client_emoji_favorites_user_id_emoji_id_pk" PRIMARY KEY("user_id","emoji_id")
);
--> statement-breakpoint
CREATE TABLE "client_emoji_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"emoji_id" uuid NOT NULL,
	"context" varchar(32) NOT NULL,
	"target_id" uuid,
	"count" integer DEFAULT 1 NOT NULL,
	"used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "client_playlist_songs" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"playlist_id" uuid NOT NULL,
	"song_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"added_at" timestamp,
	CONSTRAINT "client_playlist_songs_playlist_song_unique" UNIQUE("playlist_id","song_id")
);
--> statement-breakpoint
CREATE TABLE "client_playlists" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"created_at" timestamp,
	"created_by" varchar(64),
	"updated_at" timestamp,
	"updated_by" varchar(64),
	"user_id" uuid NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"cover_url" varchar(1024),
	"is_public" boolean DEFAULT false NOT NULL,
	"song_count" integer DEFAULT 0 NOT NULL,
	"play_count" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "status" DEFAULT 'ENABLED' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_songs" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"created_at" timestamp,
	"created_by" varchar(64),
	"updated_at" timestamp,
	"updated_by" varchar(64),
	"title" varchar(256) NOT NULL,
	"artist" varchar(256) NOT NULL,
	"cover_url" varchar(1024),
	"audio_url" varchar(1024) NOT NULL,
	"duration" integer NOT NULL,
	"genre" "music_genre" NOT NULL,
	"language" "music_language" NOT NULL,
	"release_date" timestamp,
	"play_count" integer DEFAULT 0 NOT NULL,
	"favorite_count" integer DEFAULT 0 NOT NULL,
	"spotify_id" varchar(128),
	"apple_music_id" varchar(128),
	"youtube_id" varchar(128),
	"status" "status" DEFAULT 'ENABLED' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_emoji_favorites" ADD CONSTRAINT "client_emoji_favorites_user_id_client_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."client_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_emoji_favorites" ADD CONSTRAINT "client_emoji_favorites_emoji_id_client_emojis_id_fk" FOREIGN KEY ("emoji_id") REFERENCES "public"."client_emojis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_emoji_usage_logs" ADD CONSTRAINT "client_emoji_usage_logs_emoji_id_client_emojis_id_fk" FOREIGN KEY ("emoji_id") REFERENCES "public"."client_emojis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_playlist_songs" ADD CONSTRAINT "client_playlist_songs_playlist_id_client_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."client_playlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_playlist_songs" ADD CONSTRAINT "client_playlist_songs_song_id_client_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."client_songs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_playlists" ADD CONSTRAINT "client_playlists_user_id_client_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."client_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "client_emoji_collections_featured_idx" ON "client_emoji_collections" USING btree ("is_featured","sort_order");--> statement-breakpoint
CREATE INDEX "client_emoji_collections_status_idx" ON "client_emoji_collections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "client_emojis_tags_idx" ON "client_emojis" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "client_emojis_status_idx" ON "client_emojis" USING btree ("status");--> statement-breakpoint
CREATE INDEX "client_emoji_favorites_user_id_idx" ON "client_emoji_favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "client_emoji_favorites_emoji_id_idx" ON "client_emoji_favorites" USING btree ("emoji_id");--> statement-breakpoint
CREATE INDEX "client_emoji_usage_logs_user_id_idx" ON "client_emoji_usage_logs" USING btree ("user_id","used_at");--> statement-breakpoint
CREATE INDEX "client_emoji_usage_logs_emoji_id_idx" ON "client_emoji_usage_logs" USING btree ("emoji_id","used_at");--> statement-breakpoint
CREATE INDEX "client_emoji_usage_logs_context_idx" ON "client_emoji_usage_logs" USING btree ("context","used_at");--> statement-breakpoint
CREATE INDEX "client_playlist_songs_playlist_position_idx" ON "client_playlist_songs" USING btree ("playlist_id","position");--> statement-breakpoint
CREATE INDEX "client_playlist_songs_song_idx" ON "client_playlist_songs" USING btree ("song_id");--> statement-breakpoint
CREATE INDEX "client_playlist_songs_added_at_idx" ON "client_playlist_songs" USING btree ("added_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "client_playlists_user_id_idx" ON "client_playlists" USING btree ("user_id","sort_order");--> statement-breakpoint
CREATE INDEX "client_playlists_public_idx" ON "client_playlists" USING btree ("is_public","play_count" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "client_playlists_play_count_idx" ON "client_playlists" USING btree ("play_count" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "client_playlists_status_idx" ON "client_playlists" USING btree ("status");--> statement-breakpoint
CREATE INDEX "client_songs_title_idx" ON "client_songs" USING btree ("title");--> statement-breakpoint
CREATE INDEX "client_songs_artist_idx" ON "client_songs" USING btree ("artist");--> statement-breakpoint
CREATE INDEX "client_songs_genre_idx" ON "client_songs" USING btree ("genre");--> statement-breakpoint
CREATE INDEX "client_songs_language_idx" ON "client_songs" USING btree ("language");--> statement-breakpoint
CREATE INDEX "client_songs_play_count_idx" ON "client_songs" USING btree ("play_count" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "client_songs_release_date_idx" ON "client_songs" USING btree ("release_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "client_songs_status_idx" ON "client_songs" USING btree ("status");