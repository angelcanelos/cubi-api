import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'El nombre de usuario debe ser texto' })
  username: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
