import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Abstract base entity that provides common fields for all database entities.
 * 
 * All entities should extend this class to get:
 * - `id`: Auto-incrementing primary key
 * - `created_at`: Timestamp when record was created
 * - `updated_at`: Timestamp when record was last updated
 * 
 * @example
 * ```typescript
 * @Entity('users')
 * export class User extends AbstractEntity {
 *   @Column()
 *   name: string;
 * }
 * ```
 */
export abstract class AbstractEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @CreateDateColumn()
  public created_at: Date;

  @UpdateDateColumn()
  public updated_at: Date;
}
