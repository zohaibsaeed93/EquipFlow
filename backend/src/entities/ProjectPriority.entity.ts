import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Unique,
  Index,
} from "typeorm";
import { Project } from "./Project.entity";

@Entity("project_priorities")
@Unique(["projectId"])
export class ProjectPriority {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "int", name: "priority_level" })
  priorityLevel: number;

  @Index("IDX_project_priorities_project_id")
  @Column()
  projectId: string;

  @OneToOne(() => Project, (project: Project) => project.priority, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "projectId" })
  project: Project;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
