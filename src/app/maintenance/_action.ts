"use server";

import { getPlatformStatus } from "@/services/status.services";

// The retry button asks the API directly, skipping the 10-second cache.
export const checkMaintenanceAction = async (): Promise<{ isOver: boolean; checkedAt: string }> => {
  const status = await getPlatformStatus({ fresh: true });
  return { isOver: status !== null && !status.maintenance.enabled, checkedAt: new Date().toISOString() };
};
