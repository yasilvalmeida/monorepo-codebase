import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { UserBaseDto } from 'src/module/users/dto/user.dto';

export class SignUpDto extends OmitType(UserBaseDto, [
  'role',
  'createdAt',
  'id',
  'refreshToken',
  'status',
  'updatedAt',
]) {}

export class LoginDto extends OmitType(UserBaseDto, [
  'role',
  'createdAt',
  'firstName',
  'id',
  'lastName',
  'refreshToken',
  'status',
  'updatedAt',
]) {}

export class ConfirmSignUpDto extends OmitType(UserBaseDto, [
  'role',
  'createdAt',
  'firstName',
  'id',
  'lastName',
  'password',
  'refreshToken',
  'status',
  'updatedAt',
]) {
  @ApiProperty({
    description: 'Code',
  })
  @IsString()
  readonly code: string;
}

export class RefreshTokenDto extends OmitType(UserBaseDto, [
  'role',
  'createdAt',
  'email',
  'firstName',
  'id',
  'lastName',
  'password',
  'status',
  'updatedAt',
]) {}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Access token',
  })
  @IsString()
  readonly accessToken: string;

  @ApiProperty({
    description: 'Refresh token',
  })
  @IsString()
  readonly refreshToken: string;
}
