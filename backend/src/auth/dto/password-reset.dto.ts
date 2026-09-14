import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'usuario@exemplo.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123-token' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'novaSenha123' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}

export class ConfirmEmailDto {
  @ApiProperty({ example: 'abc123-token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ResendConfirmationDto {
  @ApiProperty({ example: 'usuario@exemplo.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}