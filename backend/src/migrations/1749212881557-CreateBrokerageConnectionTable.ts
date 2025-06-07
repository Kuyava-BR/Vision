import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBrokerageConnectionTable1749212881557 implements MigrationInterface {
    name = 'CreateBrokerageConnectionTable1749212881557'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."brokerage_connection_brokerage_enum" AS ENUM('Binance')`);
        await queryRunner.query(`CREATE TABLE "brokerage_connection" ("id" SERIAL NOT NULL, "brokerage" "public"."brokerage_connection_brokerage_enum" NOT NULL, "apiKey" character varying NOT NULL, "apiSecret" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_4b1775d3cc413f05b693ae35289" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "brokerage_connection" ADD CONSTRAINT "FK_8b15da4d6db2a236789877ee975" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "brokerage_connection" DROP CONSTRAINT "FK_8b15da4d6db2a236789877ee975"`);
        await queryRunner.query(`DROP TABLE "brokerage_connection"`);
        await queryRunner.query(`DROP TYPE "public"."brokerage_connection_brokerage_enum"`);
    }

}
