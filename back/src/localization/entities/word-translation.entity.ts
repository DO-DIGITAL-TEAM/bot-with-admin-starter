import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Lang } from './lang.entity';
import { Word } from './word.entity';

@Entity('word_translations')
export class WordTranslation extends AbstractEntity {
  @Column()
  word_id: number;

  @Column()
  lang_id: number;

  @Column({ type: 'text', nullable: true })
  text: string;

  @ManyToOne(() => Word, (word) => word.translations, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'word_id', referencedColumnName: 'id' })
  word: Word;

  @ManyToOne(() => Lang, (lang) => lang.word_translations, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'lang_id', referencedColumnName: 'id' })
  lang: Lang;
}
