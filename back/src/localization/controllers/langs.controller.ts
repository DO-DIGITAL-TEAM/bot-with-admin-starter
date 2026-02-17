import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LangsService } from '../services/langs.service';
import { CreateLangDto } from '../dto/create-lang.dto';
import { UpdateLangDto } from '../dto/update-lang.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { IPagination, PaginationParams } from 'src/common/decorators/pagination-params.decorator';
import { ISorting, SortingParams } from 'src/common/decorators/sorting-params.decorator';
import { FilteringParams, IFiltering } from 'src/common/decorators/filtering-params.decorator';

@Controller('admin/langs')
@UseGuards(AuthGuard)
export class LangsController {
  constructor(private readonly langsService: LangsService) {}

  @Get('all')
  findAll() {
    return this.langsService.findAll();
  }

  @Get('chunk')
  findChunk(
    @PaginationParams() paginationParams: IPagination,
    @SortingParams(['id', 'slug', 'title', 'active', 'created_at', 'updated_at']) sorting: ISorting,
    @FilteringParams(['slug', 'title', 'active']) filtering: IFiltering,
  ) {
    return this.langsService.findChunk(paginationParams, sorting, filtering);
  }

  @Get('one/:id')
  findOne(@Param('id') id: string) {
    return this.langsService.findOne(+id);
  }

  @Post('create')
  create(@Body() createLangDto: CreateLangDto) {
    return this.langsService.create(createLangDto);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateLangDto: UpdateLangDto) {
    return this.langsService.update(+id, updateLangDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.langsService.remove(+id);
  }

  @Post('delete-bulk')
  removeBulk(@Body() body: { ids: number[] }) {
    return this.langsService.removeBulk(body.ids);
  }
}
