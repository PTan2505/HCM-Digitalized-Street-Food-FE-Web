export interface WorkSchedule {
  weekdays: number[];
  openTime: string;
  closeTime: string;
}

export interface DayOff {
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
}

export interface WorkScheduleResponse {
  message: string;
  success: boolean;
}

export interface DayOffResponse {
  message: string;
  success: boolean;
}
