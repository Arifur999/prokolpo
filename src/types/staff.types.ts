// prokolpo-backend's admin panel second step (internal/staff).
export type StaffRole = "super_admin" | "support" | "billing";

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
