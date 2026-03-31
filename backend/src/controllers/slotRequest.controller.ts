import { Request, Response } from "express";
import { slotRequestService } from "../services/slotRequest.service";
import { UserRole } from "../entities/User.entity";

export class SlotRequestController {
  /**
   * Create a new slot request
   * POST /api/slot-requests
   */
  async createSlotRequest(req: Request, res: Response): Promise<void> {
    try {
      const { startTime, endTime, equipmentId } = req.body;
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

      const request = await slotRequestService.createSlotRequest({
        requestedBy: userId,
        startTime: parsedStart,
        endTime: parsedEnd,
        equipmentId: equipmentId || undefined,
      });

      res.status(201).json({
        message: "Slot request created successfully",
        data: request,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create slot request" });
      }
    }
  }

  /**
   * Get slot requests
   * GET /api/slot-requests
   * Admin: all requests | User: own requests only
   */
  async getSlotRequests(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user!;

      let requests;
      if (user.role === UserRole.ADMIN) {
        requests = await slotRequestService.getAllSlotRequests();
      } else {
        requests = await slotRequestService.getSlotRequestsByUser(user.userId);
      }

      res.status(200).json({ data: requests });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch slot requests" });
    }
  }

  /**
   * Approve a slot request (admin only)
   * POST /api/slot-requests/:id/approve
   */
  async approveSlotRequest(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const request = await slotRequestService.approveSlotRequest(id);

      res.status(200).json({
        message: "Slot request approved and slot created",
        data: request,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to approve slot request" });
      }
    }
  }

  /**
   * Reject a slot request (admin only)
   * POST /api/slot-requests/:id/reject
   */
  async rejectSlotRequest(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const request = await slotRequestService.rejectSlotRequest(id);

      res.status(200).json({
        message: "Slot request rejected",
        data: request,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to reject slot request" });
      }
    }
  }
}

export const slotRequestController = new SlotRequestController();
