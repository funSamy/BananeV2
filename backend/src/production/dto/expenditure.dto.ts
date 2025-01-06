import { IsString, IsInt, Min } from 'class-validator';

export class ExpenditureDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  amount: number;
}
