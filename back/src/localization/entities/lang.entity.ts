import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { WordTranslation } from './word-translation.entity';

export enum DateFormat {
  En = 'en',
  Ru = 'ru',
}

@Entity('langs')
export class Lang extends AbstractEntity {
  @Column({ length: 10, nullable: true })
  @Index()
  slug: string;

  @Column({ length: 255, nullable: true })
  title: string;

  @Column({ default: true })
  active: boolean;

  @Column({ length: 3, default: 'ltr' })
  dir: string;

  @Column({
    type: 'enum',
    enum: DateFormat,
    default: DateFormat.En,
  })
  dateformat: DateFormat;

  @Column({ default: false })
  defended: boolean;

  @OneToMany(() => WordTranslation, (translation) => translation.lang, { cascade: true })
  word_translations: WordTranslation[];
}
