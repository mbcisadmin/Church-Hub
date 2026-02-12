CREATE TYPE "public"."application_type" AS ENUM('app', 'dashboard');--> statement-breakpoint
CREATE TABLE "app_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"user_email" varchar(255),
	"role_name" varchar(255),
	"can_view" boolean DEFAULT true,
	"can_edit" boolean DEFAULT false,
	"can_delete" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"key" varchar(50) NOT NULL,
	"type" "application_type" DEFAULT 'app' NOT NULL,
	"description" text,
	"route" varchar(255) NOT NULL,
	"icon" varchar(50),
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"requires_auth" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "applications_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "app_permissions" ADD CONSTRAINT "app_permissions_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;