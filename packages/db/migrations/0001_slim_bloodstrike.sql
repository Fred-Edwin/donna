CREATE TABLE "ClientDocument" (
	"amountCents" integer,
	"clientId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"docNumber" text,
	"dueDate" timestamp,
	"fileUrl" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issueDate" timestamp,
	"status" varchar DEFAULT 'sent' NOT NULL,
	"title" text NOT NULL,
	"type" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "MealLog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"description" text,
	"loggedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Observation" (
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"relatedEntityId" uuid,
	"relatedEntityType" text,
	"sourceType" varchar NOT NULL,
	"status" varchar DEFAULT 'new' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SleepLog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"hours" integer NOT NULL,
	"targetHours" integer DEFAULT 6 NOT NULL,
	"loggedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "StateLog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" varchar DEFAULT 'baseline' NOT NULL,
	"loggedAt" timestamp DEFAULT now() NOT NULL,
	"note" text
);
--> statement-breakpoint
ALTER TABLE "Client" ADD COLUMN "billingAddress" text;--> statement-breakpoint
ALTER TABLE "Client" ADD COLUMN "billingEmail" text;--> statement-breakpoint
ALTER TABLE "Client" ADD COLUMN "currency" varchar(3) DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "Client" ADD COLUMN "legalName" text;--> statement-breakpoint
ALTER TABLE "Client" ADD COLUMN "paymentTerms" text;--> statement-breakpoint
ALTER TABLE "Client" ADD COLUMN "primaryContactEmail" text;--> statement-breakpoint
ALTER TABLE "Client" ADD COLUMN "primaryContactName" text;--> statement-breakpoint
ALTER TABLE "Client" ADD COLUMN "primaryContactPhone" text;--> statement-breakpoint
ALTER TABLE "Client" ADD COLUMN "taxPin" text;--> statement-breakpoint
ALTER TABLE "Goal" ADD COLUMN "progressPct" integer;--> statement-breakpoint
ALTER TABLE "Goal" ADD COLUMN "targetDate" timestamp;--> statement-breakpoint
ALTER TABLE "ClientDocument" ADD CONSTRAINT "ClientDocument_clientId_Client_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE no action ON UPDATE no action;