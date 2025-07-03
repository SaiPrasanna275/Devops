import { Bot, TrendingUp, Lightbulb, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface AIInsight {
  type: "reminder" | "achievement" | "suggestion" | "warning";
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
}

export default function AIInsights() {
  const { data: insights = [], isLoading } = useQuery<AIInsight[]>({
    queryKey: ["/api/ai/insights"],
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return <TrendingUp className="w-4 h-4" />;
      case "suggestion":
        return <Lightbulb className="w-4 h-4" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "achievement":
        return "border-health-green bg-green-50";
      case "suggestion":
        return "border-pending-orange bg-orange-50";
      case "warning":
        return "border-missed-red bg-red-50";
      default:
        return "border-medical-blue bg-blue-50";
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "achievement":
        return "border-l-health-green";
      case "suggestion":
        return "border-l-pending-orange";
      case "warning":
        return "border-l-missed-red";
      default:
        return "border-l-medical-blue";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Bot className="text-medical-blue mr-3 w-5 h-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-100 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Bot className="text-medical-blue mr-3 w-5 h-5" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p>No insights available at the moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${getInsightColor(insight.type)} ${getBorderColor(insight.type)}`}
              >
                <div className="flex items-start space-x-2">
                  <div className="mt-0.5">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-primary font-medium mb-1">
                      {insight.title}
                    </p>
                    <p className="text-sm text-secondary">
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
