import { EntityManager, Repository } from "typeorm";
import { AppDataSource } from "../../config/database";
import { Booking, BookingStatus } from "../entities/Booking.entity";
import { AvailabilitySlot } from "../entities/AvailabilitySlot.entity";
import { Equipment } from "../entities/Equipment.entity";
import { EquipmentRequirement } from "../entities/EquipmentRequirement.entity";
import { ResourceDependency } from "../entities/ResourceDependency.entity";
import { UserCertification } from "../entities/UserCertification.entity";

export class HttpError extends Error {
  statusCode: number;
  details?: Record<string, unknown>;

  constructor(
    statusCode: number,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class BookingService {
  private bookingRepository: Repository<Booking>;
  private slotRepository: Repository<AvailabilitySlot>;

  constructor() {
    this.bookingRepository = AppDataSource.getRepository(Booking);
    this.slotRepository = AppDataSource.getRepository(AvailabilitySlot);
  }

  private validateTime(startTime: Date, endTime: Date): void {
    if (!(startTime instanceof Date) || Number.isNaN(startTime.getTime())) {
      throw new HttpError(400, "Invalid start time");
    }

    if (!(endTime instanceof Date) || Number.isNaN(endTime.getTime())) {
      throw new HttpError(400, "Invalid end time");
    }

    if (startTime >= endTime) {
      throw new HttpError(400, "startTime must be before endTime");
    }
  }

  private validateFutureDate(startTime: Date): void {
    if (startTime < new Date()) {
      throw new HttpError(400, "Booking must be in the future");
    }
  }

  private async validateCertifications(
    manager: EntityManager,
    userId: string,
    equipmentIds: string[],
  ): Promise<void> {
    if (equipmentIds.length === 0) {
      return;
    }

    const required = await manager
      .getRepository(EquipmentRequirement)
      .createQueryBuilder("requirement")
      .leftJoinAndSelect("requirement.certification", "certification")
      .where("requirement.equipmentId IN (:...equipmentIds)", { equipmentIds })
      .getMany();

    if (required.length === 0) {
      return;
    }

    const requiredCertIdToName = new Map<string, string>();
    for (const item of required) {
      requiredCertIdToName.set(item.certificationId, item.certification.name);
    }

    const userCerts = await manager
      .getRepository(UserCertification)
      .createQueryBuilder("userCertification")
      .where("userCertification.userId = :userId", { userId })
      .getMany();

    const userCertIdSet = new Set(
      userCerts.map((cert) => cert.certificationId),
    );
    const missing = [...requiredCertIdToName.entries()]
      .filter(([certificationId]) => !userCertIdSet.has(certificationId))
      .map(([, certificationName]) => certificationName)
      .sort((a, b) => a.localeCompare(b));

    if (missing.length > 0) {
      throw new HttpError(403, "Missing certifications", {
        error: "Missing certifications",
        missing,
      });
    }
  }

  private async resolveDependenciesRecursive(
    manager: EntityManager,
    equipmentId: string,
    visited: Set<string> = new Set<string>(),
    chain: Set<string> = new Set<string>(),
  ): Promise<string[]> {
    if (visited.has(equipmentId)) {
      return [...chain];
    }

    visited.add(equipmentId);

    const directDependencies = await manager
      .getRepository(ResourceDependency)
      .createQueryBuilder("dependency")
      .where("dependency.equipmentId = :equipmentId", { equipmentId })
      .getMany();

    for (const dependency of directDependencies) {
      const dependentId = dependency.dependsOnEquipmentId;
      if (!chain.has(dependentId)) {
        chain.add(dependentId);
      }

      await this.resolveDependenciesRecursive(
        manager,
        dependentId,
        visited,
        chain,
      );
    }

    return [...chain];
  }

  private async lockEquipmentSet(
    manager: EntityManager,
    equipmentIds: string[],
  ): Promise<void> {
    if (equipmentIds.length === 0) {
      return;
    }

    await manager
      .getRepository(Equipment)
      .createQueryBuilder("equipment")
      .setLock("pessimistic_write")
      .where("equipment.id IN (:...equipmentIds)", { equipmentIds })
      .getMany();
  }

  private async validateEquipmentAvailability(
    manager: EntityManager,
    equipmentIds: string[],
    newStart: Date,
    newEnd: Date,
  ): Promise<void> {
    if (equipmentIds.length === 0) {
      throw new HttpError(400, "No equipment provided for availability check");
    }

    const conflict = await manager
      .getRepository(Booking)
      .createQueryBuilder("booking")
      .innerJoin("booking.slot", "slot")
      .setLock("pessimistic_write")
      .where("booking.status = :status", { status: BookingStatus.BOOKED })
      .andWhere("slot.equipmentId IN (:...equipmentIds)", { equipmentIds })
      .andWhere("slot.startTime < :newEnd", { newEnd })
      .andWhere("slot.endTime > :newStart", { newStart })
      .getOne();

    if (conflict) {
      throw new HttpError(
        409,
        "One or more required equipment are not available for the selected time",
      );
    }
  }

  private async resolveMainEquipmentId(
    manager: EntityManager,
    equipmentId: string,
  ): Promise<string> {
    const equipment = await manager
      .getRepository(Equipment)
      .findOne({ where: { id: equipmentId } });

    if (equipment) {
      return equipment.id;
    }

    throw new HttpError(400, "Invalid equipmentId");
  }

  /**
   * Book a slot using a database transaction to prevent race conditions
   */
  async bookSlot(data: {
    slotId: string;
    bookedBy: string;
    equipmentId: string;
  }): Promise<Booking> {
    const { slotId, bookedBy, equipmentId } = data;

    if (!slotId || !bookedBy || !equipmentId) {
      throw new HttpError(400, "slotId, bookedBy and equipmentId are required");
    }

    // Use a transaction to prevent race conditions
    return await AppDataSource.transaction(async (manager) => {
      // Lock the slot row for update
      const slot = await manager
        .getRepository(AvailabilitySlot)
        .createQueryBuilder("slot")
        .setLock("pessimistic_write")
        .where("slot.id = :slotId", { slotId })
        .getOne();

      if (!slot) {
        throw new HttpError(400, "Slot not found");
      }

      this.validateTime(slot.startTime, slot.endTime);

      this.validateFutureDate(slot.startTime);

      const mainEquipmentId = await this.resolveMainEquipmentId(
        manager,
        equipmentId,
      );

      const dependencyEquipmentIds = await this.resolveDependenciesRecursive(
        manager,
        mainEquipmentId,
      );

      const involvedEquipmentIds = [
        ...new Set([mainEquipmentId, ...dependencyEquipmentIds]),
      ];

      await this.lockEquipmentSet(manager, involvedEquipmentIds);

      await this.validateCertifications(manager, bookedBy, [
        ...involvedEquipmentIds,
      ]);

      await this.validateEquipmentAvailability(
        manager,
        involvedEquipmentIds,
        slot.startTime,
        slot.endTime,
      );

      if (slot.isBooked) {
        throw new HttpError(409, "This slot is already booked");
      }

      if (slot.userId === bookedBy) {
        throw new HttpError(400, "You cannot book your own availability slot");
      }

      // Mark slot as booked
      slot.isBooked = true;
      await manager.save(slot);

      // Create booking record
      const booking = manager.getRepository(Booking).create({
        slotId,
        bookedBy,
        status: BookingStatus.BOOKED,
      });

      return await manager.save(booking);
    });
  }

  /**
   * Cancel a booking — only the booker or an admin can cancel
   */
  async cancelBooking(
    bookingId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<Booking> {
    return await AppDataSource.transaction(async (manager) => {
      const booking = await manager.getRepository(Booking).findOne({
        where: { id: bookingId },
        relations: ["slot"],
      });

      if (!booking) {
        throw new HttpError(404, "Booking not found");
      }

      if (booking.status === BookingStatus.CANCELLED) {
        throw new HttpError(409, "Booking is already cancelled");
      }

      if (booking.bookedBy !== userId && !isAdmin) {
        throw new HttpError(403, "Not authorized to cancel this booking");
      }

      // Update booking status
      booking.status = BookingStatus.CANCELLED;
      await manager.save(booking);

      // Mark slot as available again
      const slot = await manager
        .getRepository(AvailabilitySlot)
        .findOne({ where: { id: booking.slotId } });

      if (slot) {
        slot.isBooked = false;
        await manager.save(slot);
      }

      return booking;
    });
  }

  /**
   * Get all bookings for a user (bookings they made)
   */
  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { bookedBy: userId },
      relations: ["slot", "slot.user", "bookedByUser"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Get all bookings (admin)
   */
  async getAllBookings(): Promise<Booking[]> {
    return await this.bookingRepository.find({
      relations: ["slot", "slot.user", "bookedByUser"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Get a single booking by ID
   */
  async getBookingById(id: string): Promise<Booking | null> {
    return await this.bookingRepository.findOne({
      where: { id },
      relations: ["slot", "slot.user", "bookedByUser"],
    });
  }
}

export const bookingService = new BookingService();
