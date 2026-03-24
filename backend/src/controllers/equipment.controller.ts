import { Request, Response } from "express";
import { equipmentService } from "../services/equipment.service";

export class EquipmentController {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      res.json({ data: await equipmentService.getAllEquipment() });
    } catch {
      res.status(500).json({ error: "Failed to fetch equipment" });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, certificationIds } = req.body as { name: string; certificationIds?: string[] };
      if (!name) { res.status(400).json({ error: "name is required" }); return; }
      const equipment = await equipmentService.createEquipment(name, certificationIds);
      res.status(201).json({ message: "Equipment created", data: equipment });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create equipment";
      res.status(400).json({ error: msg });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params["id"]);
      await equipmentService.deleteEquipment(id);
      res.json({ message: "Equipment deleted" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete equipment";
      const status = msg === "Equipment not found" ? 404 : 400;
      res.status(status).json({ error: msg });
    }
  }

  async getAllCertifications(_req: Request, res: Response): Promise<void> {
    try {
      res.json({ data: await equipmentService.getAllCertifications() });
    } catch {
      res.status(500).json({ error: "Failed to fetch certifications" });
    }
  }

  async getUserCertifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = String(req.params["userId"]);
      res.json({ data: await equipmentService.getUserCertifications(userId) });
    } catch {
      res.status(500).json({ error: "Failed to fetch user certifications" });
    }
  }
}

export const equipmentController = new EquipmentController();
