import { TrendingUp, PillBottle, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  weeklyAdherence: number;
  activeMedications: number;
  missedToday: number;
  nextDose: string;
}

export default function StatsCards({ 
  weeklyAdherence, 
  activeMedications, 
  missedToday, 
  nextDose 
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">This Week</p>
              <p className="text-2xl font-semibold text-taken-green">{weeklyAdherence}%</p>
              <p className="text-xs text-secondary">Adherence Rate</p>
            </div>
            <div className="w-12 h-12 bg-taken-green bg-opacity-10 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-taken-green w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Active Meds</p>
              <p className="text-2xl font-semibold text-medical-blue">{activeMedications}</p>
              <p className="text-xs text-secondary">Currently Taking</p>
            </div>
            <div className="w-12 h-12 bg-medical-blue bg-opacity-10 rounded-lg flex items-center justify-center">
              <PillBottle className="text-medical-blue w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Missed Today</p>
              <p className="text-2xl font-semibold text-missed-red">{missedToday}</p>
              <p className="text-xs text-secondary">Doses</p>
            </div>
            <div className="w-12 h-12 bg-missed-red bg-opacity-10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-missed-red w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Next Dose</p>
              <p className="text-2xl font-semibold text-pending-orange">{nextDose}</p>
              <p className="text-xs text-secondary">Time</p>
            </div>
            <div className="w-12 h-12 bg-pending-orange bg-opacity-10 rounded-lg flex items-center justify-center">
              <Clock className="text-pending-orange w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
