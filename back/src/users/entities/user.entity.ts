import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('users')
@Index(['telegram_id'], { unique: true })
export class User extends AbstractEntity {
  @Column({ type: 'bigint', unique: true })
  telegram_id: string;

  @Column({ length: 255, nullable: true, default: null })
  username: string;

  @Column({ length: 255 })
  first_name: string;

  @Column({ length: 255, nullable: true, default: null })
  last_name: string;

  @Column({ length: 10, nullable: true, default: null })
  language_code: string;

  @Column({ default: true })
  is_active: boolean;
}
