import { IsNumber, IsPositive, Min, Max } from 'class-validator';

export class AddTrozaDto {
  @IsNumber()
  @IsPositive()
  diametro1: number;

  @IsNumber()
  @IsPositive()
  diametro2: number;

  @IsNumber()
  @IsPositive()
  largo: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  descuento: number;
}
