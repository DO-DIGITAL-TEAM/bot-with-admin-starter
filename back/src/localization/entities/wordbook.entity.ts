import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Word } from './word.entity';

export enum LoadTo {
  All = 'all',
  Bot = 'bot',
}

@Entity('wordbooks')
export class Wordbook extends AbstractEntity {
  @Column({ length: 255, nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: LoadTo,
    default: LoadTo.All,
  })
  @Index()
  load_to: LoadTo;

  @Column({ default: false })
  defended: boolean;

  @OneToMany(() => Word, (word) => word.wordbook, { cascade: true })
  words: Word[];
}
