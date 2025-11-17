import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FlagsService } from './flags.service';
import { CreateFlagDto } from './dto/create-flag.dto';
import { UpdateFlagDto } from './dto/update-flag.dto';
import { SeedFlagsDto } from './dto/seed-flags.dto';

@Controller('flags')
export class FlagsController {
  constructor(private readonly flagsService: FlagsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body(ValidationPipe) createFlagDto: CreateFlagDto) {
    return this.flagsService.create(createFlagDto);
  }

  @Get('stale')
  findStaleFlags(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.flagsService.findStaleFlags(days);
  }

  @Get('stats')
  getStats() {
    return this.flagsService.getStats();
  }

  @Post('seed')
  async seedDemoData(@Body() seedDto: SeedFlagsDto) {
    return this.flagsService.seedDemoData(seedDto.flags);
  }

  @Delete('seed')
  @HttpCode(HttpStatus.OK)
  clearDemoData() {
    return this.flagsService.clearDemoData();
  }

  @Get()
  findAll() {
    return this.flagsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.flagsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateFlagDto: UpdateFlagDto,
  ) {
    return this.flagsService.update(id, updateFlagDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.flagsService.remove(id);
  }
}
