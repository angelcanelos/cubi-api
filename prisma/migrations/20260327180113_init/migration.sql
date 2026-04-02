-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('BORRADOR', 'FINALIZADO');

-- CreateTable
CREATE TABLE "EntradaTroceria" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "turno" TEXT NOT NULL,
    "aserradero" TEXT NOT NULL,
    "origen" TEXT NOT NULL,
    "clase" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "estado" "Estado" NOT NULL DEFAULT 'BORRADOR',
    "volumenTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTrozas" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntradaTroceria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Troza" (
    "id" SERIAL NOT NULL,
    "entradaId" INTEGER NOT NULL,
    "diametro1" DOUBLE PRECISION NOT NULL,
    "diametro2" DOUBLE PRECISION NOT NULL,
    "largo" DOUBLE PRECISION NOT NULL,
    "descuento" DOUBLE PRECISION NOT NULL,
    "volumen" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Troza_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntradaProduccion" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "turno" TEXT NOT NULL,
    "aserradero" TEXT NOT NULL,
    "estado" "Estado" NOT NULL DEFAULT 'BORRADOR',
    "volumenTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPiezas" INTEGER NOT NULL DEFAULT 0,
    "totalPiesTabla" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntradaProduccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PiezaProduccion" (
    "id" SERIAL NOT NULL,
    "entradaId" INTEGER NOT NULL,
    "grueso" DOUBLE PRECISION NOT NULL,
    "clase" TEXT NOT NULL,
    "ancho" DOUBLE PRECISION NOT NULL,
    "largo" DOUBLE PRECISION NOT NULL,
    "verde" INTEGER NOT NULL,
    "estufa" INTEGER NOT NULL,
    "piesTabla" DOUBLE PRECISION NOT NULL,
    "volumen" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PiezaProduccion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Troza" ADD CONSTRAINT "Troza_entradaId_fkey" FOREIGN KEY ("entradaId") REFERENCES "EntradaTroceria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PiezaProduccion" ADD CONSTRAINT "PiezaProduccion_entradaId_fkey" FOREIGN KEY ("entradaId") REFERENCES "EntradaProduccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
