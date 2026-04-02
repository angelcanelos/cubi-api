import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Estado } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddTrozaDto } from './dto/add-troza.dto';
import { CreateEntradaDto } from './dto/create-entrada.dto';

@Injectable()
export class TroceriaService {
  constructor(private readonly prisma: PrismaService) {}

  async createEntrada(dto: CreateEntradaDto) {
    let aserradero = '';
    if (dto.turno === 'Matutino') aserradero = 'Aserradero 1';
    else if (dto.turno === 'Vespertino') aserradero = 'Aserradero 2';
    else if (dto.turno === 'Nocturno') aserradero = 'Aserradero 3';

    return this.prisma.entradaTroceria.create({
      data: {
        fecha: new Date(dto.fecha),
        turno: dto.turno,
        aserradero,
        origen: dto.origen,
        clase: dto.clase,
      },
      include: { trozas: true },
    });
  }

  async findAllFinalizadas() {
    return this.prisma.entradaTroceria.findMany({
      where: { estado: Estado.FINALIZADO },
      include: { trozas: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const entrada = await this.prisma.entradaTroceria.findUnique({
      where: { id },
      include: { trozas: true },
    });
    if (!entrada) {
      throw new NotFoundException('Entrada de troceria no encontrada');
    }
    return entrada;
  }

  async getSummary(id: number) {
    const entrada = await this.prisma.entradaTroceria.findUnique({
      where: { id },
      select: {
        id: true,
        fecha: true,
        volumenTotal: true,
        totalTrozas: true,
      },
    });
    if (!entrada) {
      throw new NotFoundException('Entrada de troceria no encontrada');
    }
    return entrada;
  }

  async addTroza(entradaId: number, dto: AddTrozaDto) {
    await this.ensureEntradaExists(entradaId);
    const volumen = this.calculateTrozaVolume(dto);

    await this.prisma.troza.create({
      data: {
        entradaId,
        diametro1: dto.diametro1,
        diametro2: dto.diametro2,
        largo: dto.largo,
        descuento: dto.descuento,
        volumen,
      },
    });

    return this.recalculateTrozasTotals(entradaId);
  }

  async removeTroza(entradaId: number, trozaId: number) {
    await this.ensureEntradaExists(entradaId);

    const troza = await this.prisma.troza.findUnique({ where: { id: trozaId } });
    if (!troza || troza.entradaId !== entradaId) {
      throw new NotFoundException('Troza no encontrada en la entrada');
    }

    await this.prisma.troza.delete({ where: { id: trozaId } });
    return this.recalculateTrozasTotals(entradaId);
  }

  async updateTroza(entradaId: number, trozaId: number, dto: import('./dto/update-troza.dto').UpdateTrozaDto) {
    await this.ensureEntradaExists(entradaId);
    const troza = await this.prisma.troza.findUnique({ where: { id: trozaId } });
    if (!troza || troza.entradaId !== entradaId) {
      throw new NotFoundException('Troza no encontrada en la entrada');
    }

    const mergedDto: AddTrozaDto = {
      diametro1: dto.diametro1 ?? troza.diametro1,
      diametro2: dto.diametro2 ?? troza.diametro2,
      largo: dto.largo ?? troza.largo,
      descuento: dto.descuento ?? troza.descuento,
    };
    const volumen = this.calculateTrozaVolume(mergedDto);

    await this.prisma.troza.update({
      where: { id: trozaId },
      data: { ...dto, volumen },
    });

    return this.recalculateTrozasTotals(entradaId);
  }

  async removeEntrada(entradaId: number) {
    await this.ensureEntradaExists(entradaId);
    await this.prisma.troza.deleteMany({ where: { entradaId } });
    return this.prisma.entradaTroceria.delete({ where: { id: entradaId } });
  }

  async finalizar(entradaId: number) {
    const entrada = await this.prisma.entradaTroceria.findUnique({
      where: { id: entradaId },
      include: { trozas: true },
    });

    if (!entrada) {
      throw new NotFoundException('Entrada de troceria no encontrada');
    }
    if (entrada.estado !== Estado.BORRADOR) {
      throw new BadRequestException(
        'Solo se puede finalizar una entrada en estado BORRADOR',
      );
    }
    if (entrada.trozas.length === 0) {
      throw new BadRequestException(
        'No se puede finalizar una entrada sin trozas',
      );
    }

    return this.prisma.entradaTroceria.update({
      where: { id: entradaId },
      data: { estado: Estado.FINALIZADO },
      include: { trozas: true },
    });
  }

  private async ensureEntradaExists(entradaId: number) {
    const entrada = await this.prisma.entradaTroceria.findUnique({
      where: { id: entradaId },
    });
    if (!entrada) {
      throw new NotFoundException('Entrada de troceria no encontrada');
    }
    return entrada;
  }

  private async recalculateTrozasTotals(entradaId: number) {
    const trozas = await this.prisma.troza.findMany({ where: { entradaId } });
    const volumenTotal = trozas.reduce((acc, troza) => acc + troza.volumen, 0);
    const totalTrozas = trozas.length;

    return this.prisma.entradaTroceria.update({
      where: { id: entradaId },
      data: { volumenTotal, totalTrozas },
      include: { trozas: true },
    });
  }

  private calculateTrozaVolume(dto: AddTrozaDto) {
    const diametroPromedio = (dto.diametro1 + dto.diametro2) / 2;
    const radio = diametroPromedio / 2;
    const factorDescuento = 1 - dto.descuento / 100;
    return Math.PI * radio * radio * dto.largo * factorDescuento;
  }
}
