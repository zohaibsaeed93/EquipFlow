import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./User.entity";
import { Equipment } from "./Equipment.entity";
import { Booking } from "./Booking.entity";

@Entity("availability_slots")
export class AvailabilitySlot {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  equipmentId?: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Equipment, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "equipmentId" })
  equipment?: Equipment;

  @Column({ type: "timestamp" })
  startTime: Date;

  @Column({ type: "timestamp" })
  endTime: Date;

  @Column({ default: false })
  isBooked: boolean;

  @OneToMany(() => Booking, (booking: Booking) => booking.slot)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
