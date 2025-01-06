import { IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'Token must be a string' })
  token: string;

  @IsString({ message: 'New password must be a string' })
  @Length(6, 20, { message: 'New password must be between 6 and 20 characters' })
  newPassword: string;
}
