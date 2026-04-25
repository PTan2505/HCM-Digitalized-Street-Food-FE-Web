export type WeekdayName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface WorkSchedule {
  weekdays: number[];
  openTime: string;
  closeTime: string;
}

export interface UpdateWorkSchedule {
  weekday: number;
  openTime: string;
  closeTime: string;
}

export interface WorkScheduleItem {
  workScheduleId: number;
  branchId: number;
  weekday: number;
  openTime: string;
  closeTime: string;
  branch: null;
}

export interface GetWorkScheduleItem {
  workScheduleId: number;
  branchId: number;
  weekday: number;
  weekdayName: WeekdayName;
  openTime: string;
  closeTime: string;
}

export type WorkScheduleResponse = WorkScheduleItem[];

export type GetWorkScheduleResponse = GetWorkScheduleItem[];

export interface DayOff {
  startDate: string;
  endDate: string;
}

export interface DayOffResponse {
  dayOffId: number;
  branchId: number;
  startDate: string;
  endDate: string;
  branch?: null;
}

export type GetDayOffResponse = DayOffResponse[];
