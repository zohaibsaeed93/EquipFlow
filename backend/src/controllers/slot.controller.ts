import { Request, Response } from "express";
import { slotService } from "../services/slot.service";
import { UserRole } from "../entities/User.entity";

export class SlotController {
  /**
   * Create a new availability slot
   * POST /api/slots
   */
  async createSlot(req: Request, res: Response): Promise<void> {
    try {
      const { startTime, endTime } = req.body;
      const userId = req.user!.userId;

      if (!startTime || !endTime) {
        res.status(400).json({
          error: "Missing required fields",
          required: ["startTime", "endTime"],
        });
        return;
      }

      const parsedStart = new Date(startTime);
      const parsedEnd = new Date(endTime);

      if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
        res.status(400).json({ error: "Invalid date format" });
        return;
      }

      const slot = await slotService.createSlot({
        userId,
        startTime: parsedStart,
        endTime: parsedEnd,
      });

      res.status(201).json({
        message: "Availability slot created successfully",
        data: slot,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create slot" });
      }
    }
  }

  /**
   * Get all slots
   * GET /api/slots
   * Query params: ?userId=xxx&available=true
   */
  async getSlots(req: Request, res: Response): Promise<void> {
    try {
      const { userId, available } = req.query;

      if (available === "true") {
        const slots = await slotService.getAvailableSlots();
        res.status(200).json({ data: slots });
        return;
      }

      const slots = await slotService.getAllSlots(userId as string | undefined);
      res.status(200).json({ data: slots });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch slots" });
    }
  }

  /**
   * Get a single slot
   * GET /api/slots/:id
   */
  async getSlotById(req: Request, res: Response): Promise<void> {
    try {
      const slot = await slotService.getSlotById(req.params.id as string);

      if (!slot) {
        res.status(404).json({ error: "Slot not found" });
        return;
      }

      res.status(200).json({ data: slot });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch slot" });
    }
  }

  /**
   * Delete a slot
   * DELETE /api/slots/:id
   */
  async deleteSlot(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const isAdmin = req.user!.role === UserRole.ADMIN;

      await slotService.deleteSlot(req.params.id as string, userId, isAdmin);

      res.status(200).json({ message: "Slot deleted successfully" });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Slot not found") {
          res.status(404).json({ error: error.message });
        } else if (error.message === "Not authorized to delete this slot") {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: "Failed to delete slot" });
      }
    }
  }
}

export const slotController = new SlotController();
