import { PartialType } from '@nestjs/mapped-types';
import { AddTrozaDto } from './add-troza.dto';

export class UpdateTrozaDto extends PartialType(AddTrozaDto) {}
