import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductionDto } from './create-production.dto';
import { ExpenditureDto } from './expenditure.dto';

export class UpdateExpenditureDto extends ExpenditureDto {
  @IsOptional()
  id?: number;
}

export class UpdateProductionDto extends CreateProductionDto {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateExpenditureDto)
  declare expenditures?: UpdateExpenditureDto[];
}
