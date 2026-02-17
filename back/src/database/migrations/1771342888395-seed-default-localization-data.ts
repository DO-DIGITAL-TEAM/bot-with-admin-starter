import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDefaultLocalizationData1771342888395 implements MigrationInterface {
  name = 'SeedDefaultLocalizationData1771342888395';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const existingLang = await queryRunner.query(`
      SELECT "id" FROM "langs" WHERE "slug" = 'en' LIMIT 1
    `);

    let langId: number;
    if (existingLang.length === 0) {
      const langResult = await queryRunner.query(`
        INSERT INTO "langs" ("slug", "title", "active", "dir", "dateformat", "defended", "created_at", "updated_at")
        VALUES ('en', 'English', true, 'ltr', 'ru', false, NOW(), NOW())
        RETURNING "id"
      `);
      langId = langResult[0].id;
    } else {
      langId = existingLang[0].id;
    }

    const existingWordbook = await queryRunner.query(`
      SELECT "id" FROM "wordbooks" WHERE "name" = 'common' LIMIT 1
    `);

    let wordbookId: number;
    if (existingWordbook.length === 0) {
      const wordbookResult = await queryRunner.query(`
        INSERT INTO "wordbooks" ("name", "load_to", "defended", "created_at", "updated_at")
        VALUES ('common', 'bot', false, NOW(), NOW())
        RETURNING "id"
      `);
      wordbookId = wordbookResult[0].id;
    } else {
      wordbookId = existingWordbook[0].id;
    }

    const existingWord = await queryRunner.query(`
      SELECT "id" FROM "words" WHERE "wordbook_id" = ${wordbookId} AND "mark" = 'welcome' LIMIT 1
    `);

    let wordId: number;
    if (existingWord.length === 0) {
      const wordResult = await queryRunner.query(`
        INSERT INTO "words" ("wordbook_id", "mark", "created_at", "updated_at")
        VALUES (${wordbookId}, 'welcome', NOW(), NOW())
        RETURNING "id"
      `);
      wordId = wordResult[0].id;
    } else {
      wordId = existingWord[0].id;
    }

    const existingTranslation = await queryRunner.query(`
      SELECT "id" FROM "word_translations" 
      WHERE "word_id" = ${wordId} AND "lang_id" = ${langId} 
      LIMIT 1
    `);

    if (existingTranslation.length === 0) {
      await queryRunner.query(`
        INSERT INTO "word_translations" ("word_id", "lang_id", "text", "created_at", "updated_at")
        VALUES (${wordId}, ${langId}, 'Welcome', NOW(), NOW())
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "word_translations" 
      WHERE "word_id" IN (
        SELECT "id" FROM "words" WHERE "wordbook_id" IN (
          SELECT "id" FROM "wordbooks" WHERE "name" = 'common'
        )
      )
    `);

    await queryRunner.query(`
      DELETE FROM "words" 
      WHERE "wordbook_id" IN (
        SELECT "id" FROM "wordbooks" WHERE "name" = 'common'
      )
    `);

    await queryRunner.query(`
      DELETE FROM "wordbooks" WHERE "name" = 'common'
    `);

    await queryRunner.query(`
      DELETE FROM "langs" WHERE "slug" = 'en'
    `);
  }
}
