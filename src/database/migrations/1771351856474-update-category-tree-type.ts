import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCategoryTreeType1771351856474 implements MigrationInterface {
    name = 'UpdateCategoryTreeType1771351856474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "nsleft"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "nsright"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "mpath" character varying DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "mpath"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "nsright" integer NOT NULL DEFAULT '2'`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "nsleft" integer NOT NULL DEFAULT '1'`);
    }

}
