import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743425295842 implements MigrationInterface {
    name = 'Migration1743425295842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" ADD "authProviderId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "authProviderId"`);
    }

}
