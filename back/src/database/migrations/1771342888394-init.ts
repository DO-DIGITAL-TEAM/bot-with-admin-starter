import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1771342888394 implements MigrationInterface {
    name = 'Init1771342888394'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "telegram_id" bigint NOT NULL,
                "username" character varying(255),
                "first_name" character varying(255) NOT NULL,
                "last_name" character varying(255),
                "language_code" character varying(10),
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "UQ_1a1e4649fd31ea6ec6b025c7bfc" UNIQUE ("telegram_id"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_1a1e4649fd31ea6ec6b025c7bf" ON "users" ("telegram_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."langs_dateformat_enum" AS ENUM('en', 'ru')
        `);
        await queryRunner.query(`
            CREATE TABLE "langs" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "slug" character varying(10),
                "title" character varying(255),
                "active" boolean NOT NULL DEFAULT true,
                "dir" character varying(3) NOT NULL DEFAULT 'ltr',
                "dateformat" "public"."langs_dateformat_enum" NOT NULL DEFAULT 'en',
                "defended" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_e0bb7dc43457e44d0123fb3e52f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e7b91472db7f34e3cef4e5fbfa" ON "langs" ("slug")
        `);
        await queryRunner.query(`
            CREATE TABLE "word_translations" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "word_id" integer NOT NULL,
                "lang_id" integer NOT NULL,
                "text" text,
                CONSTRAINT "PK_46099869cec7b0cb459312cfbec" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "words" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "wordbook_id" integer,
                "mark" character varying(255),
                CONSTRAINT "PK_feaf97accb69a7f355fa6f58a3d" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1967d289e295104b6f706d9c39" ON "words" ("mark")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."wordbooks_load_to_enum" AS ENUM('all', 'bot')
        `);
        await queryRunner.query(`
            CREATE TABLE "wordbooks" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying(255),
                "load_to" "public"."wordbooks_load_to_enum" NOT NULL DEFAULT 'all',
                "defended" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_4aa53cce77b4aa209a39f355c6b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_48d696bd928f0a670569bf5645" ON "wordbooks" ("load_to")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."admins_role_enum" AS ENUM('superadmin', 'admin')
        `);
        await queryRunner.query(`
            CREATE TABLE "admins" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "username" character varying(255) NOT NULL,
                "email" character varying(255) NOT NULL,
                "image" character varying,
                "is_active" boolean NOT NULL DEFAULT true,
                "role" "public"."admins_role_enum" NOT NULL DEFAULT 'admin',
                CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "passwords" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "value" character varying(255) NOT NULL,
                "admin_id" integer NOT NULL,
                CONSTRAINT "UQ_b64053a1228ff8996031d640f27" UNIQUE ("admin_id"),
                CONSTRAINT "REL_b64053a1228ff8996031d640f2" UNIQUE ("admin_id"),
                CONSTRAINT "PK_c5629066962a085dea3b605e49f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "word_translations"
            ADD CONSTRAINT "FK_0f50eeb9799e0998e99520a46d0" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "word_translations"
            ADD CONSTRAINT "FK_b5a59bbb02ed6133e68aa0b2763" FOREIGN KEY ("lang_id") REFERENCES "langs"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "words"
            ADD CONSTRAINT "FK_fb7fdaa4611a5969bec6f2b6afe" FOREIGN KEY ("wordbook_id") REFERENCES "wordbooks"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "passwords"
            ADD CONSTRAINT "FK_b64053a1228ff8996031d640f27" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "passwords" DROP CONSTRAINT "FK_b64053a1228ff8996031d640f27"
        `);
        await queryRunner.query(`
            ALTER TABLE "words" DROP CONSTRAINT "FK_fb7fdaa4611a5969bec6f2b6afe"
        `);
        await queryRunner.query(`
            ALTER TABLE "word_translations" DROP CONSTRAINT "FK_b5a59bbb02ed6133e68aa0b2763"
        `);
        await queryRunner.query(`
            ALTER TABLE "word_translations" DROP CONSTRAINT "FK_0f50eeb9799e0998e99520a46d0"
        `);
        await queryRunner.query(`
            DROP TABLE "passwords"
        `);
        await queryRunner.query(`
            DROP TABLE "admins"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."admins_role_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_48d696bd928f0a670569bf5645"
        `);
        await queryRunner.query(`
            DROP TABLE "wordbooks"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."wordbooks_load_to_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_1967d289e295104b6f706d9c39"
        `);
        await queryRunner.query(`
            DROP TABLE "words"
        `);
        await queryRunner.query(`
            DROP TABLE "word_translations"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e7b91472db7f34e3cef4e5fbfa"
        `);
        await queryRunner.query(`
            DROP TABLE "langs"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."langs_dateformat_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_1a1e4649fd31ea6ec6b025c7bf"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
    }

}
