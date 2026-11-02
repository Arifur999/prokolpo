"use server";

import { getTranslations } from "next-intl/server";
import { runAction } from "@/lib/runAction";
import { getActivity } from "@/services/members.services";
import type { ApiResult } from "@/types/api.types";
import type { IActivityItem } from "@/types/members.types";

// "আরও আগের অ্যাক্টিভিটি দেখুন": the page of entries before the oldest one shown, same filters.
export const olderActivityAction = async (projectId: string, filters: Record<string, string>, before: string): Promise<ApiResult<IActivityItem[]>> =>
  runAction((await getTranslations("Activity"))("failed"), () => getActivity(projectId, { ...filters, before }));
