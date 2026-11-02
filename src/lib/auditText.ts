import type { IAuditLine } from "@/types/admin.types";
import type { Translate } from "./activityText";

// Actions the admin log words; anything newer shows its raw name until it gets copy.
const KNOWN = new Set(["2fa_enable", "login", "login_backup", "login_failed", "login_locked"]);

// One admin log line as a sentence after the staff member's name (boards AdminDashboard,
// AdminAudit); t is the "Admin.audit" namespace. The reason, when given, shows under it.
export const auditLine = (line: Pick<IAuditLine, "action" | "summary" | "details">, t: Translate) => {
  const key = line.action.replaceAll(".", "_");
  return {
    text: KNOWN.has(key) ? t(key, { name: line.summary, ...line.details }) : t("other", { action: line.action }),
    reason: line.details.reason ?? null,
  };
};
