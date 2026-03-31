import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database";
import { SlotRequest, SlotRequestStatus } from "../entities/SlotRequest.entity";
import { AvailabilitySlot } from "../entities/AvailabilitySlot.entity";
import { slotService } from "./slot.service";

export class SlotRequestService {
  private requestRepository: Repository<SlotRequest>;
  private slotRepository: Repository<AvailabilitySlot>;

  constructor() {
    this.requestRepository = AppDataSource.getRepository(SlotRequest);
    this.slotRepository = AppDataSource.getRepository(AvailabilitySlot);
  }

  /**
   * Create a new slot request (user flow)
   */
  async createSlotRequest(data: {
    requestedBy: string;
    startTime: Date;
    endTime: Date;
    equipmentId?: string;
  }): Promise<SlotRequest> {
    const { requestedBy, startTime, endTime, equipmentId } = data;

    // Validate time range
    if (startTime >= endTime) {
      throw new Error("startTime must be before endTime");
    }

    if (startTime <= new Date()) {
      throw new Error("Requested slot must be in the future");
    }

    // Check for duplicate pending request by same user for same time+equipment
    const duplicateRequest = await this.requestRepository
      .createQueryBuilder("req")
      .where("req.requestedBy = :requestedBy", { requestedBy })
      .andWhere("req.status = :status", { status: SlotRequestStatus.PENDING })
      .andWhere("req.startTime = :startTime", { startTime })
      .andWhere("req.endTime = :endTime", { endTime })
      .andWhere(
        equipmentId
          ? "req.equipmentId = :equipmentId"
          : "req.equipmentId IS NULL",
        equipmentId ? { equipmentId } : {},
      )
      .getOne();

    if (duplicateRequest) {
      throw new Error("You already have a pending request for this time slot");
    }

    // Check if a real slot already exists at this time+equipment
    await this.checkDuplicateSlot(startTime, endTime, equipmentId);

    const request = this.requestRepository.create({
      requestedBy,
      startTime,
      endTime,
      equipmentId: equipmentId || undefined,
      status: SlotRequestStatus.PENDING,
    });

    return await this.requestRepository.save(request);
  }

  /**
   * Get all slot requests (admin)
   */
  async getAllSlotRequests(): Promise<SlotRequest[]> {
    return await this.requestRepository.find({
      relations: ["requestedByUser", "equipment"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Get slot requests by user (user's own)
   */
  async getSlotRequestsByUser(userId: string): Promise<SlotRequest[]> {
    return await this.requestRepository.find({
      where: { requestedBy: userId },
      relations: ["requestedByUser", "equipment"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Approve a slot request (admin)
   * Creates a real slot owned by the REQUESTING USER
   */
  async approveSlotRequest(id: string): Promise<SlotRequest> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ["requestedByUser", "equipment"],
    });

    if (!request) {
      throw new Error("Slot request not found");
    }

    if (request.status !== SlotRequestStatus.PENDING) {
      throw new Error(`Cannot approve a request that is already ${request.status}`);
    }

    // Check if a slot already exists at this time+equipment before creating
    await this.checkDuplicateSlot(request.startTime, request.endTime, request.equipmentId);

    // Create real slot owned by the REQUESTING USER (not admin)
    await slotService.createSlot({
      userId: request.requestedBy,
      startTime: request.startTime,
      endTime: request.endTime,
      equipmentId: request.equipmentId,
    });

    // Update request status
    request.status = SlotRequestStatus.APPROVED;
    return await this.requestRepository.save(request);
  }

  /**
   * Reject a slot request (admin)
   */
  async rejectSlotRequest(id: string): Promise<SlotRequest> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ["requestedByUser", "equipment"],
    });

    if (!request) {
      throw new Error("Slot request not found");
    }

    if (request.status !== SlotRequestStatus.PENDING) {
      throw new Error(`Cannot reject a request that is already ${request.status}`);
    }

    request.status = SlotRequestStatus.REJECTED;
    return await this.requestRepository.save(request);
  }

  /**
   * Check if a real slot already exists with overlapping time + same equipment
   */
  private async checkDuplicateSlot(
    startTime: Date,
    endTime: Date,
    equipmentId?: string,
  ): Promise<void> {
    const query = this.slotRepository
      .createQueryBuilder("slot")
      .where("slot.startTime < :endTime", { endTime })
      .andWhere("slot.endTime > :startTime", { startTime });

    if (equipmentId) {
      query.andWhere("slot.equipmentId = :equipmentId", { equipmentId });
    }

    const existing = await query.getOne();

    if (existing) {
      throw new Error("A slot already exists at this time");
    }
  }
}

export const slotRequestService = new SlotRequestService();
