import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Estado } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddPiezaDto } from './dto/add-pieza.dto';
import { CreateEntradaDto } from './dto/create-entrada.dto';

@Injectable()
export class ProduccionService {
  constructor(private readonly prisma: PrismaService) {}

  async createEntrada(dto: CreateEntradaDto) {
    let aserradero = '';
    if (dto.turno === 'Matutino') aserradero = 'Aserradero 1';
    else if (dto.turno === 'Vespertino') aserradero = 'Aserradero 2';
    else if (dto.turno === 'Nocturno') aserradero = 'Aserradero 3';

    return this.prisma.entradaProduccion.create({
      data: {
        fecha: new Date(dto.fecha),
        turno: dto.turno,
        aserradero,
      },
      include: { piezas: true },
    });
  }

  async findAllFinalizadas() {
    return this.prisma.entradaProduccion.findMany({
      where: { estado: Estado.FINALIZADO },
      include: { piezas: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const entrada = await this.prisma.entradaProduccion.findUnique({
      where: { id },
      include: { piezas: true },
    });
    if (!entrada) {
      throw new NotFoundException('Entrada de produccion no encontrada');
    }
    return entrada;
  }

  async addPieza(entradaId: number, dto: AddPiezaDto) {
    await this.ensureBorradorEntrada(entradaId);
    const piesTabla = this.calculatePiesTabla(dto);
    const volumen = this.calculateVolumen(dto);

    await this.prisma.piezaProduccion.create({
      data: {
        entradaId,
        grueso: dto.grueso,
        clase: dto.clase,
        ancho: dto.ancho,
        largo: dto.largo,
        verde: dto.verde,
        estufa: dto.estufa,
        piesTabla,
        volumen,
      },
    });

    return this.recalculatePiezasTotals(entradaId);
  }

  async removePieza(entradaId: number, piezaId: number) {
    await this.ensureBorradorEntrada(entradaId);

    const pieza = await this.prisma.piezaProduccion.findUnique({
      where: { id: piezaId },
    });
    if (!pieza || pieza.entradaId !== entradaId) {
      throw new NotFoundException('Pieza no encontrada en la entrada');
    }

    await this.prisma.piezaProduccion.delete({ where: { id: piezaId } });
    return this.recalculatePiezasTotals(entradaId);
  }

  async finalizar(entradaId: number) {
    const entrada = await this.prisma.entradaProduccion.findUnique({
      where: { id: entradaId },
      include: { piezas: true },
    });
    if (!entrada) {
      throw new NotFoundException('Entrada de produccion no encontrada');
    }
    if (entrada.estado !== Estado.BORRADOR) {
      throw new BadRequestException(
        'Solo se puede finalizar una entrada en estado BORRADOR',
      );
    }
    if (entrada.piezas.length === 0) {
      throw new BadRequestException(
        'No se puede finalizar una entrada sin piezas',
      );
    }

    return this.prisma.entradaProduccion.update({
      where: { id: entradaId },
      data: { estado: Estado.FINALIZADO },
      include: { piezas: true },
    });
  }

  private async ensureBorradorEntrada(entradaId: number) {
    const entrada = await this.prisma.entradaProduccion.findUnique({
      where: { id: entradaId },
    });
    if (!entrada) {
      throw new NotFoundException('Entrada de produccion no encontrada');
    }
    if (entrada.estado !== Estado.BORRADOR) {
      throw new BadRequestException(
        'Solo se permiten cambios en entradas BORRADOR',
      );
    }
    return entrada;
  }

  private async recalculatePiezasTotals(entradaId: number) {
    const piezas = await this.prisma.piezaProduccion.findMany({
      where: { entradaId },
    });
    const totalPiezas = piezas.length;
    const totalPiesTabla = piezas.reduce((acc, pieza) => acc + pieza.piesTabla, 0);
    const volumenTotal = piezas.reduce((acc, pieza) => acc + pieza.volumen, 0);

    return this.prisma.entradaProduccion.update({
      where: { id: entradaId },
      data: { totalPiezas, totalPiesTabla, volumenTotal },
      include: { piezas: true },
    });
  }

  private calculatePiesTabla(dto: AddPiezaDto) {
    return (dto.grueso * dto.ancho * dto.largo) / 12;
  }

  private calculateVolumen(dto: AddPiezaDto) {
    return dto.grueso * dto.ancho * dto.largo * (dto.verde + dto.estufa);
  }
}
