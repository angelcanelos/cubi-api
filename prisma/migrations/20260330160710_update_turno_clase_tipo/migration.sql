/*
  Warnings:

  - You are about to drop the column `tipo` on the `EntradaTroceria` table. All the data in the column will be lost.
  - Changed the type of `clase` on the `EntradaTroceria` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `clase` on the `PiezaProduccion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "EntradaTroceria" DROP COLUMN "tipo",
DROP COLUMN "clase",
ADD COLUMN     "clase" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PiezaProduccion" DROP COLUMN "clase",
ADD COLUMN     "clase" INTEGER NOT NULL;
