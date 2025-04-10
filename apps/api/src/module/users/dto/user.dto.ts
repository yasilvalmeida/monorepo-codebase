import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { PaginationRequestDto } from 'src/shared/dto/pagination.dto';

export class UserBaseDto {
  @ApiProperty({
    description: 'ID',
  })
  @IsString()
  readonly id: string;

  @ApiProperty({
    description: 'First Name',
  })
  @IsString()
  readonly firstName: string;

  @ApiProperty({
    description: 'Last Name',
  })
  @IsString()
  readonly lastName: string;

  @ApiProperty({
    description: 'Email',
  })
  @IsString()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'Password',
  })
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  readonly password?: string;

  @ApiProperty({
    description: 'Refresh Token',
  })
  @IsString()
  readonly refreshToken?: string;

  @ApiProperty({
    description: 'Status',
  })
  @IsBoolean()
  readonly status?: boolean;

  @ApiProperty({
    description: 'Role',
    example: 'Administrator|Manager|Guest',
  })
  @IsEnum(Role)
  readonly role?: string;

  @ApiProperty({
    description: 'Created At',
  })
  @IsDate()
  readonly createdAt: Date;

  @ApiProperty({
    description: 'Updated At',
  })
  @IsDate()
  readonly updatedAt: Date;
}

export class PaginationUserRequestDto extends PaginationRequestDto {
  @ApiPropertyOptional({
    description: 'Filter by first name',
  })
  @IsOptional()
  @IsString()
  readonly firstName: string;

  @ApiPropertyOptional({
    description: 'Filter by last name',
  })
  @IsOptional()
  @IsString()
  readonly lastName: string;

  @ApiPropertyOptional({
    description: 'Filter by email',
  })
  @IsOptional()
  @IsString()
  readonly email: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
  })
  @IsOptional()
  @IsBoolean()
  readonly status: boolean;

  @ApiPropertyOptional({
    description: 'Filter by role',
  })
  @IsOptional()
  @IsEnum(Role)
  readonly role: string;

  @ApiPropertyOptional({
    description: 'Filter by created at min',
  })
  @IsOptional()
  @IsDate()
  readonly createdAtMin: Date;

  @ApiPropertyOptional({
    description: 'Filter by created at max',
  })
  @IsOptional()
  @IsDate()
  readonly createdAtMax: Date;
}

export class RetrieveUserResponseDto extends OmitType(UserBaseDto, [
  'password',
  'refreshToken',
]) {}

export class RetrieveLoggedUserResponseDto extends OmitType(UserBaseDto, [
  'password',
]) {
  @ApiProperty({
    description: 'iat',
  })
  @IsNumber()
  readonly iat: number;

  @ApiProperty({
    description: 'exp',
  })
  @IsNumber()
  readonly exp: number;
}

export class CreateUserDto extends OmitType(UserBaseDto, [
  'role',
  'createdAt',
  'id',
  'password',
  'refreshToken',
  'status',
  'updatedAt',
]) {}

export class UpdateUserDto extends OmitType(UserBaseDto, [
  'createdAt',
  'password',
  'updatedAt',
]) {}
