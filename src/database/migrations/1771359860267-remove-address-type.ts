import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveAddressType1771359860267 implements MigrationInterface {
    name = 'RemoveAddressType1771359860267'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."addresses_type_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."addresses_type_enum" AS ENUM('SHIPPING', 'BILLING', 'BOTH')`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "type" "public"."addresses_type_enum" NOT NULL`);
    }

}
