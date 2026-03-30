import { Repository, LessThan, MoreThan } from "typeorm";
import { AppDataSource } from "../../config/database";
import { AvailabilitySlot } from "../entities/AvailabilitySlot.entity";

export class SlotService {
  private slotRepository: Repository<AvailabilitySlot>;

  constructor() {
    this.slotRepository = AppDataSource.getRepository(AvailabilitySlot);
  }

  /**
   * Create a new availability slot with overlap detection
   */
  async createSlot(data: {
    userId: string;
    startTime: Date;
    endTime: Date;
    equipmentId?: string;
  }): Promise<AvailabilitySlot> {
    const { userId, startTime, endTime, equipmentId } = data;

    // Validate startTime is before endTime
    if (startTime >= endTime) {
      throw new Error("startTime must be before endTime");
    }

    // Validate slot is in the future
    if (startTime <= new Date()) {
      throw new Error("Slot must be in the future");
    }

    // Overlap detection: (startTime < existingEndTime) AND (endTime > existingStartTime)
    const overlapping = await this.slotRepository
      .createQueryBuilder("slot")
      .where("slot.userId = :userId", { userId })
      .andWhere("slot.startTime < :endTime", { endTime })
      .andWhere("slot.endTime > :startTime", { startTime })
      .getOne();

    if (overlapping) {
      throw new Error("This slot overlaps with an existing availability slot");
    }

    const slot = this.slotRepository.create({
      startTime,
      endTime,
      equipmentId: equipmentId || undefined,
      userId,
    });

    const savedSlot = await this.slotRepository.save(slot);
    console.log("SAVED SLOT USER:", savedSlot.userId);

    return savedSlot;
  }

  /**
   * Get all available (unbooked, future) slots
   */
  async getAvailableSlots(): Promise<AvailabilitySlot[]> {
    return await this.slotRepository.find({
      where: {
        isBooked: false,
        startTime: MoreThan(new Date()),
      },
      relations: ["user", "equipment"],
      order: { startTime: "ASC" },
    });
  }

  /**
   * Get all slots (optionally filter by userId)
   */
  async getAllSlots(userId?: string): Promise<AvailabilitySlot[]> {
    const where: Record<string, unknown> = {};
    if (userId) {
      where.userId = userId;
    }

    return await this.slotRepository.find({
      where,
      relations: ["user", "equipment", "bookings", "bookings.bookedByUser"],
      order: { startTime: "ASC" },
    });
  }

  /**
   * Get a single slot by ID
   */
  async getSlotById(id: string): Promise<AvailabilitySlot | null> {
    return await this.slotRepository.findOne({
      where: { id },
      relations: ["user", "equipment"],
    });
  }

  /**
   * Delete a slot by ID
   */
  async deleteSlot(id: string): Promise<void> {
    await this.slotRepository.delete(id);
  }
}

export const slotService = new SlotService();
