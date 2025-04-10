import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MessageDto {
  @ApiProperty({
    description: 'Message',
  })
  @IsString()
  readonly message: string;
}
