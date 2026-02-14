import { Injectable, Logger } from '@nestjs/common';
import { ConsoleService } from 'nestjs-console';
import { AdminsService } from 'src/admins/admins.service';
import { Roles } from 'src/admins/entities/admin.entity';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AdminConsoleService {
  private readonly _logger = new Logger(AdminConsoleService.name);

  constructor(
    private readonly consoleService: ConsoleService,
    private readonly adminsService: AdminsService,
    private readonly authService: AuthService,
  ) {
    const cli = this.consoleService.getCli();

    const bossGroupCommand = this.consoleService.createGroupCommand(
      {
        command: 'admin',
        description: 'A command for admin commands'
      },
      cli
    );

    this.consoleService.createCommand(
      {
        command: 'create <username> <email>',
        description: 'Create super admin by username and email'
      },
      this.createBoss,
      bossGroupCommand
    );
  }

  createBoss = async (username: string, email: string): Promise<void> => {
    const user = await this.adminsService.findOneByEmail(email);
    this._logger.log(`Creating super admin ${username} with email ${email}`);

    if (user) {
      this._logger.error(`User with email ${email} already exists`);
      return;
    }

    try {
      const password = this.generateRandomPassword(8, 8, 4);

      await this.authService.register(
        null,
        {
          username,
          email,
          password,
          role: Roles.SuperAdmin,
        }
      );

      console.log(`╔═══════════════════════════════════════════════════╗`);
      console.log(`║ The SUPER ADMIN credentials:                             ║`);
      console.log(`║ ➲ Login: ${email}${this.setSpaces(41, email.length)}║`);
      console.log(`║ ➲ Password: ${password}${this.setSpaces(38, password.length)}║`);
      console.log(`╚═══════════════════════════════════════════════════╝`);
    } catch (err) {
      this._logger.error(`Something went wrong: ${JSON.stringify(err)}`);
      return;
    }
  };

  // utils
  private setSpaces = (def: number, counts: number) => {
    let spaces = '';
    for (let i = 0; i < def - counts; i++) spaces += ' ';
    return spaces;
  };

  private generateRandomPassword = (letters: number, numbers: number, either: number) => {
    const chars = [
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      "0123456789",
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    ];

    return this.shuffle([letters, numbers, either].map(
      (len, i) => Array(len).fill(chars[i]).map((x: string) => this.randomCharFrom(x)).join('')
    ).concat().join('').split('')).join('')
  }

  private randInt = (thisMax: number) => {
    let umax = Math.pow(2, 32);
    let max = umax - (umax % thisMax);
    let r = new Uint32Array(1);
    do {
      crypto.getRandomValues(r);
    } while (r[0] > max);
    return r[0] % thisMax;
  }

  private randomCharFrom(chars: string) {
    return chars[this.randInt(chars.length)];
  }

  // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
  private shuffle = (arr: string[]) => {
    for (let i = 0, n = arr.length; i < n - 2; i++) {
      let j = this.randInt(n - i);
      [arr[j], arr[i]] = [arr[i], arr[j]];
    }
    return arr;
  }
}
