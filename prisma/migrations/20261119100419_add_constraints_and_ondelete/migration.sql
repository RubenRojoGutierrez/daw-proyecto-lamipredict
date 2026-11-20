/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `Defecto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `Maquina` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "RegistroCalidad" DROP CONSTRAINT "RegistroCalidad_id_pieza_fkey";

-- DropForeignKey
ALTER TABLE "Telemetria" DROP CONSTRAINT "Telemetria_id_pieza_fkey";

-- AlterTable
ALTER TABLE "Telemetria" ALTER COLUMN "id_pieza" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "rol" SET DEFAULT 'user';

-- CreateIndex
CREATE UNIQUE INDEX "Defecto_nombre_key" ON "Defecto"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Maquina_nombre_key" ON "Maquina"("nombre");

-- AddForeignKey
ALTER TABLE "Telemetria" ADD CONSTRAINT "Telemetria_id_pieza_fkey" FOREIGN KEY ("id_pieza") REFERENCES "Pieza"("id_pieza") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroCalidad" ADD CONSTRAINT "RegistroCalidad_id_pieza_fkey" FOREIGN KEY ("id_pieza") REFERENCES "Pieza"("id_pieza") ON DELETE CASCADE ON UPDATE CASCADE;
