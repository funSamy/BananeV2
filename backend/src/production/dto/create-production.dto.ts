import {
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
  IsString,
  IsNotEmpty,
  MaxDate,
  MinDate,
  IsDate,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class ExpenditureDto {
  @IsInt()
  @Min(0)
  amount: number;

  @IsString()
  name: string;
}

export class CreateProductionDto {
  @IsNotEmpty()
  @Type(() => Date) // Convert input string to JS Date object
  @IsDate()
  @MinDate(new Date('2016-01-01')) // Example minimum date
  @MaxDate(new Date()) // Cannot be in the future
  @Transform(({ value }) => {
    if (!(value instanceof Date)) return value;
    // Normalize to Midnight UTC (or your preferred timezone)
    return new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
    );
  })
  date: Date;

  @IsInt()
  @Min(0)
  @IsOptional()
  purchased: number = 0;

  @IsInt()
  @Min(0)
  @IsOptional()
  produced: number = 0;

  @IsInt()
  @Min(0)
  @IsOptional()
  sales: number = 0;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExpenditureDto)
  expenditures?: ExpenditureDto[];
}
