import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'taken':
      return 'bg-taken-green';
    case 'missed':
      return 'bg-missed-red';
    case 'pending':
      return 'bg-pending-orange';
    default:
      return 'bg-gray-500';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'taken':
      return 'fas fa-check';
    case 'missed':
      return 'fas fa-exclamation-triangle';
    case 'pending':
      return 'fas fa-clock';
    default:
      return 'fas fa-pills';
  }
}

export function calculateTimeDifference(targetTime: string): string {
  const now = new Date();
  const [hours, minutes] = targetTime.split(':').map(Number);
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  
  const diffMs = target.getTime() - now.getTime();
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  
  if (diffHours <= 0) return 'Now';
  if (diffHours === 1) return '1h';
  return `${diffHours}h`;
}

export function getAdherenceColor(percentage: number): string {
  if (percentage >= 90) return 'taken-green';
  if (percentage >= 75) return 'pending-orange';
  return 'missed-red';
}
