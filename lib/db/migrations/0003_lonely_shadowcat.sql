ALTER TABLE "meetings" ADD COLUMN "uuid" varchar(36);
UPDATE "meetings" SET "uuid" = gen_random_uuid()::text WHERE "uuid" IS NULL;
ALTER TABLE "meetings" ALTER COLUMN "uuid" SET NOT NULL;
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_uuid_unique" UNIQUE("uuid");