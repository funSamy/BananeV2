import {
  IsDate,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

class ExpenditureDto {
  @IsInt()
  @Min(0)
  amount: number;

  @IsString()
  name: string;
}

export class CreateProductionDto {
  @IsDate()
  @Type(() => Date)
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
