import { MigrationInterface, QueryRunner } from 'typeorm';

export class FirstMigration1770894888659 implements MigrationInterface {
  name = 'FirstMigration1770894888659';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."payments_status_enum" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_method_enum" AS ENUM('CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'STRIPE', 'BANK_TRANSFER', 'CASH')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_provider_enum" AS ENUM('STRIPE', 'PAYPAL', 'SQUARE', 'RAZORPAY', 'MANUAL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "amount" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'USD', "status" "public"."payments_status_enum" NOT NULL DEFAULT 'PENDING', "method" "public"."payments_method_enum" NOT NULL, "provider" "public"."payments_provider_enum" NOT NULL, "transactionId" character varying, "paymentIntentId" character varying, "providerTransactionId" character varying, "refundedAmount" numeric(10,2), "failureReason" text, "metadata" json, "processedAt" TIMESTAMP, "refundedAt" TIMESTAMP, "orderId" integer NOT NULL, CONSTRAINT "REL_af929a5f2a400fdb6913b4967e" UNIQUE ("orderId"), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."addresses_type_enum" AS ENUM('SHIPPING', 'BILLING', 'BOTH')`,
    );
    await queryRunner.query(
      `CREATE TABLE "addresses" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "type" "public"."addresses_type_enum" NOT NULL, "Title" character varying NOT NULL, "company" character varying NOT NULL, "streetAddress" character varying NOT NULL, "addressLine2" character varying, "city" character varying NOT NULL, "state" character varying NOT NULL, "postalCode" character varying NOT NULL, "country" character varying(2) NOT NULL, "phone" character varying, "isDefault" boolean NOT NULL DEFAULT false, "userId" integer, CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_79ceb8c5cf715d5b4a3c26c2ae" ON "addresses" ("postalCode") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_35936c20d74117b96ca37c06db" ON "addresses" ("country") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "totalAmount" numeric(10,2) NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'PENDING', "paymentIntentId" character varying, "userId" integer, "shippingAddressId" integer, "billingAddressId" integer, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "quantity" integer NOT NULL, "priceAtPurchase" numeric(10,2) NOT NULL, "orderId" integer, "productId" integer, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text NOT NULL, "price" numeric(10,2) NOT NULL, "stock" integer NOT NULL, "images" jsonb, "version" integer NOT NULL, CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c9fb58de893725258746385e1" ON "products" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "reviews" ("id" SERIAL NOT NULL, "rating" integer NOT NULL, "comment" text, "productId" integer, "userId" integer, CONSTRAINT "CHK_e87bbcfbe3ea0dda3d626010ee" CHECK ("rating" >= 1 AND "rating" <= 5), CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "wishlists" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" integer, CONSTRAINT "REL_4f3c30555daa6ab0b70a1db772" UNIQUE ("userId"), CONSTRAINT "PK_d0a37f2848c5d268d315325f359" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cart_items" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "quantity" integer NOT NULL, "cartId" integer, "productId" integer, CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "carts" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" integer, CONSTRAINT "REL_69828a178f152f157dcf2f70a8" UNIQUE ("userId"), CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "avatar_url" text, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "wishlist_products" ("wishlistsId" integer NOT NULL, "productsId" integer NOT NULL, CONSTRAINT "PK_1a88ecc39c75cbd66e67ca8a77b" PRIMARY KEY ("wishlistsId", "productsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2cb6c4b2bd4198fbb525065cdd" ON "wishlist_products" ("wishlistsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0f085ed539a6af77f0a00ee009" ON "wishlist_products" ("productsId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_af929a5f2a400fdb6913b4967e1" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_95c93a584de49f0b0e13f753630" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_cc4e4adab232e8c05026b2f345d" FOREIGN KEY ("shippingAddressId") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_820a4c09ddad44884a97378d336" FOREIGN KEY ("billingAddressId") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_a6b3c434392f5d10ec171043666" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlists" ADD CONSTRAINT "FK_4f3c30555daa6ab0b70a1db772c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_72679d98b31c737937b8932ebe6" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "FK_69828a178f152f157dcf2f70a89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_products" ADD CONSTRAINT "FK_2cb6c4b2bd4198fbb525065cdd8" FOREIGN KEY ("wishlistsId") REFERENCES "wishlists"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_products" ADD CONSTRAINT "FK_0f085ed539a6af77f0a00ee0099" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wishlist_products" DROP CONSTRAINT "FK_0f085ed539a6af77f0a00ee0099"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist_products" DROP CONSTRAINT "FK_2cb6c4b2bd4198fbb525065cdd8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" DROP CONSTRAINT "FK_69828a178f152f157dcf2f70a89"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_72679d98b31c737937b8932ebe6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_edd714311619a5ad09525045838"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlists" DROP CONSTRAINT "FK_4f3c30555daa6ab0b70a1db772c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_a6b3c434392f5d10ec171043666"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_cdb99c05982d5191ac8465ac010"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_820a4c09ddad44884a97378d336"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_cc4e4adab232e8c05026b2f345d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_95c93a584de49f0b0e13f753630"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_af929a5f2a400fdb6913b4967e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0f085ed539a6af77f0a00ee009"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2cb6c4b2bd4198fbb525065cdd"`,
    );
    await queryRunner.query(`DROP TABLE "wishlist_products"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "carts"`);
    await queryRunner.query(`DROP TABLE "cart_items"`);
    await queryRunner.query(`DROP TABLE "wishlists"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c9fb58de893725258746385e1"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_35936c20d74117b96ca37c06db"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_79ceb8c5cf715d5b4a3c26c2ae"`,
    );
    await queryRunner.query(`DROP TABLE "addresses"`);
    await queryRunner.query(`DROP TYPE "public"."addresses_type_enum"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "public"."payments_provider_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payments_method_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
  }
}
