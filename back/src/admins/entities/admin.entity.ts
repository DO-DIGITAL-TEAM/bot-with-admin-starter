import { AbstractEntity } from "src/common/entities/abstract.entity";
import { Column, Entity, OneToOne } from "typeorm";
import { Password } from "./password.entity";

export enum Roles {
  SuperAdmin = 'superadmin',
  Admin = 'admin',
};

@Entity('admins')
export class Admin extends AbstractEntity {
  @Column({ length: 255 })
  username: string;

  @Column({ length: 255 })
  email: string;

  @Column({ nullable: true, default: null })
  image: string;

  @OneToOne(() => Password, (password) => password.admin, { cascade: true })
  password: Password;

  @Column({ default: true })
  is_active: boolean;

  @Column({
    type: 'enum',
    enum: Roles,
    nullable: false,
    default: Roles.Admin,
  })
  role: Roles;
}
