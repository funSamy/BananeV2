import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortByField {
  DATE = 'date',
  PURCHASED = 'purchased',
  PRODUCED = 'produced',
  STOCK = 'stock',
  SALES = 'sales',
  REMAINS = 'remains',
}

export class ProductionQueryDto {
  @IsOptional()
  @Transform(dateTransform)
  startDate?: Date;

  @IsOptional()
  @Transform(dateTransform)
  endDate?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(500)
  pageSize?: number = 20;

  @IsOptional()
  @IsEnum(SortByField, {
    message: `sortBy must be one of: ${Object.values(SortByField).join(', ')}`,
  })
  sortBy?: SortByField;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsInt()
  @Min(0)
  produced?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  remains?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sales?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  purchased?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}
function dateTransform({ value }: { value: string }) {
  if (!value) return undefined;
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
}
