import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1749211793265 implements MigrationInterface {
    name = 'InitialSchema1749211793265'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "isActive" boolean NOT NULL DEFAULT true, "permissions" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chart" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "data" json NOT NULL, "description" text, "type" character varying NOT NULL DEFAULT 'line', "isFavorite" boolean NOT NULL DEFAULT false, "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_992ed0006df2077b57b2d06eea4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."alert_status_enum" AS ENUM('active', 'triggered', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "alert" ("id" SERIAL NOT NULL, "asset" character varying NOT NULL, "description" text NOT NULL, "conditions" jsonb NOT NULL, "status" "public"."alert_status_enum" NOT NULL DEFAULT 'active', "lastTriggeredAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_ad91cad659a3536465d564a4b2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "chart" ADD CONSTRAINT "FK_2a53339469120d3d4dea121f658" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alert" ADD CONSTRAINT "FK_c47ec76d2c5097d80eaae03853d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alert" DROP CONSTRAINT "FK_c47ec76d2c5097d80eaae03853d"`);
        await queryRunner.query(`ALTER TABLE "chart" DROP CONSTRAINT "FK_2a53339469120d3d4dea121f658"`);
        await queryRunner.query(`DROP TABLE "alert"`);
        await queryRunner.query(`DROP TYPE "public"."alert_status_enum"`);
        await queryRunner.query(`DROP TABLE "chart"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
