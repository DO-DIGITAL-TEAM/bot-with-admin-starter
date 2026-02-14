import { AbstractEntity } from "src/common/entities/abstract.entity";
import { Column, Entity, OneToOne, JoinColumn } from "typeorm";
import { Admin } from "./admin.entity";

@Entity('passwords')
export class Password extends AbstractEntity {
  @Column({ length: 255 })
  value: string;

  @Column({ unique: true })
  admin_id: number;

  @OneToOne(
    () => Admin,
    (admin) => admin.password,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'admin_id', referencedColumnName: 'id' })
  admin: Admin;
}
