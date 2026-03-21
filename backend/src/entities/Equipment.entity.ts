import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { EquipmentRequirement } from "./EquipmentRequirement.entity";
import { ResourceDependency } from "./ResourceDependency.entity";

@Entity("equipment")
export class Equipment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(
    () => EquipmentRequirement,
    (req: EquipmentRequirement) => req.equipment,
  )
  requirements: EquipmentRequirement[];

  @OneToMany(
    () => ResourceDependency,
    (dep: ResourceDependency) => dep.equipment,
  )
  dependencies: ResourceDependency[];

  @OneToMany(
    () => ResourceDependency,
    (dep: ResourceDependency) => dep.dependsOnEquipment,
  )
  requiredBy: ResourceDependency[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
