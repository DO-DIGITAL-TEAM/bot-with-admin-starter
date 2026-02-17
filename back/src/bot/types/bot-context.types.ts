import { Context } from 'grammy';
import { User } from '../../users/entities/user.entity';

export interface BotContext extends Context {
  user?: User;
}
