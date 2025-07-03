import { Check, Clock, PillBottle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatTime, getStatusColor, getStatusIcon } from "@/lib/utils";

interface ScheduleItem {
  id: number;
  medicationId: number;
  scheduledTime: string;
  status: string;
  medication: {
    name: string;
    dosage: string;
  };
}

interface TodayScheduleProps {
  schedule: ScheduleItem[];
}

export default function TodaySchedule({ schedule }: TodayScheduleProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markTakenMutation = useMutation({
    mutationFn: async (logId: number) => {
      await apiRequest("POST", `/api/medication-logs/${logId}/mark-taken`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Medication marked as taken!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark medication as taken",
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'taken':
        return 'default';
      case 'missed':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'taken':
        return 'Taken';
      case 'missed':
        return 'Missed';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getStatusIconComponent = (status: string) => {
    switch (status) {
      case 'taken':
        return <Check className="text-white w-6 h-6" />;
      case 'missed':
        return <PillBottle className="text-white w-6 h-6" />;
      case 'pending':
        return <Clock className="text-white w-6 h-6" />;
      default:
        return <PillBottle className="text-white w-6 h-6" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <PillBottle className="text-medical-blue mr-3 w-5 h-5" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {schedule.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            <PillBottle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p>No medications scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${getStatusColor(item.status)} rounded-full flex items-center justify-center`}>
                    {getStatusIconComponent(item.status)}
                  </div>
                  <div>
                    <h3 className="font-medium text-primary">{item.medication.name}</h3>
                    <p className="text-sm text-secondary">{item.medication.dosage}</p>
                    <p className="text-xs text-secondary">
                      {formatTime(item.scheduledTime)} - {getStatusText(item.status)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {item.status === 'pending' && (
                    <Button
                      onClick={() => markTakenMutation.mutate(item.id)}
                      disabled={markTakenMutation.isPending}
                      className="bg-medical-blue hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      {markTakenMutation.isPending ? "Marking..." : "Mark Taken"}
                    </Button>
                  )}
                  <Badge 
                    variant={getStatusBadgeVariant(item.status)}
                    className={
                      item.status === 'taken' ? 'bg-taken-green hover:bg-taken-green' :
                      item.status === 'missed' ? 'bg-missed-red hover:bg-missed-red' :
                      'bg-pending-orange hover:bg-pending-orange text-white'
                    }
                  >
                    {getStatusText(item.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
