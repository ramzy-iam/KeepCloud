import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743424572585 implements MigrationInterface {
    name = 'Migration1743424572585'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "User" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "firstName" character varying, "lastName" character varying, "email" character varying NOT NULL, CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email"), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."FileShare_permission_enum" AS ENUM('view', 'edit', 'comment')`);
        await queryRunner.query(`CREATE TABLE "FileShare" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "shareWithId" integer NOT NULL, "permission" "public"."FileShare_permission_enum" NOT NULL, "fileId" integer, CONSTRAINT "PK_b14f51714b516ece0346cf7eb8c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."File_format_enum" AS ENUM('pdf', 'jpeg', 'jpg', 'png', 'gif', 'svg', 'mp4', 'webm', 'ogg', 'wav', 'mp3', 'json', 'xml', 'txt', 'xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx', 'csv', 'zip')`);
        await queryRunner.query(`CREATE TABLE "File" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "format" "public"."File_format_enum", "size" bigint, "path" character varying(1024) NOT NULL, "isFolder" boolean NOT NULL DEFAULT false, "temporaryDeletedAt" TIMESTAMP, "shared" boolean NOT NULL DEFAULT false, "ownerId" integer NOT NULL, "parentId" integer NOT NULL, CONSTRAINT "PK_b287aa0a177c20740f3d917e38f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "FileShare" ADD CONSTRAINT "FK_84c8983a6b20f0703a446499da1" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "FileShare" ADD CONSTRAINT "FK_66997e7380a8e94d087bbcc04df" FOREIGN KEY ("shareWithId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "File" ADD CONSTRAINT "FK_e1519e879e42e93479fff7b0dc7" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "File" ADD CONSTRAINT "FK_6ff24d4359a40f5ad497ed67a8c" FOREIGN KEY ("parentId") REFERENCES "File"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "File" DROP CONSTRAINT "FK_6ff24d4359a40f5ad497ed67a8c"`);
        await queryRunner.query(`ALTER TABLE "File" DROP CONSTRAINT "FK_e1519e879e42e93479fff7b0dc7"`);
        await queryRunner.query(`ALTER TABLE "FileShare" DROP CONSTRAINT "FK_66997e7380a8e94d087bbcc04df"`);
        await queryRunner.query(`ALTER TABLE "FileShare" DROP CONSTRAINT "FK_84c8983a6b20f0703a446499da1"`);
        await queryRunner.query(`DROP TABLE "File"`);
        await queryRunner.query(`DROP TYPE "public"."File_format_enum"`);
        await queryRunner.query(`DROP TABLE "FileShare"`);
        await queryRunner.query(`DROP TYPE "public"."FileShare_permission_enum"`);
        await queryRunner.query(`DROP TABLE "User"`);
    }

}
