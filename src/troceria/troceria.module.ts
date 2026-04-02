import { Module } from '@nestjs/common';
import { TroceriaController } from './troceria.controller';
import { TroceriaService } from './troceria.service';

@Module({
  controllers: [TroceriaController],
  providers: [TroceriaService],
})
export class TroceriaModule {}
