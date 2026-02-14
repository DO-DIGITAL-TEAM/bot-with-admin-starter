import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, Context, Keyboard } from 'grammy';
import { ForceReply, InlineKeyboardMarkup, ReplyKeyboardMarkup, ReplyKeyboardRemove } from 'grammy/types';

@Injectable()
export class BotService {
  private readonly bot: Bot;
  private readonly _logger = new Logger(BotService.name);

  constructor(
    private readonly configService: ConfigService,
  ) {
    const telegramBotToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.bot = new Bot(telegramBotToken);
  }

  public onModuleInit() {
    this.bot.command('start', this.onStart.bind(this));

    this.bot.start().catch((error) => console.error(':: BOT ERROR:', error));
    this._logger.log('BOT STARTED!');
  }

  private async onStart(ctx: Context) {
    try {
      const keyboard = new Keyboard()
        .text('Menu')
        .row()
        .resized();

      await ctx.reply('Welcome! This bot is under development.', {
        reply_markup: keyboard,
      });
    } catch (error) {
      this._logger.error(error.message, error.stack);
    }
  }

  /**
   * Send a message to a specific Telegram user.
   */
  public async sendMessage(
    telegramId: string,
    message: string,
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply,
  ) {
    try {
      await this.bot.api.sendMessage(telegramId, message, {
        parse_mode: 'Markdown',
        reply_markup,
        link_preview_options: { is_disabled: true },
      });
    } catch (error) {
      this._logger.error(`Failed to send message to ${telegramId}:`, error);
    }
  }
}
