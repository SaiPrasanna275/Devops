import { medications, medicationLogs, type Medication, type InsertMedication, type MedicationLog, type InsertMedicationLog } from "@shared/schema";

export interface IStorage {
  // Medication CRUD
  getMedications(): Promise<Medication[]>;
  getMedication(id: number): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication | undefined>;
  deleteMedication(id: number): Promise<boolean>;

  // Medication Logs CRUD
  getMedicationLogs(medicationId?: number, date?: string): Promise<MedicationLog[]>;
  createMedicationLog(log: InsertMedicationLog): Promise<MedicationLog>;
  updateMedicationLog(id: number, log: Partial<InsertMedicationLog>): Promise<MedicationLog | undefined>;
  
  // Utility methods
  getTodayLogs(): Promise<MedicationLog[]>;
  getWeeklyAdherence(): Promise<number>;
  getActiveMedicationsCount(): Promise<number>;
  getMissedTodayCount(): Promise<number>;
}

export class MemStorage implements IStorage {
  private medications: Map<number, Medication>;
  private medicationLogs: Map<number, MedicationLog>;
  private currentMedicationId: number;
  private currentLogId: number;

  constructor() {
    this.medications = new Map();
    this.medicationLogs = new Map();
    this.currentMedicationId = 1;
    this.currentLogId = 1;
  }

  async getMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(med => med.isActive);
  }

  async getMedication(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const id = this.currentMedicationId++;
    const medication: Medication = {
      ...insertMedication,
      id,
      createdAt: new Date(),
      prescribedBy: insertMedication.prescribedBy || null,
      instructions: insertMedication.instructions || null,
      isActive: insertMedication.isActive ?? true,
      enableSmartReminders: insertMedication.enableSmartReminders ?? false,
    };
    this.medications.set(id, medication);

    // Create initial logs for today
    const today = new Date().toISOString().split('T')[0];
    for (const time of medication.times) {
      await this.createMedicationLog({
        medicationId: id,
        scheduledTime: time,
        status: "pending",
        date: today,
        takenAt: null,
      });
    }

    return medication;
  }

  async updateMedication(id: number, updates: Partial<InsertMedication>): Promise<Medication | undefined> {
    const medication = this.medications.get(id);
    if (!medication) return undefined;

    const updated: Medication = { ...medication, ...updates };
    this.medications.set(id, updated);
    return updated;
  }

  async deleteMedication(id: number): Promise<boolean> {
    const medication = this.medications.get(id);
    if (!medication) return false;

    // Soft delete
    const updated: Medication = { ...medication, isActive: false };
    this.medications.set(id, updated);
    return true;
  }

  async getMedicationLogs(medicationId?: number, date?: string): Promise<MedicationLog[]> {
    let logs = Array.from(this.medicationLogs.values());
    
    if (medicationId) {
      logs = logs.filter(log => log.medicationId === medicationId);
    }
    
    if (date) {
      logs = logs.filter(log => log.date === date);
    }
    
    return logs.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }

  async createMedicationLog(insertLog: InsertMedicationLog): Promise<MedicationLog> {
    const id = this.currentLogId++;
    const log: MedicationLog = {
      id,
      medicationId: insertLog.medicationId,
      scheduledTime: insertLog.scheduledTime,
      status: insertLog.status,
      date: insertLog.date,
      takenAt: insertLog.takenAt || null,
      createdAt: new Date(),
    };
    this.medicationLogs.set(id, log);
    return log;
  }

  async updateMedicationLog(id: number, updates: Partial<InsertMedicationLog>): Promise<MedicationLog | undefined> {
    const log = this.medicationLogs.get(id);
    if (!log) return undefined;

    const updated: MedicationLog = { ...log, ...updates };
    this.medicationLogs.set(id, updated);
    return updated;
  }

  async getTodayLogs(): Promise<MedicationLog[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getMedicationLogs(undefined, today);
  }

  async getWeeklyAdherence(): Promise<number> {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const logs = Array.from(this.medicationLogs.values()).filter(log => {
      const logDate = new Date(log.date);
      return logDate >= weekAgo && logDate <= today;
    });

    if (logs.length === 0) return 0;

    const takenLogs = logs.filter(log => log.status === "taken");
    return Math.round((takenLogs.length / logs.length) * 100);
  }

  async getActiveMedicationsCount(): Promise<number> {
    return Array.from(this.medications.values()).filter(med => med.isActive).length;
  }

  async getMissedTodayCount(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = await this.getMedicationLogs(undefined, today);
    return todayLogs.filter(log => log.status === "missed").length;
  }
}

export const storage = new MemStorage();
