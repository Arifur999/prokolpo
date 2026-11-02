import type { IAuditLine } from "@/types/admin.types";
import type { Translate } from "./activityText";

// One admin log line as a sentence after the staff member's name (boards AdminDashboard,
// AdminAudit); t is the "Admin.audit" namespace and has tells whether it words a key, so an
// action without copy yet shows its raw name. The reason, when given, shows under it.
export const auditLine = (line: Pick<IAuditLine, "action" | "summary" | "details">, t: Translate, has: (key: string) => boolean) => {
  const key = line.action.replaceAll(".", "_");
  return {
    text: key !== "other" && has(key) ? t(key, { name: line.summary, ...line.details }) : t("other", { action: line.action }),
    reason: line.details.reason ?? null,
  };
};
