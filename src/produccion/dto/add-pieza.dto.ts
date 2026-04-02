import { IsInt, IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class AddPiezaDto {
  @IsNumber()
  @IsPositive()
  grueso: number;

  @IsInt()
  @IsNotEmpty()
  clase: number;

  @IsNumber()
  @IsPositive()
  ancho: number;

  @IsNumber()
  @IsPositive()
  largo: number;

  @IsInt()
  @Min(0)
  verde: number;

  @IsInt()
  @Min(0)
  estufa: number;
}
