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

@Entity("resource_dependencies")
@Unique(["equipmentId", "dependsOnEquipmentId"])
@Index("IDX_resource_dependencies_equipment_id", ["equipmentId"])
@Index("IDX_resource_dependencies_depends_on_equipment_id", [
  "dependsOnEquipmentId",
])
export class ResourceDependency {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  equipmentId: string;

  @ManyToOne(
    () => Equipment,
    (equipment: Equipment) => equipment.dependencies,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "equipmentId" })
  equipment: Equipment;

  @Column()
  dependsOnEquipmentId: string;

  @ManyToOne(() => Equipment, (equipment: Equipment) => equipment.requiredBy, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "dependsOnEquipmentId" })
  dependsOnEquipment: Equipment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
