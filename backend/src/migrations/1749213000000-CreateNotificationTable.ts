import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationTable1749213000000 implements MigrationInterface {
    name = 'CreateNotificationTable1749213000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."notification_signal_enum" AS ENUM('buy', 'sell', 'neutral')
        `);
        await queryRunner.query(`
            CREATE TABLE "notification" (
                "id" SERIAL NOT NULL,
                "asset" character varying NOT NULL,
                "signal" "public"."notification_signal_enum" NOT NULL,
                "priceAtSignal" numeric(18, 8) NOT NULL,
                "indicator" character varying NOT NULL,
                "reason" text NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac787277f" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "notification"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."notification_signal_enum"
        `);
    }

} 