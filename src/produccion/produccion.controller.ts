import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AddPiezaDto } from './dto/add-pieza.dto';
import { CreateEntradaDto } from './dto/create-entrada.dto';
import { ProduccionService } from './produccion.service';

@Controller('produccion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProduccionController {
  constructor(private readonly produccionService: ProduccionService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateEntradaDto) {
    return this.produccionService.createEntrada(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.JEFATURA)
  findAll() {
    return this.produccionService.findAllFinalizadas();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.JEFATURA)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.produccionService.findOne(id);
  }

  @Get(':id/summary')
  @Roles(Role.ADMIN, Role.JEFATURA)
  getSummary(@Param('id', ParseIntPipe) id: number) {
    return this.produccionService.getSummary(id);
  }

  @Post(':id/piezas')
  @Roles(Role.ADMIN)
  addPieza(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddPiezaDto,
  ) {
    return this.produccionService.addPieza(id, dto);
  }

  @Delete(':id/piezas/:piezaId')
  @Roles(Role.ADMIN)
  removePieza(
    @Param('id', ParseIntPipe) id: number,
    @Param('piezaId', ParseIntPipe) piezaId: number,
  ) {
    return this.produccionService.removePieza(id, piezaId);
  }

  @Patch(':id/piezas/:piezaId')
  @Roles(Role.ADMIN)
  updatePieza(
    @Param('id', ParseIntPipe) id: number,
    @Param('piezaId', ParseIntPipe) piezaId: number,
    @Body() dto: import('./dto/update-pieza.dto').UpdatePiezaDto,
  ) {
    return this.produccionService.updatePieza(id, piezaId, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  removeEntrada(@Param('id', ParseIntPipe) id: number) {
    return this.produccionService.removeEntrada(id);
  }

  @Patch(':id/finalizar')
  @Roles(Role.ADMIN)
  finalizar(@Param('id', ParseIntPipe) id: number) {
    return this.produccionService.finalizar(id);
  }
}
