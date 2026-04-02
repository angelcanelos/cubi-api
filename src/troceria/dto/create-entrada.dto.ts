import { IsDateString, IsIn, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateEntradaDto {
  @IsDateString()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Matutino', 'Vespertino', 'Nocturno'], { message: 'turno debe ser Matutino, Vespertino o Nocturno' })
  turno: string;

  @IsString()
  @IsNotEmpty()
  origen: string;

  @IsInt()
  @IsNotEmpty()
  clase: number;
}
