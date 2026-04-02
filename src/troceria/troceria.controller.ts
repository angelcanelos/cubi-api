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
import { AddTrozaDto } from './dto/add-troza.dto';
import { CreateEntradaDto } from './dto/create-entrada.dto';
import { TroceriaService } from './troceria.service';

@Controller('troceria')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TroceriaController {
  constructor(private readonly troceriaService: TroceriaService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateEntradaDto) {
    return this.troceriaService.createEntrada(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.JEFATURA)
  findAll() {
    return this.troceriaService.findAllFinalizadas();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.JEFATURA)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.troceriaService.findOne(id);
  }

  @Post(':id/trozas')
  @Roles(Role.ADMIN)
  addTroza(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddTrozaDto,
  ) {
    return this.troceriaService.addTroza(id, dto);
  }

  @Delete(':id/trozas/:trozaId')
  @Roles(Role.ADMIN)
  removeTroza(
    @Param('id', ParseIntPipe) id: number,
    @Param('trozaId', ParseIntPipe) trozaId: number,
  ) {
    return this.troceriaService.removeTroza(id, trozaId);
  }

  @Patch(':id/finalizar')
  @Roles(Role.ADMIN)
  finalizar(@Param('id', ParseIntPipe) id: number) {
    return this.troceriaService.finalizar(id);
  }
}
