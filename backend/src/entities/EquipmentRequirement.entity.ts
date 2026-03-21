import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from "typeorm";
import { Equipment } from "./Equipment.entity";
import { Certification } from "./Certification.entity";

@Entity("equipment_requirements")
@Unique(["equipmentId", "certificationId"])
@Index("IDX_equipment_requirements_equipment_id", ["equipmentId"])
@Index("IDX_equipment_requirements_certification_id", ["certificationId"])
export class EquipmentRequirement {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  equipmentId: string;

  @ManyToOne(
    () => Equipment,
    (equipment: Equipment) => equipment.requirements,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "equipmentId" })
  equipment: Equipment;

  @Column()
  certificationId: string;

  @ManyToOne(
    () => Certification,
    (cert: Certification) => cert.equipmentRequirements,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "certificationId" })
  certification: Certification;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
