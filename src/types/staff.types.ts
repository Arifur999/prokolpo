// prokolpo-backend's admin panel second step (internal/staff).
import type { StaffRole } from "./auth.types";

export interface IStaffStatus {
  enabled: boolean;
  name: string;
  phone: string;
  staffRole: StaffRole;
  backupLeft: number;
  lockedUntil: string | null;
}

export interface IStaffSetup {
  uri: string;
  key: string;
}

export interface IStaffEnabled {
  codes: string[];
  session: string;
}

export interface IStaffVerified {
  session: string;
  usedBackup: boolean;
  backupLeft: number;
}
