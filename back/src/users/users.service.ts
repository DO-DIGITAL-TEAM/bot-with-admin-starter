import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly _logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOrCreate(telegramUser: {
    id: number;
    username?: string;
    first_name: string;
    last_name?: string;
    language_code?: string;
  }): Promise<User> {
    const telegramId = telegramUser.id.toString();
    
    let user = await this.userRepository.findOne({
      where: { telegram_id: telegramId },
    });

    if (user) {
      user.username = telegramUser.username || null;
      user.first_name = telegramUser.first_name;
      user.last_name = telegramUser.last_name || null;
      user.language_code = telegramUser.language_code || null;
      
      user = await this.userRepository.save(user);
      this._logger.debug(`Updated user: ${telegramId}`);
    } else {
      user = this.userRepository.create({
        telegram_id: telegramId,
        username: telegramUser.username || null,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name || null,
        language_code: telegramUser.language_code || null,
        is_active: true,
      });

      user = await this.userRepository.save(user);
      this._logger.log(`Created new user: ${telegramId} (${telegramUser.first_name})`);
    }

    return user;
  }

  async findByTelegramId(telegramId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { telegram_id: telegramId },
    });
  }

  async findOneByTelegramId(telegramId: string): Promise<User> {
    const user = await this.findByTelegramId(telegramId);
    
    if (!user) {
      throw new Error(`User with telegram_id ${telegramId} not found`);
    }

    return user;
  }

  async isUserActive(telegramId: string): Promise<boolean> {
    const user = await this.findByTelegramId(telegramId);
    return user ? user.is_active : false;
  }

  async updateActiveStatus(telegramId: string, isActive: boolean): Promise<User> {
    const user = await this.findOneByTelegramId(telegramId);
    user.is_active = isActive;
    return this.userRepository.save(user);
  }
}
