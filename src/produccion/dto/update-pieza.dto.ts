import { PartialType } from '@nestjs/mapped-types';
import { AddPiezaDto } from './add-pieza.dto';

export class UpdatePiezaDto extends PartialType(AddPiezaDto) {}
