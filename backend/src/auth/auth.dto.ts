import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class LoginDto { @IsEmail() email!: string; @IsString() @MinLength(8) password!: string; }
export class ForgotPasswordDto { @IsEmail() email!: string; }
export class ResetPasswordDto { @IsString() token!: string; @IsString() @Length(12, 128) password!: string; }
export class ChangePasswordDto { @IsString() currentPassword!: string; @IsString() @Length(12, 128) newPassword!: string; }
