import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database";
import { Equipment } from "../entities/Equipment.entity";
import { Certification } from "../entities/Certification.entity";
import { EquipmentRequirement } from "../entities/EquipmentRequirement.entity";
import { UserCertification } from "../entities/UserCertification.entity";

export class EquipmentService {
  private get equipment(): Repository<Equipment> {
    return AppDataSource.getRepository(Equipment);
  }
  private get certifications(): Repository<Certification> {
    return AppDataSource.getRepository(Certification);
  }
  private get requirements(): Repository<EquipmentRequirement> {
    return AppDataSource.getRepository(EquipmentRequirement);
  }
  private get userCerts(): Repository<UserCertification> {
    return AppDataSource.getRepository(UserCertification);
  }

  async getAllEquipment(): Promise<Equipment[]> {
    return this.equipment.find({
      relations: ["requirements", "requirements.certification"],
      order: { name: "ASC" },
    });
  }

  async createEquipment(name: string, certificationIds: string[] = []): Promise<Equipment> {
    if (!name || !name.trim()) throw new Error("Equipment name is required");

    const existing = await this.equipment.findOne({ where: { name: name.trim() } });
    if (existing) throw new Error("Equipment with this name already exists");

    const saved = await this.equipment.save(this.equipment.create({ name: name.trim() }));

    if (certificationIds.length > 0) {
      await this.requirements.save(
        certificationIds.map((certificationId) =>
          this.requirements.create({ equipmentId: saved.id, certificationId }),
        ),
      );
    }

    return this.equipment.findOneOrFail({
      where: { id: saved.id },
      relations: ["requirements", "requirements.certification"],
    });
  }

  async deleteEquipment(id: string): Promise<void> {
    const item = await this.equipment.findOne({ where: { id } });
    if (!item) throw new Error("Equipment not found");
    await this.equipment.remove(item);
  }

  async getAllCertifications(): Promise<Certification[]> {
    return this.certifications.find({ order: { name: "ASC" } });
  }

  async getUserCertifications(userId: string): Promise<Certification[]> {
    const rows = await this.userCerts.find({ where: { userId }, relations: ["certification"] });
    return rows.map((r) => r.certification);
  }
}

export const equipmentService = new EquipmentService();
