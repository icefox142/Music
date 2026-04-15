CREATE TABLE "client_comment_likes" (
	"user_id" uuid NOT NULL,
	"comment_id" uuid NOT NULL,
	"like_type" integer NOT NULL,
	"liked_at" timestamp,
	CONSTRAINT "client_comment_likes_user_id_comment_id_pk" PRIMARY KEY("user_id","comment_id")
);
--> statement-breakpoint
CREATE TABLE "client_comments" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"created_at" timestamp,
	"created_by" varchar(64),
	"updated_at" timestamp,
	"updated_by" varchar(64),
	"song_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"parent_id" uuid,
	"content" text NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"dislike_count" integer DEFAULT 0 NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"ip_address" varchar(64),
	"user_agent" text,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_highlighted" boolean DEFAULT false NOT NULL,
	"last_activity_at" timestamp,
	"status" "status" DEFAULT 'ENABLED' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_lyrics" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"created_at" timestamp,
	"created_by" varchar(64),
	"updated_at" timestamp,
	"updated_by" varchar(64),
	"song_id" uuid NOT NULL,
	"content" text NOT NULL,
	"language" varchar(16) NOT NULL,
	"translation" text,
	"offset" integer DEFAULT 0 NOT NULL,
	"duration" integer NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"quality_score" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"status" "status" DEFAULT 'ENABLED' NOT NULL,
	CONSTRAINT "client_lyrics_songId_unique" UNIQUE("song_id")
);
--> statement-breakpoint
ALTER TABLE "client_comment_likes" ADD CONSTRAINT "client_comment_likes_user_id_client_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."client_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_comment_likes" ADD CONSTRAINT "client_comment_likes_comment_id_client_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."client_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_comments" ADD CONSTRAINT "client_comments_song_id_client_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."client_songs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_comments" ADD CONSTRAINT "client_comments_user_id_client_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."client_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_comments" ADD CONSTRAINT "client_comments_parent_id_client_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."client_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_lyrics" ADD CONSTRAINT "client_lyrics_song_id_client_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."client_songs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "client_comment_likes_user_id_idx" ON "client_comment_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "client_comment_likes_comment_id_idx" ON "client_comment_likes" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "client_comment_likes_type_idx" ON "client_comment_likes" USING btree ("like_type");--> statement-breakpoint
CREATE INDEX "client_comments_song_id_idx" ON "client_comments" USING btree ("song_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "client_comments_user_id_idx" ON "client_comments" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "client_comments_parent_id_idx" ON "client_comments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "client_comments_pinned_idx" ON "client_comments" USING btree ("is_pinned","like_count" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "client_comments_popularity_idx" ON "client_comments" USING btree ("like_count" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "client_comments_last_activity_idx" ON "client_comments" USING btree ("last_activity_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "client_comments_status_idx" ON "client_comments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "client_lyrics_song_id_idx" ON "client_lyrics" USING btree ("song_id");--> statement-breakpoint
CREATE INDEX "client_lyrics_language_idx" ON "client_lyrics" USING btree ("language");--> statement-breakpoint
CREATE INDEX "client_lyrics_verified_idx" ON "client_lyrics" USING btree ("is_verified");--> statement-breakpoint
CREATE INDEX "client_lyrics_quality_idx" ON "client_lyrics" USING btree ("quality_score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "client_lyrics_status_idx" ON "client_lyrics" USING btree ("status");