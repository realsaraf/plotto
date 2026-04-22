CREATE TYPE "public"."plotto_capture_source" AS ENUM('share_sheet', 'voice', 'manual', 'email', 'screenshot');--> statement-breakpoint
CREATE TYPE "public"."plotto_event_status" AS ENUM('active', 'snoozed', 'done', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."plotto_importance" AS ENUM('ambient', 'soft_block', 'hard_block');--> statement-breakpoint
CREATE TYPE "public"."plotto_reminder_channel" AS ENUM('local_notification', 'push', 'alarm');--> statement-breakpoint
CREATE TYPE "public"."plotto_reminder_strategy" AS ENUM('silent', 'standard', 'critical');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "captures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"raw_content" text NOT NULL,
	"source" "plotto_capture_source" NOT NULL,
	"media_url" text,
	"llm_input" jsonb,
	"llm_output" jsonb,
	"llm_model" text,
	"llm_cost_cents" integer,
	"processed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"location" text,
	"all_day" boolean DEFAULT false NOT NULL,
	"recurrence_rule" text,
	"importance" "plotto_importance" DEFAULT 'soft_block' NOT NULL,
	"reminder_strategy" "plotto_reminder_strategy" DEFAULT 'standard' NOT NULL,
	"confidence" double precision,
	"source_capture_id" uuid,
	"parent_event_id" uuid,
	"status" "plotto_event_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"fires_at" timestamp with time zone NOT NULL,
	"channel" "plotto_reminder_channel" DEFAULT 'local_notification' NOT NULL,
	"fired" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "captures" ADD CONSTRAINT "captures_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_source_capture_id_captures_id_fk" FOREIGN KEY ("source_capture_id") REFERENCES "public"."captures"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reminders" ADD CONSTRAINT "reminders_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
