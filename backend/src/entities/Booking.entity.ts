import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { AvailabilitySlot } from "./AvailabilitySlot.entity";
import { User } from "./User.entity";

export enum BookingStatus {
  BOOKED = "booked",
  CANCELLED = "cancelled",
}

@Entity("bookings")
@Unique(["slotId"])
export class Booking {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  slotId: string;

  @ManyToOne(() => AvailabilitySlot, { onDelete: "CASCADE" })
  @JoinColumn({ name: "slotId" })
  slot: AvailabilitySlot;

  @Column()
  bookedBy: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bookedBy" })
  bookedByUser: User;

  @Column({
    type: "varchar",
    default: BookingStatus.BOOKED,
  })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
