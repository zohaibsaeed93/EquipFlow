import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { UserCertification } from "./UserCertification.entity";
import { EquipmentRequirement } from "./EquipmentRequirement.entity";

@Entity("certifications")
export class Certification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(
    () => UserCertification,
    (uc: UserCertification) => uc.certification,
  )
  userCertifications: UserCertification[];

  @OneToMany(
    () => EquipmentRequirement,
    (req: EquipmentRequirement) => req.certification,
  )
  equipmentRequirements: EquipmentRequirement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
