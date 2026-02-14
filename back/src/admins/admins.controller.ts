import { Controller, Get, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentAdmin } from 'src/common/decorators/current-admin.decorator';
import { IPagination, PaginationParams } from 'src/common/decorators/pagination-params.decorator';
import { ISorting, SortingParams } from 'src/common/decorators/sorting-params.decorator';
import { FilteringParams, IFiltering } from 'src/common/decorators/filtering-params.decorator';
import { Admin } from './entities/admin.entity';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @UseGuards(AuthGuard)
  @Get()
  findChunk(
    @PaginationParams() paginationParams: IPagination,
    @SortingParams(['id', 'created_at', 'updated_at']) sorting: ISorting,
    @FilteringParams(['username', 'role']) filtering: IFiltering,
  ) {
    return this.adminsService.findChunk(paginationParams, sorting, filtering);
  }

  @UseGuards(AuthGuard)
  @Get('one/:id')
  findOne(@Param('id') id: number) {
    return this.adminsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Get('one/:email')
  findOneByEmail(@Param('email') email: string) {
    return this.adminsService.findOneByEmail(email);
  }

  @UseGuards(AuthGuard)
  @Patch('update/:id')
  update(
    @CurrentAdmin() user: Partial<Admin>,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateAdminDto,
  ) {
    return this.adminsService.update(user, +id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(
    @CurrentAdmin() user: Admin,
    @Param('id') id: string,
  ) {
    return this.adminsService.remove(user, +id);
  }
}
