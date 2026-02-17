import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, Keyboard } from 'grammy';
import { ForceReply, InlineKeyboardMarkup, ReplyKeyboardMarkup, ReplyKeyboardRemove } from 'grammy/types';
import { LangsService } from '../localization/services/langs.service';
import { IWords, WordsService } from '../localization/services/words.service';
import { UsersService } from '../users/users.service';
import { BotContext } from './types/bot-context.types';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly bot: Bot;
  private readonly _logger = new Logger(BotService.name);
  private words: IWords = {};

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly langsService: LangsService,
    private readonly wordsService: WordsService,
  ) {
    const telegramBotToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.bot = new Bot(telegramBotToken);
  }

  public async onModuleInit() {
    await this.loadWords();

    this.bot.use(this.checkUserAuth.bind(this));

    this.bot.command('start', this.onStart.bind(this));

    this.bot.start().catch((error) => console.error(':: BOT ERROR:', error));
    this._logger.log('BOT STARTED!');
  }

  private async loadWords(): Promise<void> {
    try {
      this.words = await this.wordsService.findAll();
      const wordbookCount = Object.keys(this.words).length;
      const totalWords = Object.values(this.words).reduce(
        (sum, wordbook) => sum + Object.keys(wordbook).length,
        0,
      );
      this._logger.log(`Loaded ${wordbookCount} wordbooks with ${totalWords} words into memory`);
    } catch (error) {
      this._logger.error(`Failed to load words: ${error.message}`, error.stack);
      this.words = {};
    }
  }

  public async reloadWords(): Promise<void> {
    await this.loadWords();
    this._logger.log('Words cache reloaded');
  }

  private async checkUserAuth(ctx: BotContext, next: () => Promise<void>) {
    if (!ctx.from) {
      return next();
    }

    try {
      const user = await this.usersService.findOrCreate({
        id: ctx.from.id,
        username: ctx.from.username,
        first_name: ctx.from.first_name,
        last_name: ctx.from.last_name,
        language_code: ctx.from.language_code,
      });

      if (!user.is_active) {
        await ctx.reply('❌ Your account has been deactivated. Please contact support.');
        return;
      }

      ctx.user = user;

      return next();
    } catch (error) {
      this._logger.error(`Error in checkUserAuth: ${error.message}`, error.stack);
      return next();
    }
  }

  private async onStart(ctx: BotContext) {
    try {
      const name = ctx.user?.first_name || 'there';
      const langSlug = ctx.from?.language_code || 'en';
      const welcomeText = this.getTranslation('common', 'welcome', langSlug) || `Welcome, ${name}! 👋\n\nThis bot is under development.`;

      const keyboard = new Keyboard()
        .text('Menu')
        .row()
        .resized();

      await ctx.reply(welcomeText, {
        reply_markup: keyboard,
      });
    } catch (error) {
      this._logger.error(error.message, error.stack);
    }
  }

  private getTranslation(
    wordbookName: string,
    mark: string,
    langSlug: string,
    fallbackLang: string = 'en',
  ): string {
    try {
      const translation = this.words[wordbookName]?.[mark]?.[langSlug];
      return translation || this.words[wordbookName]?.[mark]?.[fallbackLang] || '';
    } catch (error) {
      this._logger.error(`Error getting translation: ${error.message}`, error.stack);
      return '';
    }
  }

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
