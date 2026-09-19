CREATE TABLE "Client" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lastContactDate" timestamp,
	"name" text NOT NULL,
	"riskFlag" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Deliverable" (
	"clientId" uuid NOT NULL,
	"description" text NOT NULL,
	"dueDate" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "DerailmentEvent" (
	"date" timestamp NOT NULL,
	"detectedAt" timestamp DEFAULT now() NOT NULL,
	"fredConfirmed" boolean,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recoveryAction" text,
	"resolvedAt" timestamp,
	"signalSummaryJson" json
);
--> statement-breakpoint
CREATE TABLE "GithubActivityLog" (
	"commitCount" integer DEFAULT 0 NOT NULL,
	"fetchedAt" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prCount" integer DEFAULT 0 NOT NULL,
	"projectId" uuid NOT NULL,
	"repo" text NOT NULL,
	"windowEnd" timestamp NOT NULL,
	"windowStart" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Goal" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"description" text NOT NULL,
	"horizon" varchar NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Project" (
	"clientId" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"date" timestamp NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"summaryJson" json,
	"type" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Task" (
	"actualMinutes" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"dueDate" timestamp,
	"estimatedMinutes" integer,
	"goalId" uuid,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"priority" varchar DEFAULT 'medium' NOT NULL,
	"projectId" uuid NOT NULL,
	"scheduledDate" timestamp,
	"status" varchar DEFAULT 'todo' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_clientId_Client_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GithubActivityLog" ADD CONSTRAINT "GithubActivityLog_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_Client_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Task" ADD CONSTRAINT "Task_goalId_Goal_id_fk" FOREIGN KEY ("goalId") REFERENCES "public"."Goal"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;