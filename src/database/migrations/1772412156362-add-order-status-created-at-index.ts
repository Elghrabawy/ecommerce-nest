import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderStatusCreatedAtIndex1772412156362 implements MigrationInterface {
    name = 'AddOrderStatusCreatedAtIndex1772412156362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "payments" SET "method" = 'STRIPE' WHERE "method" NOT IN ('STRIPE', 'PAYPAL')`);
        await queryRunner.query(`ALTER TYPE "public"."payments_method_enum" RENAME TO "payments_method_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."payments_method_enum" AS ENUM('PAYPAL', 'STRIPE')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "method" TYPE "public"."payments_method_enum" USING "method"::"text"::"public"."payments_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_method_enum_old"`);
        await queryRunner.query(`UPDATE "payments" SET "provider" = 'STRIPE' WHERE "provider" NOT IN ('STRIPE', 'PAYPAL')`);
        await queryRunner.query(`ALTER TYPE "public"."payments_provider_enum" RENAME TO "payments_provider_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."payments_provider_enum" AS ENUM('STRIPE', 'PAYPAL')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "provider" TYPE "public"."payments_provider_enum" USING "provider"::"text"::"public"."payments_provider_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_provider_enum_old"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_95c93a584de49f0b0e13f753630"`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`UPDATE "orders" SET "status" = 'SHIPPED' WHERE "status" = 'DELIVERED'`);
        await queryRunner.query(`ALTER TYPE "public"."orders_status_enum" RENAME TO "orders_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('PENDING', 'AWAITING_PAYMENT', 'PAID', 'EXPIRED', 'PROCESSING', 'SHIPPED', 'FAILED', 'CANCELLED')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum" USING "status"::"text"::"public"."orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_edd714311619a5ad09525045838"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_72679d98b31c737937b8932ebe6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2bf7996b7946ce753b60a87468"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "UQ_2bf7996b7946ce753b60a87468c"`);
        await queryRunner.query(`ALTER TABLE "cart_items" ALTER COLUMN "cartId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cart_items" ALTER COLUMN "productId" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_orders_status_created_at" ON "orders" ("status", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_2bf7996b7946ce753b60a87468" ON "cart_items" ("productId", "cartId") `);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "UQ_2bf7996b7946ce753b60a87468c" UNIQUE ("productId", "cartId")`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_95c93a584de49f0b0e13f753630" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_72679d98b31c737937b8932ebe6" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_72679d98b31c737937b8932ebe6"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_edd714311619a5ad09525045838"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_95c93a584de49f0b0e13f753630"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "UQ_2bf7996b7946ce753b60a87468c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2bf7996b7946ce753b60a87468"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_orders_status_created_at"`);
        await queryRunner.query(`ALTER TABLE "cart_items" ALTER COLUMN "productId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cart_items" ALTER COLUMN "cartId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "UQ_2bf7996b7946ce753b60a87468c" UNIQUE ("cartId", "productId")`);
        await queryRunner.query(`CREATE INDEX "IDX_2bf7996b7946ce753b60a87468" ON "cart_items" ("cartId", "productId") `);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_72679d98b31c737937b8932ebe6" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum_old" AS ENUM('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum_old" USING "status"::"text"::"public"."orders_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."orders_status_enum_old" RENAME TO "orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_95c93a584de49f0b0e13f753630" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TYPE "public"."payments_provider_enum_old" AS ENUM('STRIPE', 'PAYPAL', 'SQUARE', 'RAZORPAY', 'MANUAL')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "provider" TYPE "public"."payments_provider_enum_old" USING "provider"::"text"::"public"."payments_provider_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."payments_provider_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."payments_provider_enum_old" RENAME TO "payments_provider_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."payments_method_enum_old" AS ENUM('CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'STRIPE', 'BANK_TRANSFER', 'CASH')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "method" TYPE "public"."payments_method_enum_old" USING "method"::"text"::"public"."payments_method_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."payments_method_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."payments_method_enum_old" RENAME TO "payments_method_enum"`);
    }

}
