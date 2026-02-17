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
import { WordbooksService } from '../services/wordbooks.service';
import { CreateWordbookDto } from '../dto/create-wordbook.dto';
import { UpdateWordbookDto } from '../dto/update-wordbook.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { IPagination, PaginationParams } from 'src/common/decorators/pagination-params.decorator';
import { ISorting, SortingParams } from 'src/common/decorators/sorting-params.decorator';
import { FilteringParams, IFiltering } from 'src/common/decorators/filtering-params.decorator';

@Controller('admin/wordbooks')
@UseGuards(AuthGuard)
export class WordbooksController {
  constructor(private readonly wordbooksService: WordbooksService) {}

  @Get('chunk')
  findChunk(
    @PaginationParams() paginationParams: IPagination,
    @SortingParams(['id', 'name', 'load_to', 'created_at', 'updated_at']) sorting: ISorting,
    @FilteringParams(['name', 'load_to']) filtering: IFiltering,
  ) {
    return this.wordbooksService.findChunk(paginationParams, sorting, filtering);
  }

  @Get('one/:id')
  findOne(@Param('id') id: string) {
    return this.wordbooksService.findOne(+id);
  }

  @Post('create')
  create(@Body() createWordbookDto: CreateWordbookDto) {
    return this.wordbooksService.create(createWordbookDto);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateWordbookDto: UpdateWordbookDto) {
    return this.wordbooksService.update(+id, updateWordbookDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.wordbooksService.remove(+id);
  }

  @Post('delete-bulk')
  removeBulk(@Body() body: { ids: number[] }) {
    return this.wordbooksService.removeBulk(body.ids);
  }
}
