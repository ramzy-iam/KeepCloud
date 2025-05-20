import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743465504360 implements MigrationInterface {
    name = 'Migration1743465504360'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" RENAME COLUMN "authProviderId" TO "picture"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" RENAME COLUMN "picture" TO "authProviderId"`);
    }

}
