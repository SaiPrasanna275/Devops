import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, Download, Share, Bell, Zap, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import StatsCards from "@/components/stats-cards";
import TodaySchedule from "@/components/today-schedule";
import MedicationCard from "@/components/medication-card";
import MedicationForm from "@/components/medication-form";
import AIInsights from "@/components/ai-insights";

export default function Dashboard() {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch dashboard data
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: todaySchedule = [], isLoading: scheduleLoading } = useQuery({
    queryKey: ["/api/dashboard/today"],
  });

  const { data: medications = [], isLoading: medicationsLoading } = useQuery({
    queryKey: ["/api/medications"],
  });

  // Delete medication mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/medications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Medication deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete medication",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (medication: any) => {
    setEditingMedication(medication);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this medication?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredMedications = medications.filter((med: any) =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.dosage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const weekDays = [
    { name: "Monday", taken: 3, total: 3 },
    { name: "Tuesday", taken: 2, total: 3 },
    { name: "Today", taken: 1, total: 3 },
  ];

  if (statsLoading || scheduleLoading || medicationsLoading) {
    return (
      <div className="min-h-screen bg-neutral-bg">
        <Header onAddMedication={() => setIsAddFormOpen(true)} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Header onAddMedication={() => setIsAddFormOpen(true)} notificationCount={3} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-primary">Good morning, John</h1>
              <p className="text-secondary mt-1">
                You have <span className="font-medium text-pending-orange">{stats.activeMedications || 0} medications</span> scheduled for today
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards
            weeklyAdherence={stats.weeklyAdherence || 0}
            activeMedications={stats.activeMedications || 0}
            missedToday={stats.missedToday || 0}
            nextDose={stats.nextDose || "None"}
          />

          {/* Today's Schedule */}
          <div className="mb-6">
            <TodaySchedule schedule={todaySchedule} />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Medication List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center text-lg">
                    <Search className="text-medical-blue mr-3 w-5 h-5" />
                    All Medications
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="search"
                      placeholder="Search medications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Button variant="ghost" size="icon">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredMedications.length === 0 ? (
                  <div className="text-center py-8 text-secondary">
                    <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p>No medications found</p>
                    <Button
                      onClick={() => setIsAddFormOpen(true)}
                      className="mt-4 bg-medical-blue hover:bg-blue-700 text-white"
                    >
                      Add your first medication
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMedications.map((medication: any) => (
                      <MedicationCard
                        key={medication.id}
                        medication={medication}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Insights */}
            <AIInsights />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Zap className="text-medical-blue mr-3 w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left p-3 h-auto"
                  >
                    <span className="text-health-green mr-3">✓</span>
                    Mark all today's meds as taken
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left p-3 h-auto"
                  >
                    <Download className="text-medical-blue mr-3 w-4 h-4" />
                    Export medication history
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left p-3 h-auto"
                  >
                    <Share className="text-medical-blue mr-3 w-4 h-4" />
                    Share report with doctor
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left p-3 h-auto"
                  >
                    <Bell className="text-pending-orange mr-3 w-4 h-4" />
                    Adjust reminder settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Calendar Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="text-medical-blue mr-3 w-5 h-5" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {weekDays.map((day, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className={`text-sm font-medium ${day.name === "Today" ? "text-medical-blue" : "text-primary"}`}>
                        {day.name}
                      </span>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: day.total }, (_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < day.taken
                                ? "bg-taken-green"
                                : day.name === "Today" && i === day.taken
                                ? "bg-pending-orange"
                                : "bg-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-xs text-secondary">
                          {day.taken}/{day.total}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-4 gap-1">
          <Button variant="ghost" className="p-4 text-center text-medical-blue flex flex-col">
            <span className="text-lg mb-1">🏠</span>
            <span className="text-xs">Dashboard</span>
          </Button>
          <Button variant="ghost" className="p-4 text-center text-secondary flex flex-col">
            <span className="text-lg mb-1">💊</span>
            <span className="text-xs">Medications</span>
          </Button>
          <Button variant="ghost" className="p-4 text-center text-secondary flex flex-col">
            <span className="text-lg mb-1">📅</span>
            <span className="text-xs">Calendar</span>
          </Button>
          <Button variant="ghost" className="p-4 text-center text-secondary flex flex-col">
            <span className="text-lg mb-1">📊</span>
            <span className="text-xs">Reports</span>
          </Button>
        </div>
      </div>

      {/* Medication Forms */}
      <MedicationForm
        open={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
      />
      <MedicationForm
        open={!!editingMedication}
        onClose={() => setEditingMedication(null)}
        medication={editingMedication}
      />
    </div>
  );
}
