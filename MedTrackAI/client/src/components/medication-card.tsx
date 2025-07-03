import { Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTime, getAdherenceColor } from "@/lib/utils";

interface MedicationCardProps {
  medication: {
    id: number;
    name: string;
    dosage: string;
    frequency: string;
    times: string[];
    prescribedBy?: string;
    isActive: boolean;
  };
  onEdit: (medication: any) => void;
  onDelete: (id: number) => void;
}

export default function MedicationCard({ medication, onEdit, onDelete }: MedicationCardProps) {
  // Mock adherence data for demonstration
  const mockAdherence = 86;
  const mockWeekData = [true, true, true, true, true, false, true]; // 6/7 = 86%

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-medium text-primary">{medication.name}</h3>
              <Badge className="bg-health-green hover:bg-health-green text-white">
                Active
              </Badge>
            </div>
            <div className="text-sm text-secondary space-y-1">
              <p>
                <span className="font-medium">Dosage:</span> {medication.dosage}
              </p>
              <p>
                <span className="font-medium">Frequency:</span> {medication.frequency}
              </p>
              <p>
                <span className="font-medium">Times:</span>{" "}
                {medication.times.map(formatTime).join(", ")}
              </p>
              {medication.prescribedBy && (
                <p>
                  <span className="font-medium">Prescribed by:</span> {medication.prescribedBy}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(medication)}
              className="text-secondary hover:text-medical-blue"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(medication.id)}
              className="text-secondary hover:text-missed-red"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">Last 7 days adherence:</span>
            <div className="flex items-center space-x-1">
              {mockWeekData.map((taken, index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-sm ${
                    taken ? "bg-taken-green" : "bg-missed-red"
                  }`}
                />
              ))}
              <span className={`ml-2 font-medium text-${getAdherenceColor(mockAdherence)}`}>
                {mockAdherence}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
