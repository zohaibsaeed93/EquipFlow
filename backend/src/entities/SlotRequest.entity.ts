import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User.entity";
import { Equipment } from "./Equipment.entity";

export enum SlotRequestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

@Entity("slot_requests")
export class SlotRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  requestedBy: string;

  @Column({ nullable: true })
  equipmentId?: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "requestedBy" })
  requestedByUser: User;

  @ManyToOne(() => Equipment, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "equipmentId" })
  equipment?: Equipment;

  @Column({ type: "timestamp" })
  startTime: Date;

  @Column({ type: "timestamp" })
  endTime: Date;

  @Column({
    type: "varchar",
    default: SlotRequestStatus.PENDING,
  })
  status: SlotRequestStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
