import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export type TSortDirection = 'ascending' | 'descending';

export type TSortByDefault = 'id' | 'createdAt' | 'updatedAt';

export interface IPaginationRequestDto<TSortBy = TSortByDefault> {
  readonly paged: boolean;
  readonly limit?: number;
  readonly offset?: number;
  readonly sortBy?: TSortBy;
  readonly sortDirection?: TSortDirection;
}

export class PaginationRequestDto<TSortBy = TSortByDefault>
  implements IPaginationRequestDto<TSortBy>
{
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Paged or not',
    default: false,
  })
  paged: boolean;

  @IsOptional()
  @IsPositive()
  @ApiPropertyOptional({
    description: 'Limit of items to return',
    default: 10,
  })
  limit: number;

  @IsOptional()
  @IsPositive()
  @ApiPropertyOptional({
    description: 'offset of items to return',
    default: 1,
  })
  offset: number;

  @ApiPropertyOptional({
    type: String,
    default: 'createdAt',
    description: 'Sort by createdAt',
  })
  @IsOptional()
  @IsString()
  readonly sortBy?: TSortBy;

  @ApiPropertyOptional({
    type: String,
    default: 'asc',
    description: 'Sort direction',
  })
  @IsOptional()
  @IsString()
  readonly sortDirection?: TSortDirection;
}

export class PaginationResponseDto<TData> {
  @IsNumber()
  @ApiProperty({
    description: 'Total of items',
  })
  total: number;

  @IsNumber()
  @ApiProperty({
    description: 'Limit of items',
  })
  limit: number;

  @IsNumber()
  @ApiProperty({
    description: 'Offset of items',
  })
  offset: number;

  @ApiProperty({
    description: 'List of items',
  })
  results: TData[];
}

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginationResponseDto) },
          {
            properties: {
              results: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
