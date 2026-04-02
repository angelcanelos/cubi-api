import { IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  username: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  nombres: string;

  @IsString()
  apellidos: string;

  @IsEnum(Role, { message: 'El rol debe ser ADMIN o JEFATURA' })
  role: Role;
}
