import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { WordTranslation } from './word-translation.entity';
import { Wordbook } from './wordbook.entity';

@Entity('words')
export class Word extends AbstractEntity {
  @Column({ nullable: true })
  wordbook_id: number;

  @Column({ length: 255, nullable: true })
  @Index()
  mark: string;

  @ManyToOne(() => Wordbook, (wordbook) => wordbook.words, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'wordbook_id', referencedColumnName: 'id' })
  wordbook: Wordbook;

  @OneToMany(() => WordTranslation, (translation) => translation.word, { cascade: true })
  translations: WordTranslation[];
}
