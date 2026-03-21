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
import { User } from "./User.entity";
import { Certification } from "./Certification.entity";

@Entity("user_certifications")
@Unique(["userId", "certificationId"])
@Index("IDX_user_certifications_user_id", ["userId"])
@Index("IDX_user_certifications_certification_id", ["certificationId"])
export class UserCertification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user: User) => user.userCertifications, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  certificationId: string;

  @ManyToOne(
    () => Certification,
    (cert: Certification) => cert.userCertifications,
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
