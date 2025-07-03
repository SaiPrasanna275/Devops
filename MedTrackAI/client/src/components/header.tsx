import { Bell, PillBottle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onAddMedication: () => void;
  notificationCount?: number;
}

export default function Header({ onAddMedication, notificationCount = 0 }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center">
              <PillBottle className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-semibold text-primary">MedTracker Pro</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#dashboard" className="text-medical-blue font-medium border-b-2 border-medical-blue pb-4">
              Dashboard
            </a>
            <a href="#medications" className="text-secondary hover:text-primary pb-4 transition-colors">
              Medications
            </a>
            <a href="#calendar" className="text-secondary hover:text-primary pb-4 transition-colors">
              Calendar
            </a>
            <a href="#reports" className="text-secondary hover:text-primary pb-4 transition-colors">
              Reports
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={onAddMedication}
              className="bg-medical-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <span className="text-lg">+</span>
              <span>Add Medication</span>
            </Button>
            
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-secondary hover:text-primary" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </div>
            
            <div className="w-8 h-8 bg-health-green rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
