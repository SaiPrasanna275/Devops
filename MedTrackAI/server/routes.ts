import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMedicationSchema, insertMedicationLogSchema } from "@shared/schema";
import { generateAIInsights, generateSmartReminder } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for DevOps monitoring
  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: "1.0.0"
    });
  });

  // Metrics endpoint for Prometheus
  app.get("/api/metrics", async (req, res) => {
    try {
      const [activeMedications, totalLogs] = await Promise.all([
        storage.getActiveMedicationsCount(),
        storage.getTodayLogs()
      ]);

      res.set('Content-Type', 'text/plain');
      res.send(`
# HELP medtracker_active_medications_total Total number of active medications
# TYPE medtracker_active_medications_total gauge
medtracker_active_medications_total ${activeMedications}

# HELP medtracker_daily_logs_total Total number of medication logs today
# TYPE medtracker_daily_logs_total gauge
medtracker_daily_logs_total ${totalLogs.length}

# HELP medtracker_app_uptime_seconds Application uptime in seconds
# TYPE medtracker_app_uptime_seconds counter
medtracker_app_uptime_seconds ${process.uptime()}
      `.trim());
    } catch (error) {
      res.status(500).send('# Error collecting metrics');
    }
  });

  // Medication routes
  app.get("/api/medications", async (req, res) => {
    try {
      const medications = await storage.getMedications();
      res.json(medications);
    } catch (error) {
      console.error('Error fetching medications:', error);
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });

  app.get("/api/medications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const medication = await storage.getMedication(id);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.json(medication);
    } catch (error) {
      console.error('Error fetching medication:', error);
      res.status(500).json({ message: "Failed to fetch medication" });
    }
  });

  app.post("/api/medications", async (req, res) => {
    try {
      const validatedData = insertMedicationSchema.parse(req.body);
      const medication = await storage.createMedication(validatedData);
      res.status(201).json(medication);
    } catch (error) {
      console.error('Error creating medication:', error);
      res.status(400).json({ message: "Invalid medication data", error: (error as Error).message });
    }
  });

  app.put("/api/medications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMedicationSchema.partial().parse(req.body);
      const medication = await storage.updateMedication(id, validatedData);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.json(medication);
    } catch (error) {
      console.error('Error updating medication:', error);
      res.status(400).json({ message: "Invalid medication data", error: (error as Error).message });
    }
  });

  app.delete("/api/medications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMedication(id);
      if (!success) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.json({ message: "Medication deleted successfully" });
    } catch (error) {
      console.error('Error deleting medication:', error);
      res.status(500).json({ message: "Failed to delete medication" });
    }
  });

  // Medication log routes
  app.get("/api/medication-logs", async (req, res) => {
    try {
      const { medicationId, date } = req.query;
      const logs = await storage.getMedicationLogs(
        medicationId ? parseInt(medicationId as string) : undefined,
        date as string
      );
      res.json(logs);
    } catch (error) {
      console.error('Error fetching medication logs:', error);
      res.status(500).json({ message: "Failed to fetch medication logs" });
    }
  });

  app.post("/api/medication-logs", async (req, res) => {
    try {
      const validatedData = insertMedicationLogSchema.parse(req.body);
      const log = await storage.createMedicationLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      console.error('Error creating medication log:', error);
      res.status(400).json({ message: "Invalid log data", error: (error as Error).message });
    }
  });

  app.put("/api/medication-logs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMedicationLogSchema.partial().parse(req.body);
      const log = await storage.updateMedicationLog(id, validatedData);
      if (!log) {
        return res.status(404).json({ message: "Medication log not found" });
      }
      res.json(log);
    } catch (error) {
      console.error('Error updating medication log:', error);
      res.status(400).json({ message: "Invalid log data", error: (error as Error).message });
    }
  });

  app.post("/api/medication-logs/:id/mark-taken", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const log = await storage.updateMedicationLog(id, {
        status: "taken",
        takenAt: new Date(),
      });
      if (!log) {
        return res.status(404).json({ message: "Medication log not found" });
      }
      res.json(log);
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      res.status(500).json({ message: "Failed to mark medication as taken" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const [weeklyAdherence, activeMedications, missedToday, todayLogs] = await Promise.all([
        storage.getWeeklyAdherence(),
        storage.getActiveMedicationsCount(),
        storage.getMissedTodayCount(),
        storage.getTodayLogs(),
      ]);

      // Calculate next dose
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const upcomingLogs = todayLogs
        .filter(log => log.status === "pending" && log.scheduledTime > currentTime)
        .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

      const nextDose = upcomingLogs.length > 0 ? upcomingLogs[0] : null;
      let nextDoseText = "None today";
      
      if (nextDose) {
        const medication = await storage.getMedication(nextDose.medicationId);
        const [hours, minutes] = nextDose.scheduledTime.split(':').map(Number);
        const nextTime = new Date();
        nextTime.setHours(hours, minutes, 0, 0);
        const diffMs = nextTime.getTime() - now.getTime();
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
        nextDoseText = diffHours > 0 ? `${diffHours}h` : "Soon";
      }

      res.json({
        weeklyAdherence,
        activeMedications,
        missedToday,
        nextDose: nextDoseText,
        todayLogs,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Today's schedule
  app.get("/api/dashboard/today", async (req, res) => {
    try {
      const todayLogs = await storage.getTodayLogs();
      const medicationsMap = new Map();
      
      // Get medication details for each log
      for (const log of todayLogs) {
        if (!medicationsMap.has(log.medicationId)) {
          const medication = await storage.getMedication(log.medicationId);
          medicationsMap.set(log.medicationId, medication);
        }
      }

      const schedule = todayLogs.map(log => ({
        ...log,
        medication: medicationsMap.get(log.medicationId),
      }));

      res.json(schedule);
    } catch (error) {
      console.error('Error fetching today\'s schedule:', error);
      res.status(500).json({ message: "Failed to fetch today's schedule" });
    }
  });

  // AI Insights
  app.get("/api/ai/insights", async (req, res) => {
    try {
      const [weeklyAdherence, missedToday, activeMedications, recentLogs] = await Promise.all([
        storage.getWeeklyAdherence(),
        storage.getMissedTodayCount(),
        storage.getActiveMedicationsCount(),
        storage.getTodayLogs(),
      ]);

      const insights = await generateAIInsights({
        adherenceRate: weeklyAdherence,
        missedToday,
        activeMedications,
        recentLogs,
      });

      res.json(insights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      res.status(500).json({ message: "Failed to generate AI insights" });
    }
  });

  // Smart reminder
  app.post("/api/ai/reminder", async (req, res) => {
    try {
      const { medicationName, time, context } = req.body;
      const reminder = await generateSmartReminder(medicationName, time, context);
      res.json({ reminder });
    } catch (error) {
      console.error('Error generating smart reminder:', error);
      res.status(500).json({ message: "Failed to generate smart reminder" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}