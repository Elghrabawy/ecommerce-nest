import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWebhookEventEntity1772823708189 implements MigrationInterface {
    name = 'AddWebhookEventEntity1772823708189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "webhook_events" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "eventId" character varying NOT NULL, "eventType" character varying NOT NULL, "payload" json NOT NULL, "receivedAt" TIMESTAMP NOT NULL DEFAULT now(), "processed" boolean NOT NULL DEFAULT false, "processedAt" TIMESTAMP, "errorMessage" text, "retryCount" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_f474c452069d5fc87cc1cfb35e7" UNIQUE ("eventId"), CONSTRAINT "PK_4cba37e6a0acb5e1fc49c34ebfd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f474c452069d5fc87cc1cfb35e" ON "webhook_events" ("eventId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_f474c452069d5fc87cc1cfb35e"`);
        await queryRunner.query(`DROP TABLE "webhook_events"`);
    }

}
