import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductionService } from './production.service';
import { CreateProductionDto } from './dto/create-production.dto';
import { ProductionQueryDto } from './dto/production-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('production')
@UseGuards(JwtAuthGuard)
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post('data')
  create(@Body() createProductionDto: CreateProductionDto) {
    return this.productionService.create(createProductionDto);
  }

  @Get('data')
  findAll(@Query() query: ProductionQueryDto) {
    return this.productionService.findAll(query);
  }

  @Get('data/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productionService.findOne(id);
  }

  @Put('data/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductionDto: CreateProductionDto,
  ) {
    return this.productionService.update(id, updateProductionDto);
  }

  @Delete('data/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productionService.remove(id);
  }
}
