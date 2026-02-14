import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Password } from './entities/password.entity';
import { PaginatedResource, IPagination } from 'src/common/decorators/pagination-params.decorator';
import { ISorting } from 'src/common/decorators/sorting-params.decorator';
import { IFiltering } from 'src/common/decorators/filtering-params.decorator';
import { ErrorCode } from 'src/common/enums/error-code.enum';
import { DbTransactionFactory, deleteWithTransactions, saveWithTransactions } from 'src/database/transaction-factory';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminsService {
  private readonly _logger = new Logger(AdminsService.name);

  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @InjectRepository(Password) private passwordRepository: Repository<Password>,
    private transactionRunner: DbTransactionFactory,
  ) { }

  async create(
    admin: Admin | null,
    {
      username,
      email,
      role,
      password,
    }: CreateAdminDto
  ): Promise<Admin> {
    const transactionalRunner = await this.transactionRunner.createTransaction();

    try {
      await transactionalRunner.startTransaction();

      const existingAdmin = await this.findOneByEmail(email);

      if (existingAdmin) {
        throw new ConflictException(ErrorCode.AdminAlreadyExists);
      }

      const newPassword = this.passwordRepository.create({ value: password });

      const newAdmin = await saveWithTransactions.call(
        this.adminRepository,
        {
          username,
          email,
          role,
          password: newPassword,
        },
        transactionalRunner.transactionManager,
      );

      delete newAdmin.password;

      await transactionalRunner.commitTransaction();
      return newAdmin;
    } catch (error) {
      await transactionalRunner.rollbackTransaction();
      this._logger.error(error.message, error.stack);
      throw error;
    } finally {
      await transactionalRunner.releaseTransaction();
    }
  }

  async findChunk(
    { limit, offset }: IPagination,
    sorting?: ISorting,
    filtering?: IFiltering,
  ): Promise<PaginatedResource<Admin>> {
    const [items, totalCount] = await this.adminRepository.findAndCount({
      take: limit,
      skip: offset,
      order: sorting,
      where: filtering,
    });

    return { totalCount, items };
  }

  async findOne(id: number): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { id: id ? id : IsNull() },
    });

    if (!admin) {
      throw new NotFoundException(ErrorCode.AdminNotFound);
    }

    return admin;
  }

  async findOneByEmail(email: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { email } });
    return admin;
  }

  async findOneByEmailWithPassword(email: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { email }, relations: ['password'] });

    if (!admin) {
      throw new NotFoundException(ErrorCode.AdminWithEmailNotFound)
    }

    return admin;
  }

  async update(
    admin: Partial<Admin>,
    id: number,
    {
      email,
      username,
      role,
      password,
      is_active,
    }: UpdateAdminDto
  ) {
    const transactionalRunner = await this.transactionRunner.createTransaction();

    try {
      await transactionalRunner.startTransaction();

      const existingAdmin = await this.adminRepository.findOne({
        where: { id },
        relations: ['password'],
      });

      if (!existingAdmin) {
        throw new NotFoundException();
      }

      if (password) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        existingAdmin.password.value = hashedPassword;
      }

      existingAdmin.email = email;
      existingAdmin.username = username;
      existingAdmin.is_active = is_active;
      existingAdmin.role = role;

      const newAdmin = await saveWithTransactions.call(
        this.adminRepository,
        existingAdmin,
        transactionalRunner.transactionManager,
      );

      delete newAdmin.password;

      await transactionalRunner.commitTransaction();
      return newAdmin;
    } catch (error) {
      await transactionalRunner.rollbackTransaction();
      this._logger.error(error.message, error.stack);
      throw error;
    } finally {
      await transactionalRunner.releaseTransaction();
    }
  }

  async remove(admin: Admin, id: number) {
    const transactionalRunner = await this.transactionRunner.createTransaction();

    try {
      await transactionalRunner.startTransaction();

      const deleteResult = await deleteWithTransactions.call(
        this.adminRepository,
        id,
        transactionalRunner.transactionManager,
      );

      await transactionalRunner.commitTransaction();
      return deleteResult;
    } catch (error) {
      await transactionalRunner.rollbackTransaction();
      this._logger.error(error.message, error.stack);
      throw error;
    } finally {
      await transactionalRunner.releaseTransaction();
    }
  }
}
